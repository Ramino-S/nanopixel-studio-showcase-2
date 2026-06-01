export interface GeneratedImage {
  id: string;
  dataUrl: string;
  prompt: string;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  dataUrl: string;
  prompt: string;
  timestamp: number;
  mode: GenerationMode;
  aspectRatio?: string;
}

// FIX: Add UserProfile interface
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  password?: string; // In a real app, this would be a hash
  authProvider: 'email' | 'google';
  apiKey: string;
  avatarColor: string;
  createdAt: number;
}

export enum AiModel {
  GEMINI_2_5_FLASH = 'google/gemini-2.5-flash-image',
  GEMINI_3_FLASH = 'google/gemini-3.1-flash-image',
  GEMINI_3_PRO = 'google/gemini-3-pro-image-preview',
  IMAGEN_3 = 'imagen-4.0-generate-001',
  FLUX_2_MAX = 'black-forest-labs/flux.2-max',
  FLUX_2_PRO = 'black-forest-labs/flux.2-pro',
  FLUX_2_KLEIN = 'black-forest-labs/flux.2-klein-4b',
  FLUX_2_FLEX = 'black-forest-labs/flux.2-flex',
}

export enum GenerationMode {
  TEXT_TO_IMAGE = 'TEXT_TO_IMAGE',
  IMAGE_EDITING = 'IMAGE_EDITING',
  PORTRAIT_ADAPTER = 'PORTRAIT_ADAPTER',
  FAMILY_ADAPTER = 'FAMILY_ADAPTER',
  INFOGRAPHICS = 'INFOGRAPHICS',
}

export enum Marketplace {
  OZON = 'Ozon (900x1200)',
  WILDBERRIES = 'Wildberries (1:1)',
  YANDEX = 'Yandex Market (1080x1440)',
}

export enum InfographicTemplate {
  MINIMALIST = 'Минималистичный',
  BRIGHT = 'Яркий и сочный',
  TECH = 'Технологичный / Строгий',
  ECO = 'Эко / Натуральный',
}

export enum ImageStyle {
  NONE = 'Без стиля',
  PHOTOREALISTIC = 'Фотореализм',
  ANIME = 'Аниме',
  DIGITAL_ART = 'Цифровое искусство',
  OIL_PAINTING = 'Масляная живопись',
  CYBERPUNK = 'Киберпанк',
  WATERCOLOR = 'Акварель',
  SKETCH = 'Карандашный набросок',
  PIXEL_ART = 'Пиксель-арт',
}

export enum AspectRatio {
  SQUARE = '1:1 (Квадрат)',
  LANDSCAPE_4_3 = '4:3 (Альбомная)',
  LANDSCAPE_16_9 = '16:9 (Широкоформатная)',
  PORTRAIT_3_4 = '3:4 (Портретная)',
  PORTRAIT_9_16 = '9:16 (История)',
}

export enum ImageQuality {
  STANDARD = 'Стандартное',
  HIGH = 'Высокое (HD)',
  ULTRA = 'Ультра (4K)',
  MASTERPIECE = 'Шедевр (8K)',
}

export enum Emotion {
  KEEP_ORIGINAL = 'Как на фото',
  NEUTRAL = 'Спокойствие',
  JOY = 'Радость / Улыбка',
  SERIOUS = 'Серьезность',
  SURPRISE = 'Удивление',
  SORROW = 'Грусть',
  ANGER = 'Злость',
  FLIRTY = 'Игривость',
  HEROIC = 'Героизм',
}

export enum ShotType {
  CLOSE_UP = 'Крупный план (Лицо)',
  WAIST_SHOT = 'По пояс',
  FULL_BODY = 'В полный рост',
  AMERICAN = 'Американский план (По колено)',
  EXTREME_CLOSE_UP = 'Макро (Глаза/Губы)',
}

export enum HairStyle {
  KEEP_ORIGINAL = 'Как на фото',
  LONG_STRAIGHT = 'Длинные прямые',
  LONG_WAVY = 'Длинные волнистые',
  SHORT_CROP = 'Короткая стрижка',
  BOB_CUT = 'Каре (Bob)',
  CURLY = 'Кудрявые',
  BALD = 'Налысо',
  PONYTAIL = 'Хвост',
  BRAIDS = 'Косички',
  BUN = 'Пучок',
  MOHAWK = 'Ирокез',
}

export enum Pose {
  STANDING = 'Стоит прямо',
  SITTING = 'Сидит',
  ARMS_CROSSED = 'Скрестив руки',
  HANDS_IN_POCKETS = 'Руки в карманах',
  WALKING = 'Идет',
  RUNNING = 'Бежит',
  ACTION = 'В движении / Экшн',
  LEANING = 'Опирается на стену/объект',
  LYING = 'Лежит',
}

export enum FamilyClothingStyle {
  CUSTOM = 'Индивидуальный (Как на фото)',
  CHRISTMAS = 'Рождественский (Свитера)',
  FORMAL = 'Вечерний / Официальный',
  CASUAL = 'Повседневный (Джинсы)',
  SPORT = 'Спортивный',
  BUSINESS = 'Деловой (Костюмы)',
  BEACH = 'Пляжный / Летний',
  FANTASY = 'Фэнтези / Косплей',
  MATCHING_WHITE = 'Family Look (Белый верх, джинсы)',
  PAJAMAS = 'Пижамная вечеринка',
}

export interface GenerationConfig {
  count: number;
  style: ImageStyle;
  aspectRatio?: AspectRatio;
}