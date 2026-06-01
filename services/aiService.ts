import { AiModel } from '../types';
import * as or from './openRouterService';
import * as log from './logService';

const MODEL_STORAGE_KEY = 'nano_pixel_selected_model';
const V2_MIGRATION_KEY = 'nano_pixel_model_migrated_v2.0';

export const getSelectedModel = (): AiModel => {
  // One-time migration to ensure Gemini 2.5 Flash is the default starting model
  if (!localStorage.getItem(V2_MIGRATION_KEY)) {
    localStorage.setItem(MODEL_STORAGE_KEY, AiModel.GEMINI_2_5_FLASH);
    localStorage.setItem(V2_MIGRATION_KEY, 'true');
    return AiModel.GEMINI_2_5_FLASH;
  }

  const stored = localStorage.getItem(MODEL_STORAGE_KEY);
  if (stored && Object.values(AiModel).includes(stored as AiModel)) {
    return stored as AiModel;
  }
  
  // Default: always Gemini 2.5 Flash
  return AiModel.GEMINI_2_5_FLASH;
};

export const setSelectedModel = (model: AiModel) => {
  localStorage.setItem(MODEL_STORAGE_KEY, model);
  window.dispatchEvent(new Event('model-changed'));
};

export const generateImagesFromText = async (
  prompt: string,
  count: number = 1,
  aspectRatio: string = '1:1'
): Promise<string[]> => {
  const model = getSelectedModel();
  
  try {
    return await or.generateImagesFromTextOR(prompt, count, aspectRatio, model);
  } catch (primaryError: any) {
    log.warn('AIService', `Generation failed for model ${model}.`, { error: primaryError.message });

    // Cascade Fallback: Try alternative OpenRouter models
    const alternatives = [
      AiModel.GEMINI_2_5_FLASH,
      AiModel.FLUX_2_PRO,
      AiModel.FLUX_2_KLEIN
    ];

    for (const altModel of alternatives) {
      if (altModel !== model) {
        try {
          log.info('AIService', `Attempting fallback: ${altModel}`);
          return await or.generateImagesFromTextOR(prompt, count, aspectRatio, altModel);
        } catch (altError: any) {
          log.warn('AIService', `Fallback ${altModel} failed`, { error: altError.message });
        }
      }
    }

    log.error('AIService', 'All generation strategies exhausted.', { error: primaryError.message });
    throw new Error(`Все варианты генерации исчерпаны. Ошибка: ${primaryError.message}`);
  }
};

export const editImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  count: number = 1,
  aspectRatio: string = '1:1'
): Promise<string[]> => {
  const model = getSelectedModel();
  
  try {
    return await or.editImageOR(base64Image, mimeType, prompt, count, aspectRatio, model);
  } catch (primaryError: any) {
    log.error('AIService', 'Image editing failed.', { error: primaryError.message });
    throw new Error(`Редактирование изображения не удалось: ${primaryError.message}`);
  }
};

export const generatePortrait = async (
  base64Image: string,
  mimeType: string,
  prompt: string,
  count: number = 1,
  aspectRatio: string = '1:1'
): Promise<string[]> => {
  return generateImageToImage(base64Image, mimeType, prompt, count, aspectRatio);
};

export const generateImageToImage = async (
  mainImage: string,
  mainMime: string,
  prompt: string,
  count: number = 1,
  aspectRatio: string = '1:1',
  additionalImages: { mimeType: string; data: string }[] = []
): Promise<string[]> => {
  const model = getSelectedModel();

  try {
    return await or.editImageOR(mainImage, mainMime, prompt, count, aspectRatio, model, additionalImages);
  } catch (primaryError: any) {
    log.error('AIService', 'Image-to-image failed.', { error: primaryError.message });
    throw new Error(`Генерация не удалась: ${primaryError.message}`);
  }
};
