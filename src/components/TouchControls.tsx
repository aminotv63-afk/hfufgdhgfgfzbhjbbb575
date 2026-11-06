import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Footprints, Zap, ArrowUp, Sword, Shield, Crown, RotateCcw, RotateCw, ChevronUp, ChevronDown, Smartphone } from 'lucide-react';
import { ControlState } from '../types/game';
import { GuardCommandOptions } from '../game/royalGuards';

interface TouchControlsProps {
  onControlChange: (controls: Partial<ControlState>) => void;
  onCameraDrag: (deltaX: number, deltaY: number) => void;
  onResetCamera: () => void;
  isWalking: boolean;
  onToggleWalk: () => void;
  isSwordDrawn: boolean;
  onToggleSword: () => void;
  onAttack: () => void;
  guardOptions: GuardCommandOptions;
  onToggleKneel: () => void;
  onToggleHoldPosition: () => void;
  onToggleProtectFormation: () => void;
  invertJoystickX: boolean;
  onToggleInvertJoystickX: () => void;
  isNearThrone: boolean;
  isSittingOnThrone: boolean;
  onToggleSitOnThrone: () => void;
  isLandscapeMode: boolean;
  onToggleLandscape: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onControlChange,
  onCameraDrag,
  onResetCamera,
  isWalking,
  onToggleWalk,
  isSwordDrawn,
  onToggleSword,
  onAttack,
  guardOptions,
  onToggleKneel,
  onToggleHoldPosition,
  onToggleProtectFormation,
  invertJoystickX,
  onToggleInvertJoystickX,
  isNearThrone,
  isSittingOnThrone,
  onToggleSitOnThrone,
  isLandscapeMode,
  onToggleLandscape,
}) => {
  // Joystick state
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const joystickTouchIdRef = useRef<number | null>(null);
  const joystickOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera swipe state
  const cameraTouchIdRef = useRef<number | null>(null);
  const lastCameraPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Button active visual states
  const [isSprintHeld, setIsSprintHeld] = useState(false);
  const [isJumpHeld, setIsJumpHeld] = useState(false);
  const [isAttackHeld, setIsAttackHeld] = useState(false);

  // Maximum joystick stick radius in pixels
  const JOYSTICK_MAX_RADIUS = 50;

  // Joystick touch handlers
  const handleJoystickTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (joystickTouchIdRef.current !== null) return;

    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;

    if (joystickBaseRef.current) {
      const rect = joystickBaseRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      joystickOriginRef.current = { x: centerX, y: centerY };

      const dx = touch.clientX - centerX;
      const dy = touch.clientY - centerY;
      updateJoystickVector(dx, dy);
    }
    setIsJoystickActive(true);
  };

  const updateJoystickVector = (dx: number, dy: number) => {
    const distance = Math.hypot(dx, dy);
    const clampedDist = Math.min(distance, JOYSTICK_MAX_RADIUS);
    const angle = Math.atan2(dy, dx);

    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    setJoystickPos({ x: clampedX, y: clampedY });

    // Normalized outputs: X is right (+) / left (-), Y is backward (+) / forward (-)
    // "عندما اوجه العصا لليمين الاعب يذهب يسار":
    const rawNormX = clampedX / JOYSTICK_MAX_RADIUS;
    const normX = invertJoystickX ? -rawNormX : rawNormX;
    const normY = -clampedY / JOYSTICK_MAX_RADIUS; // up is positive forward

    onControlChange({
      moveX: normX,
      moveY: normY,
    });
  };

  const handleJoystickTouchMove = useCallback((e: TouchEvent) => {
    if (joystickTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        const dx = touch.clientX - joystickOriginRef.current.x;
        const dy = touch.clientY - joystickOriginRef.current.y;
        updateJoystickVector(dx, dy);
        break;
      }
    }
  }, []);

  const handleJoystickTouchEnd = useCallback((e: TouchEvent) => {
    if (joystickTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        joystickTouchIdRef.current = null;
        setIsJoystickActive(false);
        setJoystickPos({ x: 0, y: 0 });
        onControlChange({ moveX: 0, moveY: 0 });
        break;
      }
    }
  }, []);

  // Camera swipe handlers for right side of screen
  const handleCameraTouchStart = (e: React.TouchEvent) => {
    if (cameraTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    cameraTouchIdRef.current = touch.identifier;
    lastCameraPosRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleCameraTouchMove = useCallback((e: TouchEvent) => {
    if (cameraTouchIdRef.current === null) return;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === cameraTouchIdRef.current) {
        const deltaX = touch.clientX - lastCameraPosRef.current.x;
        const deltaY = touch.clientY - lastCameraPosRef.current.y;

        lastCameraPosRef.current = { x: touch.clientX, y: touch.clientY };
        onCameraDrag(deltaX * 0.006, deltaY * 0.005);
        break;
      }
    }
  }, [onCameraDrag]);

  const handleCameraTouchEnd = useCallback((e: TouchEvent) => {
    if (cameraTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === cameraTouchIdRef.current) {
        cameraTouchIdRef.current = null;
        break;
      }
    }
  }, []);

  // Global touch listeners to prevent touch getting stuck when moving outside bounds
  useEffect(() => {
    window.addEventListener('touchmove', handleJoystickTouchMove, { passive: false });
    window.addEventListener('touchend', handleJoystickTouchEnd);
    window.addEventListener('touchcancel', handleJoystickTouchEnd);

    window.addEventListener('touchmove', handleCameraTouchMove, { passive: false });
    window.addEventListener('touchend', handleCameraTouchEnd);
    window.addEventListener('touchcancel', handleCameraTouchEnd);

    return () => {
      window.removeEventListener('touchmove', handleJoystickTouchMove);
      window.removeEventListener('touchend', handleJoystickTouchEnd);
      window.removeEventListener('touchcancel', handleJoystickTouchEnd);

      window.removeEventListener('touchmove', handleCameraTouchMove);
      window.removeEventListener('touchend', handleCameraTouchEnd);
      window.removeEventListener('touchcancel', handleCameraTouchEnd);
    };
  }, [handleJoystickTouchMove, handleJoystickTouchEnd, handleCameraTouchMove, handleCameraTouchEnd]);

  // Desktop keyboard controls fallback
  useEffect(() => {
    const keysPressed: Record<string, boolean> = {};

    const updateFromKeys = () => {
      let mx = 0;
      let my = 0;
      if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) mx -= 1;
      if (keysPressed['KeyD'] || keysPressed['ArrowRight']) mx += 1;
      if (keysPressed['KeyW'] || keysPressed['ArrowUp']) my += 1;
      if (keysPressed['KeyS'] || keysPressed['ArrowDown']) my -= 1;

      const isSprint = !!keysPressed['ShiftLeft'] || !!keysPressed['ShiftRight'];
      const isJump = !!keysPressed['Space'];

      onControlChange({
        moveX: mx,
        moveY: my,
        isRunning: isSprint,
        isJumping: isJump,
      });
      setIsSprintHeld(isSprint);
      setIsJumpHeld(isJump);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysPressed[e.code] = true;

      // Hotkey 'R': Draw/Sheath sword
      if (e.code === 'KeyR' && !e.repeat) {
        onToggleSword();
      }

      // Hotkey 'F' or 'KeyE': Attack / Strike
      if ((e.code === 'KeyF' || e.code === 'KeyE') && !e.repeat) {
        onAttack();
        setIsAttackHeld(true);
        setTimeout(() => setIsAttackHeld(false), 200);
      }

      // Hotkey 'K': Toggle Kneel & Bow
      if (e.code === 'KeyK' && !e.repeat) {
        onToggleKneel();
      }

      // Hotkey 'H': Toggle Hold position
      if (e.code === 'KeyH' && !e.repeat) {
        onToggleHoldPosition();
      }

      // Hotkey 'P': Toggle Protect Formation
      if (e.code === 'KeyP' && !e.repeat) {
        onToggleProtectFormation();
      }

      // Hotkey 'T': Sit on Throne when near throne
      if (e.code === 'KeyT' && !e.repeat && isNearThrone) {
        onToggleSitOnThrone();
      }

      updateFromKeys();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
      updateFromKeys();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onControlChange, onToggleSword, onAttack, onToggleKneel, onToggleHoldPosition, onToggleProtectFormation, isNearThrone, onToggleSitOnThrone]);

  const handleAttackTrigger = () => {
    setIsAttackHeld(true);
    onAttack();
    setTimeout(() => {
      setIsAttackHeld(false);
    }, 250);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between overflow-hidden select-none">
      {/* Full screen background camera touch area for moving / rotating the screen anywhere ("واضف امكانية تحريك شاشة") */}
      <div
        className="absolute inset-0 pointer-events-auto touch-none"
        onTouchStart={handleCameraTouchStart}
      />

      {/* Quick Screen / Camera Rotation & Tilt Bar ("واضف امكانية تحريك شاشة") */}
      <div className="absolute right-3 top-24 pointer-events-auto flex flex-col items-center gap-1.5 bg-black/80 p-1.5 rounded-2xl border border-stone-700/80 backdrop-blur-md shadow-2xl z-30">
        <span className="text-[9px] font-black text-amber-400 pb-0.5">الشاشة</span>
        <button
          onClick={() => onCameraDrag(22, 0)}
          title="تدوير الشاشة لليسار"
          className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 hover:text-amber-300 hover:border-amber-400 flex items-center justify-center text-xs font-bold active:scale-90 transition shadow"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => onCameraDrag(-22, 0)}
          title="تدوير الشاشة لليمين"
          className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 hover:text-amber-300 hover:border-amber-400 flex items-center justify-center text-xs font-bold active:scale-90 transition shadow"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => onCameraDrag(0, -16)}
          title="إمالة الشاشة لأعلى"
          className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 hover:text-amber-300 hover:border-amber-400 flex items-center justify-center text-xs font-bold active:scale-90 transition shadow"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => onCameraDrag(0, 16)}
          title="إمالة الشاشة لأسفل"
          className="w-9 h-9 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 hover:text-amber-300 hover:border-amber-400 flex items-center justify-center text-xs font-bold active:scale-90 transition shadow"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleLandscape}
          title="الوضع الأفقي / تدوير الشاشة"
          className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold active:scale-90 transition shadow ${
            isLandscapeMode
              ? 'bg-amber-600 border-amber-300 text-slate-950 shadow-md shadow-amber-500/50'
              : 'bg-stone-900 border-stone-700 text-amber-300 hover:border-amber-400'
          }`}
        >
          <Smartphone className={`w-4 h-4 ${isLandscapeMode ? 'rotate-90 text-slate-950 font-black' : ''}`} />
        </button>
      </div>

      {/* Bottom control zone */}
      <div className="mt-auto w-full p-2.5 sm:p-5 flex items-end justify-between pointer-events-none">
        {/* Left: Royal Guards Command Deck + Virtual Joystick */}
        <div className="flex flex-col items-start gap-2 sm:gap-2.5 pointer-events-none">
          {/* Royal Guards Command Deck */}
          <div className="pointer-events-auto flex flex-col gap-1.5 bg-black/80 p-2 sm:p-2.5 rounded-2xl border-2 border-amber-500/50 backdrop-blur-md shadow-2xl w-52 sm:w-60">
            <div className="flex items-center justify-between pb-1 border-b border-amber-500/30">
              <span className="text-[11px] sm:text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>أوامر الحراس الملكيين</span>
              </span>
              <span className="text-[9px] text-amber-400/90 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded">
                K · H · P
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {/* 1. Sujood / Prostration Order Button */}
              <button
                onClick={onToggleKneel}
                title="أمر السجود والانحناء التام بالأرض (مفتاح K)"
                className={`w-full py-1.5 px-2 rounded-xl border flex items-center gap-2 transition-all active:scale-95 text-right ${
                  guardOptions.isKneeling
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-500 border-yellow-200 text-slate-950 font-black shadow-md shadow-amber-500/50 scale-[1.02]'
                    : 'bg-stone-900/90 border-amber-500/30 text-amber-200 hover:border-amber-400'
                }`}
              >
                <span className="text-base sm:text-lg">🧎‍♂️</span>
                <div className="flex flex-col flex-1 leading-none">
                  <span className="text-[11px] sm:text-xs font-black">
                    {guardOptions.isKneeling ? 'ساجدون بالأرض 🧎‍♂️' : 'أمر السجود والانحناء'}
                  </span>
                  <span className={`text-[9px] mt-0.5 ${guardOptions.isKneeling ? 'text-slate-950 font-bold' : 'text-stone-400'}`}>
                    {guardOptions.isKneeling ? 'انقر للإذن بالرفع والقيام' : 'سجود كامل بالأرض مثل السجود'}
                  </span>
                </div>
              </button>

              {/* 2. Hold Position / Stay Order Button */}
              <button
                onClick={onToggleHoldPosition}
                title="توقيف الحراس في مكانهم دون اتباع (مفتاح H)"
                className={`w-full py-1.5 px-2 rounded-xl border flex items-center gap-2 transition-all active:scale-95 text-right ${
                  guardOptions.isHoldPosition
                    ? 'bg-gradient-to-r from-rose-600 to-red-500 border-rose-200 text-white font-black shadow-md shadow-rose-500/50 scale-[1.02]'
                    : 'bg-stone-900/90 border-stone-700 text-stone-200 hover:border-rose-400'
                }`}
              >
                <span className="text-base sm:text-lg">🛑</span>
                <div className="flex flex-col flex-1 leading-none">
                  <span className="text-[11px] sm:text-xs font-black">
                    {guardOptions.isHoldPosition ? 'الحراس ثابتون 🛑' : 'توقيف الحراس هنا'}
                  </span>
                  <span className={`text-[9px] mt-0.5 ${guardOptions.isHoldPosition ? 'text-rose-100 font-bold' : 'text-stone-400'}`}>
                    {guardOptions.isHoldPosition ? 'انقر لاستئناف اللحاق' : 'تثبيتهم ولا يتبعون الملك'}
                  </span>
                </div>
              </button>

              {/* 3. Protect Formation Button (1 Front, 1 Back - Movement Locked) */}
              <button
                onClick={onToggleProtectFormation}
                title="تشكيل حماية الملك: واحد أمام الملك وثانٍ خلفه وتثبيت الحركة للدفاع (مفتاح P)"
                className={`w-full py-1.5 px-2 rounded-xl border flex items-center gap-2 transition-all active:scale-95 text-right ${
                  guardOptions.isProtectFormation
                    ? 'bg-gradient-to-r from-sky-600 to-blue-500 border-sky-200 text-white font-black shadow-md shadow-sky-500/50 scale-[1.02]'
                    : 'bg-stone-900/90 border-sky-800/50 text-sky-200 hover:border-sky-400'
                }`}
              >
                <span className="text-base sm:text-lg">🛡️</span>
                <div className="flex flex-col flex-1 leading-none">
                  <span className="text-[11px] sm:text-xs font-black">
                    {guardOptions.isProtectFormation ? 'حماية الملك (الحركة مقفلة)' : 'تشكيل حماية الملك'}
                  </span>
                  <span className={`text-[9px] mt-0.5 ${guardOptions.isProtectFormation ? 'text-sky-100 font-bold' : 'text-stone-400'}`}>
                    {guardOptions.isProtectFormation ? 'حارس أمامه وحارس خلفه (وضع الدفاع)' : 'واحد أمامه وثانٍ خلفه للحماية'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Virtual Joystick */}
          <div className="relative pointer-events-auto touch-none flex flex-col items-center">
            <div
              ref={joystickBaseRef}
              onTouchStart={handleJoystickTouchStart}
              className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-slate-950/70 border-2 ${
                isJoystickActive ? 'border-amber-400 bg-amber-950/35' : 'border-stone-700/80'
              } backdrop-blur-md flex items-center justify-center shadow-xl shadow-black/70 transition-colors overflow-hidden`}
            >
              {/* Movement Locked Overlay during King Protection */}
              {guardOptions.isProtectFormation && (
                <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 text-center select-none border-2 border-sky-400 rounded-full animate-pulse">
                  <Shield className="w-6 h-6 text-sky-300" />
                  <span className="text-[10px] font-black text-sky-200 mt-1 leading-tight">
                    الحركة مقفلة
                  </span>
                  <span className="text-[8px] text-sky-300/80 font-bold">
                    حماية الملك مفعّلة
                  </span>
                </div>
              )}

              {/* Cardinal marks */}
              <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-stone-500" />
              <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-stone-500" />
              <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-stone-500" />
              <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-stone-500" />

              {/* Inner thumbstick */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr ${
                  isJoystickActive
                    ? 'from-amber-600 to-amber-400 shadow-amber-500/50'
                    : 'from-stone-700 to-stone-500'
                } border-2 border-white/60 shadow-lg flex items-center justify-center transition-transform duration-75`}
                style={{
                  transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                }}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white/40" />
              </div>
            </div>

            {/* Invert Joystick X toggle ("عندما اوجه العصا لليمين الاعب يذهب يسار") */}
            <button
              onClick={onToggleInvertJoystickX}
              title="عكس اتجاه العصا الأفقي (توجيه العصا لليمين يجعل اللاعب يذهب يسار)"
              className={`mt-1.5 w-full py-1 px-2 rounded-xl text-[10px] font-black border transition active:scale-95 flex items-center justify-center gap-1.5 backdrop-blur-md shadow-md ${
                invertJoystickX
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 border-yellow-200 text-slate-950 shadow-amber-500/40'
                  : 'bg-stone-900/90 border-stone-700 text-stone-300 hover:border-amber-400'
              }`}
            >
              <span>⇄ توجيه العصا:</span>
              <span className="font-extrabold">{invertJoystickX ? 'معكوس (اليمين = يسار)' : 'عادي'}</span>
            </button>
          </div>
        </div>

        {/* Right: Action Buttons Cluster (Combat, Throne Sit & Locomotion) */}
        <div className="pointer-events-auto flex flex-col items-end gap-2.5 touch-none">
          {/* Sit on Royal Throne Interactive Button ("واضف امكانية الجلوس فوق العرش") */}
          {isNearThrone && (
            <div className="w-full flex justify-end animate-bounce mb-1">
              <button
                onClick={onToggleSitOnThrone}
                title="الجلوس بهيبة فوق عرش السلطان عاشور العاشر (مفتاح T)"
                className={`py-2 px-3 sm:px-4 rounded-2xl border-2 shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 ${
                  isSittingOnThrone
                    ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-amber-600 border-white text-slate-950 font-black ring-4 ring-amber-400/60 scale-105'
                    : 'bg-gradient-to-r from-amber-950 via-stone-900 to-yellow-950 border-amber-400 text-amber-300 hover:border-amber-300 shadow-amber-500/30'
                }`}
              >
                <Crown className="w-5 h-5 text-amber-300" />
                <div className="flex flex-col text-right leading-tight">
                  <span className="text-xs sm:text-sm font-black">
                    {isSittingOnThrone ? '👑 النهوض من العرش' : '👑 الجلوس فوق العرش'}
                  </span>
                  <span className="text-[9px] text-amber-200/90 font-bold">
                    {isSittingOnThrone ? 'انقر للوقوف والمسير' : 'عرش عاشور العاشر (مفتاح T)'}
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* Top Row: Combat Action Buttons (Draw/Sheath Sword & Sword Strike) */}
          <div className="flex items-center gap-3">
            {/* 1. Draw/Sheath Sword Button */}
            <div className="flex flex-col items-center">
              <button
                onClick={onToggleSword}
                aria-label="سحب أو إغماد سيف السلطان"
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center border-2 shadow-lg backdrop-blur-md transition-all active:scale-90 ${
                  isSwordDrawn
                    ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 border-yellow-200 text-slate-950 shadow-amber-500/60 ring-3 ring-amber-400/50 scale-102'
                    : 'bg-stone-900/80 border-stone-600 text-stone-300 hover:border-amber-400'
                }`}
              >
                <Sword className={`w-5 h-5 sm:w-6 sm:h-6 ${isSwordDrawn ? 'rotate-45 stroke-[2.5]' : ''}`} />
                <span className="text-[10px] font-black mt-0.5 leading-none">
                  {isSwordDrawn ? 'إغماد' : 'سحب'}
                </span>
              </button>
              <span className="text-[9px] sm:text-[10px] text-amber-300/80 mt-1 font-bold">
                {isSwordDrawn ? 'إغماد السيف' : 'سحب السيف'}
              </span>
            </div>

            {/* 2. Sword Strike / Attack Button (Realistic Slash) */}
            <div className="flex flex-col items-center">
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleAttackTrigger();
                }}
                onMouseDown={() => {
                  handleAttackTrigger();
                }}
                aria-label="ضربة سيف واقعية"
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex flex-col items-center justify-center border-2 shadow-2xl backdrop-blur-md transition-all active:scale-90 ${
                  isAttackHeld
                    ? 'bg-gradient-to-tr from-red-600 to-rose-400 border-white text-white scale-95 shadow-red-500/80 ring-4 ring-rose-400/60'
                    : 'bg-gradient-to-tr from-red-900/90 via-red-800/80 to-amber-700/80 border-amber-400/80 text-amber-200 hover:border-amber-300 shadow-red-950/60'
                }`}
              >
                <div className="relative">
                  <Sword className="w-7 h-7 sm:w-8 sm:h-8 -rotate-45 stroke-[2.5]" />
                  <span className="absolute -top-1 -right-1 text-xs">⚡</span>
                </div>
                <span className="text-[11px] sm:text-[12px] font-black mt-0.5 leading-none text-white drop-shadow">
                  ضربة سيف
                </span>
              </button>
              <span className="text-[9px] sm:text-[10px] text-rose-300 mt-1 font-extrabold tracking-wide">
                ضربة واقعية
              </span>
            </div>
          </div>

          {/* Bottom Row: Locomotion Buttons (Walk, Sprint, Jump) */}
          <div className="flex items-center gap-2.5">
            {/* Walk Toggle */}
            <div className="flex flex-col items-center">
              <button
                onClick={onToggleWalk}
                aria-label="تبديل وضع المشي"
                className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex flex-col items-center justify-center border-2 shadow-md backdrop-blur-md transition-all active:scale-90 ${
                  isWalking
                    ? 'bg-emerald-600/85 border-emerald-300 text-white ring-2 ring-emerald-400/40'
                    : 'bg-stone-900/75 border-stone-600 text-stone-300 hover:border-stone-400'
                }`}
              >
                <Footprints className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">{isWalking ? 'مشي مفعّل' : 'مشي'}</span>
              </button>
            </div>

            {/* Sprint Button */}
            <div className="flex flex-col items-center">
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsSprintHeld(true);
                  onControlChange({ isRunning: true });
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setIsSprintHeld(false);
                  onControlChange({ isRunning: false });
                }}
                onMouseDown={() => {
                  setIsSprintHeld(true);
                  onControlChange({ isRunning: true });
                }}
                onMouseUp={() => {
                  setIsSprintHeld(false);
                  onControlChange({ isRunning: false });
                }}
                aria-label="زر الجري السريع"
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center border-2 shadow-lg backdrop-blur-md transition-all active:scale-90 ${
                  isSprintHeld
                    ? 'bg-amber-500 border-amber-200 text-slate-950 scale-95 shadow-amber-500/60 ring-3 ring-amber-400/40'
                    : 'bg-gradient-to-b from-stone-900/80 to-amber-950/60 border-amber-500/60 text-amber-300'
                }`}
              >
                <Zap className={`w-5 h-5 sm:w-6 sm:h-6 ${isSprintHeld ? 'fill-current' : ''}`} />
                <span className="text-[10px] font-black mt-0.5">جري</span>
              </button>
            </div>

            {/* Jump Button */}
            <div className="flex flex-col items-center">
              <button
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsJumpHeld(true);
                  onControlChange({ isJumping: true });
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setIsJumpHeld(false);
                  onControlChange({ isJumping: false });
                }}
                onMouseDown={() => {
                  setIsJumpHeld(true);
                  onControlChange({ isJumping: true });
                }}
                onMouseUp={() => {
                  setIsJumpHeld(false);
                  onControlChange({ isJumping: false });
                }}
                aria-label="زر القفز"
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center border-2 shadow-lg backdrop-blur-md transition-all active:scale-90 ${
                  isJumpHeld
                    ? 'bg-sky-500 border-sky-200 text-slate-950 scale-95 shadow-sky-500/60 ring-3 ring-sky-400/40'
                    : 'bg-gradient-to-b from-stone-900/80 to-sky-950/60 border-sky-500/60 text-sky-300'
                }`}
              >
                <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                <span className="text-[10px] font-black mt-0.5">قفز</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
