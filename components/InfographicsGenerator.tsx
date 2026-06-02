import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutTemplate, 
  Sparkles, 
  Layers, 
  Wand2, 
  CheckCircle2, 
  Compass, 
  ArrowRight, 
  Mail, 
  Zap, 
  Flame, 
  Info,
  Clock
} from 'lucide-react';

interface InfographicsGeneratorProps {
  onDownload?: (url: string, format: 'png' | 'jpg') => void;
  onView?: (url: string) => void;
  onSuccess?: (urls: string[], prompt: string, aspectRatio: string) => void;
}

const MARKETPLACE_TEMPLATES = {
  wb: {
    title: 'Шаблон Wildberries (1:1)',
    desc: 'Яркий, контрастный стиль с акцентом на УТП. Оптимизирован под квадратную выдачу мобильного приложения.',
    badge: 'Рекомендуется для одежды и бьюти',
    bgGradient: 'from-pink-500/10 to-purple-500/10 border-pink-500/30',
    tagColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    specs: ['Безопасные зоны под плашки WB', 'Высокий контраст (CTR+24%)', 'Акцентные 3D-элементы'],
  },
  ozon: {
    title: 'Шаблон Ozon (3:4)',
    desc: 'Премиальный минимализм в стиле Apple. Идеально сбалансированное соотношение сторон для детального просмотра товара.',
    badge: 'Рекомендуется для электроники',
    bgGradient: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    specs: ['Сетка выравнивания Ozon', 'Интеграция с плашками скидок', 'Мягкие студийные тени'],
  },
  yandex: {
    title: 'Шаблон Яндекс.Маркет (3:4)',
    desc: 'Технологичный и современный дизайн с четкой иерархией шрифтов для быстрого сканирования характеристик товара.',
    badge: 'Рекомендуется для дома и авто',
    bgGradient: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/30',
    tagColor: 'bg-yellow-500/20 text-amber-300 border-yellow-500/40',
    specs: ['Желтый фирменный акцент', 'Инфографика технических спецификаций', 'Чистый белый/серый фон'],
  }
} as const;

export default function InfographicsGenerator({
  onDownload,
  onView,
  onSuccess
}: InfographicsGeneratorProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<keyof typeof MARKETPLACE_TEMPLATES>('wb');
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    setIsSubmitting(true);
    timerRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail('');
      timerRef.current = null;
    }, 1200);
  };

  const activeTemplate = MARKETPLACE_TEMPLATES[selectedConcept];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-slate-700/60 rounded-3xl p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-500/10 to-indigo-600/10 blur-3xl -z-10 rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 blur-3xl -z-10 rounded-full" />
        
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Функция в активной разработке
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Инфографика товаров{' '}
            <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-indigo-400 bg-clip-text text-transparent">
              PRO 2.0
            </span>
          </h2>
          
          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8">
            Автоматическое создание высококонверсионных карточек для маркетплейсов. Новая версия объединяет мощь генеративной нейросети <strong className="text-amber-400">FLUX.2</strong> с интеллектуальным векторным оверлеем для мгновенного размещения ключевых преимуществ вашего товара.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <a 
              href="#beta-form" 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-rose-950/40 hover:scale-[1.02] flex items-center gap-2"
            >
              Принять участие в бета-тесте
              <ArrowRight size={16} />
            </a>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={14} className="text-slate-500" />
              <span>Ориентировочный запуск: Q3 2026</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all group">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
            <Wand2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Умный ИИ-Фон</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Вам больше не нужны фотосессии. Нейросеть создаст дорогую, премиальную сцену (студийный свет, мраморные подиумы, левитирующие элементы), идеально вписав ваш товар.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all group">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
            <Layers size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Векторный Оверлей</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Автоматическое построение инфографики с учетом «безопасных зон» маркетплейсов. Плашки скидок, логотипы и текст больше никогда не перекроют важную информацию.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/80 transition-all group">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
            <Sparkles size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Копирайтинг Преимуществ</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Интегрированный языковой ИИ-ассистент проанализирует категорию вашего товара и сам сформулирует привлекающие внимание УТП для размещения на карточке.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
          
          <div className="lg:w-1/2 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <LayoutTemplate className="text-indigo-400" />
                Интерактивный концепт сетки макетов
              </h3>
              <p className="text-slate-400 text-sm">
                Выберите маркетплейс, чтобы увидеть требования и стилизацию будущей инфографики:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => setSelectedConcept('wb')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${selectedConcept === 'wb' ? 'bg-pink-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Wildberries
              </button>
              <button 
                onClick={() => setSelectedConcept('ozon')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${selectedConcept === 'ozon' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Ozon
              </button>
              <button 
                onClick={() => setSelectedConcept('yandex')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${selectedConcept === 'yandex' ? 'bg-yellow-600 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Яндекс
              </button>
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-300 ${activeTemplate.bgGradient}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-extrabold text-white text-sm">{activeTemplate.title}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${activeTemplate.tagColor}`}>
                  {activeTemplate.badge}
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                {activeTemplate.desc}
              </p>
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-500">Возможности сетки шаблона:</span>
                <ul className="space-y-1">
                  {activeTemplate.specs.map((spec, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 bg-slate-900 rounded-2xl border border-slate-700/60 p-6 flex flex-col justify-between min-h-[320px]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Визуализация Безопасных Зон (Концепт)
              </span>
              <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400 uppercase">
                {selectedConcept === 'wb' ? '1:1 Ratio' : '3:4 Ratio'}
              </span>
            </div>

            <div className="relative flex-1 bg-slate-950 rounded-xl border border-slate-800/80 p-4 flex flex-col justify-between overflow-hidden shadow-inner min-h-[220px]">
              <div className="absolute inset-0 flex items-center justify-center opacity-25">
                <div className="relative flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-b from-rose-500 to-indigo-600 blur-md animate-pulse" />
                  <div className="w-36 h-8 bg-slate-700 rounded-full border border-slate-600 -mt-8 rotate-[-12deg]" />
                </div>
              </div>

              <div className="z-10 space-y-1">
                <div className="h-4 w-20 bg-rose-500/20 border border-rose-500/30 rounded text-[9px] font-bold text-rose-300 uppercase flex items-center justify-center px-1.5">
                  Категория
                </div>
                <div className="h-6 w-40 bg-white/10 rounded flex items-center px-2">
                  <span className="text-[10px] font-bold text-white tracking-wide">НАЗВАНИЕ ТОВАРА</span>
                </div>
              </div>

              <div className="z-10 flex items-center justify-center my-2">
                <div className="border border-dashed border-slate-600/60 rounded-lg p-2 px-4 bg-slate-900/40 backdrop-blur-sm text-[10px] text-slate-500 font-mono">
                  ЗОНА РАЗМЕЩЕНИЯ ТОВАРА
                </div>
              </div>

              <div className="z-10 flex flex-col gap-1.5 max-w-[70%]">
                <div className="h-5 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center px-2 text-[8px] font-bold text-emerald-300 gap-1.5">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  ХАРАКТЕРИСТИКА 1 (СВЕРХУ)
                </div>
                <div className="h-5 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center px-2 text-[8px] font-bold text-emerald-300 gap-1.5">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  ХАРАКТЕРИСТИКА 2 (ЦЕНТР)
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-500 text-center mt-3 flex items-center justify-center gap-1">
              <Info size={12} className="text-slate-600" />
              В финальной версии макет рендерится автоматически на базе анализа изображения с помощью ИИ.
            </p>
          </div>
        </div>
      </div>

      <div id="beta-form" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 md:p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Compass className="text-rose-400" size={18} />
              Дорожная карта разработки
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Проектирование и дизайн UI оверлея</h4>
                  <p className="text-[11px] text-slate-400">Создание адаптивной структуры слоев под Ozon и WB с безопасными зонами.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={12} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Интеграция с генераторами фонов ИИ</h4>
                  <p className="text-[11px] text-slate-400">Настройка сопряжения с API OpenRouter (FLUX.2) для бесшовной отрисовки холста.</p>
                </div>
              </div>

              <div className="flex gap-3 animate-pulse">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-300">Автоматическая сегментация объекта</h4>
                  <p className="text-[11px] text-slate-300">Разработка модуля удаления исходного фона для загруженных пользователем фото товара.</p>
                </div>
              </div>

              <div className="flex gap-3 opacity-40">
                <div className="w-5 h-5 rounded-full bg-slate-700/30 text-slate-500 border border-slate-600/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock size={10} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400">Релиз бета-версии для профессионалов</h4>
                  <p className="text-[11px] text-slate-500">Открытие закрытого доступа к сервису для первых 200 пользователей по списку ожидания.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Общий прогресс разработки:</span>
            <span className="text-xs font-bold text-amber-400">75%</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-850 border border-indigo-500/20 rounded-3xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl -z-10 rounded-full" />
          
          <div>
            <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl w-fit mb-4">
              <Flame size={24} className="animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Станьте первыми, кто попробует!</h3>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Мы предоставим закрытый доступ к генератору инфографики профессиональным дизайнерам и селлерам. 
              Зарегистрируйте свой email, чтобы получить приоритет в списке ожидания и бесплатные 100 генераций на старте.
            </p>
          </div>

          {isSubscribed ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center animate-fade-in">
              <CheckCircle2 className="text-emerald-400 mx-auto mb-2" size={32} />
              <h4 className="text-sm font-bold text-white mb-1">Вы успешно зарегистрированы!</h4>
              <p className="text-[11px] text-slate-400">Мы сообщим вам на указанный email сразу после запуска бета-теста.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Ваш e-mail для приглашения" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-10 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-600"
                />
                <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Регистрация...' : 'Подать заявку на бета-тест'}
                <Zap size={12} className="fill-white" />
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            Без спама. Только важные обновления разработки и персональный доступ.
          </div>
        </div>
      </div>
    </div>
  );
}