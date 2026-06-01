/**
 * OpenRouter Service — единственный провайдер для всех моделей генерации изображений.
 * Обрабатывает FLUX.2, Gemini и другие модели через /api/v1/chat/completions.
 *
 * Key rules from OpenRouter docs:
 *  - FLUX models (image-only): modalities: ["image"]
 *  - Gemini models (text+image): modalities: ["image", "text"]
 *  - image_size is NOT a valid chat-completions param — do NOT send it.
 *  - Response images live in choices[0].message.images[]
 *    with either .imageUrl.url (SDK) or .image_url.url (raw fetch).
 *
 * Parallel generation with retries:
 *  - Requests are made in parallel instead of a slow sequential loop.
 *  - Each single request has automatic 1-retry support if it fails or returns 0 images.
 *  - Errors of partial failures are logged; if at least one image succeeds, it returns all successes.
 */

import * as log from './logService';

const OR_KEY_STORAGE = 'nano_pixel_or_key';

/**
 * Returns the single OpenRouter API key used for ALL models.
 */
export const getOpenRouterKey = (): string => {
  return localStorage.getItem(OR_KEY_STORAGE) || '';
};

/** Determine the correct modalities array for a given model. */
const getModalities = (modelId: string): string[] => {
  // Gemini models output both text and images
  if (modelId.startsWith('google/')) {
    return ['image', 'text'];
  }
  // FLUX and other image-only models
  return ['image'];
};

/**
 * Safely extract all image URLs from an OpenRouter chat completion response.
 * Handles both camelCase (imageUrl) and snake_case (image_url) variants
 * that appear across different OpenRouter SDK / raw-fetch responses.
 */
const extractImagesFromChoice = (choice: any): string[] => {
  const urls: string[] = [];

  // Primary path: choice.message.images[]
  if (choice?.message?.images && Array.isArray(choice.message.images)) {
    for (const img of choice.message.images) {
      // Handle both image_url and imageUrl variants
      const url = img?.image_url?.url || img?.imageUrl?.url || img?.url;
      if (url) urls.push(url);
    }
  }

  // Fallback: image data embedded in content parts
  if (urls.length === 0 && Array.isArray(choice?.message?.content)) {
    for (const part of choice.message.content) {
      if (part.type === 'image_url') {
        const url = part.image_url?.url || part.imageUrl?.url;
        if (url) urls.push(url);
      }
    }
  }

  // Fallback: entire content is a data URL string
  if (urls.length === 0 && typeof choice?.message?.content === 'string') {
    const content = choice.message.content.trim();
    if (content.startsWith('data:image')) {
      urls.push(content);
    } else if (content.startsWith('http')) {
      urls.push(content);
    }
  }

  return urls;
};

/**
 * Helper to fetch a single image from OpenRouter with retry support.
 */
const fetchSingleImageWithRetry = async (
  prompt: string,
  aspectRatio: string,
  modelId: string,
  key: string,
  maxRetries = 1
): Promise<string[]> => {
  let lastError: any = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Wait a short bit before retry to prevent immediate double-rate-limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
        log.info('OpenRouter', `Повторная попытка генерации для ${modelId} (попытка ${attempt}/${maxRetries})`);
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'NanoPixel Studio 24',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                }
              ]
            }
          ],
          modalities: getModalities(modelId),
          image_config: {
            aspect_ratio: aspectRatio
          },
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMsg = errorData?.error?.message || errorData?.message || `Ошибка OpenRouter (${response.status}): ${response.statusText}`;
        
        // Deep dive into OpenRouter moderation errors
        const rawMetadata = errorData?.error?.metadata?.raw;
        if (rawMetadata) {
          try {
            const parsedRaw = JSON.parse(rawMetadata);
            if (parsedRaw.status === 'Request Moderated') {
              const reasons = parsedRaw.details?.['Moderation Reasons']?.join(', ');
              errorMsg = `Запрос отклонен модерацией провайдера${reasons ? `: ${reasons}` : ''}. Пожалуйста, измените текст запроса.`;
            }
          } catch (e) {
            // ignore parse errors
          }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const images = extractImagesFromChoice(choice);
      
      if (images.length === 0) {
        // Check if model returned a textual error inside the message content instead of an image URL
        const textContent = choice?.message?.content;
        if (textContent && (textContent.toLowerCase().includes('error') || textContent.toLowerCase().includes('limit') || textContent.toLowerCase().includes('exceeded'))) {
          throw new Error(`Модель вернула ошибку вместо изображения: "${textContent}"`);
        }
        throw new Error('Модель ответила успешным статусом, но не вернула URL изображений.');
      }
      
      return images;
    } catch (err: any) {
      lastError = err;
      log.warn('OpenRouter', `Попытка ${attempt + 1} генерации изображения не удалась`, { error: err.message });
    }
  }
  
  throw lastError || new Error('Неизвестная ошибка при генерации изображения');
};

/**
 * Helper to fetch a single image edit from OpenRouter with retry support.
 */
const fetchSingleEditWithRetry = async (
  imageDataUrl: string,
  prompt: string,
  aspectRatio: string,
  modelId: string,
  key: string,
  additionalImages: { mimeType: string; data: string }[],
  maxRetries = 1
): Promise<string[]> => {
  let lastError: any = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        // Wait a short bit before retry
        await new Promise(resolve => setTimeout(resolve, 1500));
        log.info('OpenRouter', `Повторная попытка изменения для ${modelId} (попытка ${attempt}/${maxRetries})`);
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'NanoPixel Studio 24',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageDataUrl,
                  },
                },
                ...additionalImages.map(img => ({
                  type: 'image_url' as const,
                  image_url: {
                    url: `data:${img.mimeType};base64,${img.data}`
                  }
                }))
              ],
            }
          ],
          modalities: getModalities(modelId),
          image_config: {
            aspect_ratio: aspectRatio
          },
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        let errorMsg = errorData?.error?.message || errorData?.message || `Ошибка OpenRouter (${response.status}): ${response.statusText}`;
        
        const rawMetadata = errorData?.error?.metadata?.raw;
        if (rawMetadata) {
          try {
            const parsedRaw = JSON.parse(rawMetadata);
            if (parsedRaw.status === 'Request Moderated') {
              errorMsg = `Запрос отклонен модерацией провайдера. Пожалуйста, измените описание.`;
            }
          } catch (e) { /* skip */ }
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const images = extractImagesFromChoice(choice);
      
      if (images.length === 0) {
        const textContent = choice?.message?.content;
        if (textContent && (textContent.toLowerCase().includes('error') || textContent.toLowerCase().includes('limit') || textContent.toLowerCase().includes('exceeded'))) {
          throw new Error(`Модель вернула ошибку вместо изображения: "${textContent}"`);
        }
        throw new Error('Модель ответила успешным статусом, но не вернула URL отредактированного изображения.');
      }
      
      return images;
    } catch (err: any) {
      lastError = err;
      log.warn('OpenRouter', `Попытка ${attempt + 1} изменения изображения не удалась`, { error: err.message });
    }
  }
  
  throw lastError || new Error('Неизвестная ошибка при редактировании изображения');
};

/**
 * Generate images from text using OpenRouter chat completions API.
 * Runs multiple generations in parallel for maximum speed and robustness.
 */
export const generateImagesFromTextOR = async (
  prompt: string,
  count: number = 1,
  aspectRatio: string = '1:1',
  modelId: string
): Promise<string[]> => {
  const key = getOpenRouterKey();
  if (!key) {
    log.error('OpenRouter', 'API ключ не найден');
    throw new Error('API ключ OpenRouter не найден. Добавьте его в Настройках API.');
  }

  const cleanAspectRatio = aspectRatio.split(' ')[0];

  log.info('OpenRouter', `Генерация текст→изображение (параллельно)`, {
    model: modelId,
    count,
    promptPreview: prompt.slice(0, 120),
    aspectRatio: cleanAspectRatio,
  });

  const promises = Array.from({ length: count }, (_, i) => 
    fetchSingleImageWithRetry(prompt, cleanAspectRatio, modelId, key)
  );

  const results = await Promise.allSettled(promises);
  const allResults: string[] = [];
  let firstError: Error | null = null;

  results.forEach((res, index) => {
    if (res.status === 'fulfilled') {
      allResults.push(...res.value);
      log.debug('OpenRouter', `Успешная генерация (${index + 1}/${count})`, {
        imagesCount: res.value.length
      });
    } else {
      const err = res.reason instanceof Error ? res.reason : new Error(String(res.reason));
      log.warn('OpenRouter', `Ошибка генерации (${index + 1}/${count})`, {
        error: err.message
      });
      if (!firstError) {
        firstError = err;
      }
    }
  });

  if (allResults.length === 0 && firstError) {
    throw firstError;
  }

  if (allResults.length === 0) {
    throw new Error('OpenRouter не вернул изображений. Попробуйте другую модель или измените промпт.');
  }

  return allResults;
};

/**
 * Edit/transform an image using OpenRouter.
 * Sends the reference image as a base64 data URL in the user message.
 * Runs multiple generations in parallel.
 */
export const editImageOR = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  count: number = 1,
  _aspectRatio: string = '1:1',
  modelId: string,
  additionalImages: { mimeType: string; data: string }[] = []
): Promise<string[]> => {
  const key = getOpenRouterKey();
  if (!key) {
    log.error('OpenRouter', 'API ключ не найден (editImage)');
    throw new Error('API ключ OpenRouter не найден. Добавьте его в Настройках API.');
  }

  const cleanAspectRatio = _aspectRatio.split(' ')[0];
  const imageDataUrl = `data:${mimeType};base64,${base64Image}`;

  log.info('OpenRouter', `Редактирование изображения (параллельно)`, {
    model: modelId,
    count,
    mimeType,
    promptPreview: prompt.slice(0, 120),
  });

  const promises = Array.from({ length: count }, (_, i) => 
    fetchSingleEditWithRetry(imageDataUrl, prompt, cleanAspectRatio, modelId, key, additionalImages)
  );

  const results = await Promise.allSettled(promises);
  const allResults: string[] = [];
  let firstError: Error | null = null;

  results.forEach((res, index) => {
    if (res.status === 'fulfilled') {
      allResults.push(...res.value);
      log.debug('OpenRouter', `Успешное редактирование (${index + 1}/${count})`, {
        imagesCount: res.value.length
      });
    } else {
      const err = res.reason instanceof Error ? res.reason : new Error(String(res.reason));
      log.warn('OpenRouter', `Ошибка редактирования (${index + 1}/${count})`, {
        error: err.message
      });
      if (!firstError) {
        firstError = err;
      }
    }
  });

  if (allResults.length === 0 && firstError) {
    throw firstError;
  }

  if (allResults.length === 0) {
    throw new Error('OpenRouter не вернул изображений. Попробуйте другую модель или измените промпт.');
  }

  return allResults;
};
