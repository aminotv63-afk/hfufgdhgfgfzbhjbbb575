import React, { useState } from 'react';
import { Crown, HelpCircle, BookOpen, Volume2, VolumeX, RotateCcw, ChevronDown, ChevronUp, Compass, Smartphone, Monitor, Sword, Shield } from 'lucide-react';
import { AnimationState } from '../types/game';
import { GuardCommandOptions } from '../game/royalGuards';
import { soundManager } from '../utils/audio';

interface GameHUDProps {
  animState: AnimationState;
  isGrounded: boolean;
  onResetCamera: () => void;
  onOpenStory: () => void;
  onToggleSound: () => void;
  isMuted: boolean;
  isWalking: boolean;
  isSwordDrawn: boolean;
  guardOptions: GuardCommandOptions;
  onToggleKneel: () => void;
  onToggleHoldPosition: () => void;
  onToggleProtectFormation: () => void;
  isLandscapeMode: boolean;
  onToggleLandscape: () => void;
  isSittingOnThrone?: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  animState,
  isGrounded,
  onResetCamera,
  onOpenStory,
  onToggleSound,
  isMuted,
  isWalking,
  isSwordDrawn,
  guardOptions,
  onToggleKneel,
  onToggleHoldPosition,
  onToggleProtectFormation,
  isLandscapeMode,
  onToggleLandscape,
  isSittingOnThrone,
}) => {
  const [showHelp, setShowHelp] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getStatusArabic = () => {
    if (isSittingOnThrone) return 'جالس بهيبة فوق العرش الملكي 👑';
    if (animState === 'attack') return 'ضربة سيف حاسمة ⚔️';
    if (!isGrounded) return 'في الهواء (قفز)';
    switch (animState) {
      case 'run':
        return isSwordDrawn ? 'يجري متأهباً بالسيف ⚔️' : 'يجري مسرعاً';
      case 'walk':
        return isSwordDrawn ? 'يمشي بوضع القتال' : 'يمشي في المملكة';
      case 'jump':
        return 'يقفز';
      case 'fall':
        return 'يهبط';
      case 'idle':
      default:
        return isSwordDrawn ? 'متأهب بالسيف المسلول ⚔️' : 'واقف بهيبة ملكية';
    }
  };

  return (
    <>
      {/* Top Bar: Royal Sultan Profile & Actions */}
      <div className="absolute top-4 inset-x-4 max-w-6xl mx-auto flex items-center justify-between pointer-events-none z-30 select-none">
        {/* Sultan Badge */}
        <div className="flex items-center gap-3 bg-black/75 px-4 py-2 rounded-2xl border border-amber-500/40 backdrop-blur-md shadow-lg pointer-events-auto">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center shadow-md shadow-amber-500/30">
            <Crown className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-amber-300 text-sm sm:text-base">
                السلطان عاشور العاشر
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                تاج 10 الملكي 👑
              </span>
              {isSittingOnThrone && (
                <span className="text-[10px] bg-yellow-500/30 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-400 flex items-center gap-1 font-bold animate-pulse">
                  <Crown className="w-2.5 h-2.5" />
                  <span>فوق العرش</span>
                </span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-semibold transition-colors ${
                guardOptions.isKneeling
                  ? 'bg-amber-600/30 text-amber-300 border-amber-400 animate-pulse'
                  : guardOptions.isHoldPosition
                  ? 'bg-rose-600/30 text-rose-300 border-rose-400'
                  : guardOptions.isProtectFormation
                  ? 'bg-sky-600/30 text-sky-300 border-sky-400'
                  : 'bg-blue-600/20 text-sky-300 border-sky-500/30'
              }`}>
                <Shield className="w-2.5 h-2.5" />
                <span>
                  {guardOptions.isKneeling
                    ? 'الحراس: ساجدون بالأرض إجلالاً للملك 🧎‍♂️'
                    : guardOptions.isHoldPosition
                    ? 'الحراس: ثابتون في المكان 🛑'
                    : guardOptions.isProtectFormation
                    ? 'حماية الملك: أمام وخلف (الحركة مقفلة) 🛡️'
                    : 'حارسان مدرعان بجانب الملك 👥'}
                </span>
              </span>
              {isSwordDrawn && (
                <span className="text-[10px] bg-red-600/30 text-rose-300 px-2 py-0.5 rounded-full border border-red-500/40 flex items-center gap-1 font-bold animate-pulse">
                  <Sword className="w-2.5 h-2.5" />
                  <span>السيف مسلول</span>
                </span>
              )}
            </div>
            <div className="text-xs text-stone-300 flex items-center gap-2 mt-0.5">
              <span className={`inline-block w-2 h-2 rounded-full ${animState === 'attack' ? 'bg-red-400 animate-ping' : (isSwordDrawn ? 'bg-amber-400' : 'bg-emerald-400')}`} />
              <span>الحالة: {getStatusArabic()}</span>
              {isWalking && <span className="text-[11px] text-emerald-300 font-bold">(وضع المشي)</span>}
            </div>
          </div>
        </div>

        {/* Quick Actions (Sound, Story, Landscape, Reset Camera, Help) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Landscape Orientation Toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleLandscape();
            }}
            title={isLandscapeMode ? 'العودة للوضع الرأسي' : 'الوضع الأفقي / تدوير اللعبة'}
            className={`p-2.5 rounded-xl border transition active:scale-95 shadow-md flex items-center gap-1.5 ${
              isLandscapeMode
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 border-yellow-200 text-slate-950 font-black shadow-amber-500/50'
                : 'bg-black/70 border-stone-700 text-stone-300 hover:text-amber-300 hover:border-amber-500'
            }`}
          >
            <Smartphone className={`w-4 h-4 ${isLandscapeMode ? 'rotate-90 text-slate-950' : ''}`} />
            <span className="hidden sm:inline text-xs font-bold">
              {isLandscapeMode ? 'وضع أفقي مفعّل' : 'تدوير أفقي'}
            </span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onResetCamera();
            }}
            title="إعادة ضبط الكاميرا"
            className="p-2.5 rounded-xl bg-black/70 border border-stone-700 text-stone-300 hover:text-amber-300 hover:border-amber-500 transition active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenStory();
            }}
            title="قصة المملكة العاشورية"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/70 border border-amber-500/40 text-amber-300 hover:bg-amber-500 hover:text-black transition active:scale-95 shadow-md text-xs font-bold"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">قصة المملكة</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSound();
            }}
            title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
            className="p-2.5 rounded-xl bg-black/70 border border-stone-700 text-stone-300 hover:text-amber-300 hover:border-amber-500 transition active:scale-95 shadow-md"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowHelp(true);
            }}
            title="طريقة التحكم"
            className="p-2.5 rounded-xl bg-black/70 border border-stone-700 text-stone-300 hover:text-amber-300 hover:border-amber-500 transition active:scale-95 shadow-md"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera Gesture Guide Hint (Top Center) */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-20 hidden md:block">
        <div className="bg-black/50 border border-stone-700/60 px-3.5 py-1 rounded-full text-[11px] text-stone-300 backdrop-blur-sm flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>اسحب بإصبعك على يمين الشاشة لتدوير الكاميرا 360° حول السلطان</span>
        </div>
      </div>

      {/* Collapsible Zen/HUD Drawer Button (Bottom Center) */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <button
          onClick={() => {
            soundManager.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-black/80 border-t border-x border-stone-700 text-stone-300 hover:text-amber-300 text-xs font-semibold backdrop-blur-md"
        >
          {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{isCollapsed ? 'إظهار شريط المساعدة' : 'إخفاء'}</span>
        </button>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
          <div className="relative w-full max-w-lg bg-stone-950 border-2 border-amber-500/60 rounded-3xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold text-amber-300">دليل تحكم السلطان عاشور</h3>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setShowHelp(false);
                }}
                className="w-8 h-8 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-4 text-sm max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
                <div className="flex items-center gap-2 font-bold text-amber-400 mb-2">
                  <Smartphone className="w-4 h-4" />
                  <span>التحكم بالهاتف وميزات الشاشة الجديدة:</span>
                </div>
                <ul className="space-y-1.5 text-stone-300 text-xs leading-relaxed list-disc list-inside">
                  <li><strong className="text-white">عصا التحكم (اليسار):</strong> تحريك السلطان في جميع الاتجاهات 360°.</li>
                  <li><strong className="text-amber-300">توجيه العصا المعكوس ⇄:</strong> إمكانية توجيه العصا لليمين ليذهب اللاعب يساراً (مفعّل تلقائياً ويمكن تبديله بنقرة واحدة تحت العصا).</li>
                  <li><strong className="text-sky-300">تحريك وتدوير الشاشة:</strong> اسحب بإصبعك في أي مكان على الشاشة لتدوير الكاميرا، أو استخدم شريط الأزرار السريعة على اليمين (↶ ↷ ⬆️ ⬇️).</li>
                  <li><strong className="text-yellow-400">الجلوس فوق العرش الملكي 👑:</strong> عند الاقتراب من منصة العرش يظهر زر ذهبي فاخر للجلوس بهيبة فوق العرش (أو مفتاح T).</li>
                  <li><strong className="text-emerald-400">حارسا الباب وبوابات القصر:</strong> عند الاقتراب من مدخل القصر تفتح البوابات الخشبية المزخرفة تلقائياً ويؤدي الحارسان التحية العسكرية للسلطان.</li>
                  <li><strong className="text-amber-300">الوضع الأفقي / تدوير اللعبة 🔄:</strong> زر لتدوير اللعبة والاستمتاع بالشاشة العريضة الأفقية.</li>
                  <li><strong className="text-rose-400">زر ضربة سيف:</strong> تنفيذ ضربة سيف قاطعة وواقعية مع وميض سيف السلطان.</li>
                  <li><strong className="text-white">زر سحب/إغماد السيف:</strong> إشهار سيف المملكة العاشورية في اليد أو إغماده على الخصر.</li>
                  <li><strong className="text-white">أزرار المشي والجري والقفز:</strong> تحكم كامل في سرعة الحركة والقفز.</li>
                </ul>
              </div>

              <div className="p-3 bg-stone-900/80 rounded-xl border border-amber-600/50">
                <div className="flex items-center gap-2 font-bold text-amber-400 mb-2">
                  <Shield className="w-4 h-4" />
                  <span>أوامر الحراس الملكيين (شاشة اللمس ولوحة المفاتيح):</span>
                </div>
                <ul className="space-y-1.5 text-stone-300 text-xs leading-relaxed list-disc list-inside">
                  <li><strong className="text-amber-300">أمر السجود والانحناء التام (مفتاح K):</strong> يأمر الحراس بالركوع والانحناء للأمام بخفض رؤوسهم وأجسادهم بالأرض ووضع يد على الصدر، ويبقون ساجدين ومطأطئي الرؤوس حتى يسمح لهم السلطان برفعها.</li>
                  <li><strong className="text-rose-400">أمر التوقيف والثبات (مفتاح H):</strong> توقيف الحراس في مكانهم الحالي تماماً دون أن يتبعوا السلطان.</li>
                  <li><strong className="text-sky-400">تشكيل الحماية (مفتاح P):</strong> انتشار تكتيكي دفاعي: حارس أمام الملك وحارس ثانٍ خلفه وقفل الحركة للدفاع التام.</li>
                </ul>
              </div>

              <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800">
                <div className="flex items-center gap-2 font-bold text-sky-400 mb-2">
                  <Monitor className="w-4 h-4" />
                  <span>التحكم بالحاسوب (لوحة المفاتيح والماوس):</span>
                </div>
                <ul className="space-y-1.5 text-stone-300 text-xs leading-relaxed list-disc list-inside">
                  <li><strong className="text-white">W / A / S / D أو الأسهم:</strong> التحرك في الاتجاهات.</li>
                  <li><strong className="text-yellow-400">مفتاح T:</strong> الجلوس فوق العرش / النهوض من العرش.</li>
                  <li><strong className="text-amber-300">مفتاح R:</strong> سحب أو إغماد السيف.</li>
                  <li><strong className="text-rose-400">مفتاح F أو E:</strong> تسديد ضربة سيف قاطعة.</li>
                  <li><strong className="text-amber-300">مفتاح K:</strong> أمر السجود والانحناء للحراس.</li>
                  <li><strong className="text-rose-400">مفتاح H:</strong> أمر ثبات وتوقيف الحراس.</li>
                  <li><strong className="text-sky-400">مفتاح P:</strong> تشكيل حماية الملك.</li>
                  <li><strong className="text-white">Shift / Space:</strong> الجري السريع / القفز.</li>
                  <li><strong className="text-white">سحب الماوس وعجلة التمرير:</strong> تدوير وتقريب الكاميرا 360°.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClick();
                setShowHelp(false);
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-amber-500/20"
            >
              فهمت، تابع اللعب
            </button>
          </div>
        </div>
      )}
    </>
  );
};
