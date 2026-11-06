import { useState, useCallback, useRef } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { TouchControls } from './components/TouchControls';
import { StoryIntro } from './components/StoryIntro';
import { GameHUD } from './components/GameHUD';
import { ControlState, AnimationState } from './types/game';
import { GuardCommandOptions } from './game/royalGuards';
import { soundManager } from './utils/audio';

export default function App() {
  const [showStory, setShowStory] = useState(true);
  const [isWalking, setIsWalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [resetCameraCount, setResetCameraCount] = useState(0);
  const [cameraDrag, setCameraDrag] = useState<{ deltaX: number; deltaY: number; timestamp: number }>({
    deltaX: 0,
    deltaY: 0,
    timestamp: 0,
  });

  const [gameState, setGameState] = useState<{
    animState: AnimationState;
    isGrounded: boolean;
  }>({
    animState: 'idle',
    isGrounded: true,
  });

  const [isSwordDrawn, setIsSwordDrawn] = useState(false);

  const [guardOptions, setGuardOptions] = useState<GuardCommandOptions>({
    isKneeling: false,
    isHoldPosition: false,
    isProtectFormation: false,
  });
  const [guardNotice, setGuardNotice] = useState<string | null>(null);

  // New interactive states requested by user:
  // 1. Invert Joystick X (stick directed right moves player left)
  const [invertJoystickX, setInvertJoystickX] = useState<boolean>(true);

  // 2. Sitting on the Throne
  const [isNearThrone, setIsNearThrone] = useState<boolean>(false);
  const [isSittingOnThrone, setIsSittingOnThrone] = useState<boolean>(false);

  // 3. Landscape / Horizontal gameplay mode
  const [isLandscapeMode, setIsLandscapeMode] = useState<boolean>(false);

  const showGuardNotice = (msg: string) => {
    setGuardNotice(msg);
    setTimeout(() => {
      setGuardNotice((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  const handleToggleKneel = useCallback(() => {
    setGuardOptions((prev) => {
      const next = !prev.isKneeling;
      if (next) {
        soundManager.playGuardBow();
        showGuardNotice('🧎‍♂️ أمر ملكي: سجود الحراس وانحناؤهم الكامل بالأرض خافضي الرؤوس إجلالاً للسلطان');
      } else {
        soundManager.playClick();
        showGuardNotice('👑 إذن ملكي: الإذن للحراس بالرفع من السجود والقيام');
      }
      return {
        ...prev,
        isKneeling: next,
      };
    });
  }, []);

  const handleToggleHoldPosition = useCallback(() => {
    setGuardOptions((prev) => {
      const next = !prev.isHoldPosition;
      if (next) {
        soundManager.playGuardHalt();
        showGuardNotice('🛑 أمر ملكي: توقيف الحراس في مكانهم دون اتباع السلطان');
      } else {
        soundManager.playClick();
        showGuardNotice('🚶 أمر ملكي: استئناف الحراس لمرافقة السلطان');
      }
      return {
        ...prev,
        isHoldPosition: next,
        isKneeling: false,
      };
    });
  }, []);

  const handleToggleProtectFormation = useCallback(() => {
    setGuardOptions((prev) => {
      const next = !prev.isProtectFormation;
      if (next) {
        soundManager.playGuardProtect();
        showGuardNotice('🛡️ أمر ملكي: تشكيل حماية الملك! حارس في الأمام وحارس في الخلف، وقفل الحركة للدفاع التام');
      } else {
        soundManager.playClick();
        showGuardNotice('👥 فك وضع الحماية: استئناف الحركة والمرافقة بجانب الملك (يمين ويسار)');
      }
      return {
        ...prev,
        isProtectFormation: next,
        isKneeling: false,
      };
    });
  }, []);

  const controlsRef = useRef<ControlState>({
    moveX: 0,
    moveY: 0,
    isWalking: false,
    isRunning: false,
    isJumping: false,
    cameraRotateX: 0,
    cameraRotateY: 0,
    isSwordDrawn: false,
    isAttacking: false,
  });

  const [controls, setControls] = useState<ControlState>(controlsRef.current);

  const handleControlChange = useCallback((updated: Partial<ControlState>) => {
    // If Sultan is seated on throne and player steers joystick, stand up smoothly
    if (controlsRef.current.isSittingOnThrone && updated.moveX !== undefined && updated.moveY !== undefined) {
      if (Math.hypot(updated.moveX, updated.moveY) > 0.35) {
        controlsRef.current.isSittingOnThrone = false;
        setIsSittingOnThrone(false);
        showGuardNotice('👑 نهض السلطان عاشور العاشر من العرش الملكي');
      }
    }

    controlsRef.current = {
      ...controlsRef.current,
      ...updated,
    };
    if (updated.isSwordDrawn !== undefined) {
      setIsSwordDrawn(updated.isSwordDrawn);
    }
    setControls({ ...controlsRef.current });
  }, []);

  const handleToggleSword = useCallback(() => {
    setIsSwordDrawn((prev) => {
      const next = !prev;
      controlsRef.current.isSwordDrawn = next;
      setControls({ ...controlsRef.current });
      return next;
    });
  }, []);

  const handleAttack = useCallback(() => {
    controlsRef.current.isSwordDrawn = true;
    controlsRef.current.isAttacking = true;
    setIsSwordDrawn(true);
    setControls({ ...controlsRef.current });

    // Reset attacking pulse
    setTimeout(() => {
      controlsRef.current.isAttacking = false;
      setControls({ ...controlsRef.current });
    }, 120);
  }, []);

  const handleToggleWalk = useCallback(() => {
    soundManager.playClick();
    setIsWalking((prev) => {
      const next = !prev;
      controlsRef.current.isWalking = next;
      setControls({ ...controlsRef.current });
      return next;
    });
  }, []);

  const handleCameraDrag = useCallback((deltaX: number, deltaY: number) => {
    setCameraDrag({
      deltaX,
      deltaY,
      timestamp: Date.now(),
    });
  }, []);

  const handleResetCamera = useCallback(() => {
    setResetCameraCount((c) => c + 1);
  }, []);

  const handleToggleInvertJoystickX = useCallback(() => {
    soundManager.playClick();
    setInvertJoystickX((prev) => {
      const next = !prev;
      showGuardNotice(
        next
          ? '⇄ تم تفعيل توجيه العصا المعكوس: اليمين = يسار (حسب الطلب)'
          : '⇄ تم تفعيل توجيه العصا العادي: اليمين = يمين'
      );
      return next;
    });
  }, []);

  const handleToggleSitOnThrone = useCallback(() => {
    setIsSittingOnThrone((prev) => {
      const next = !prev;
      controlsRef.current.isSittingOnThrone = next;
      setControls({ ...controlsRef.current });
      if (next) {
        soundManager.playThroneSit();
        showGuardNotice('👑 جلس السلطان عاشور العاشر بهيبة ووقار فوق عرش المملكة العاشورية!');
      } else {
        soundManager.playClick();
        showGuardNotice('👑 نهض السلطان من العرش لاستكمال جولته وحراسة القصر');
      }
      return next;
    });
  }, []);

  const handleToggleLandscape = useCallback(() => {
    soundManager.playClick();
    setIsLandscapeMode((prev) => {
      const next = !prev;
      if (next) {
        try {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
          if (screen.orientation && 'lock' in screen.orientation) {
            (screen.orientation as unknown as { lock: (mode: string) => Promise<void> }).lock('landscape').catch(() => {});
          }
        } catch {
          // Ignore
        }
        showGuardNotice('🔄 تم تفعيل وضع اللعب الأفقي (Landscape Mode)');
      } else {
        try {
          if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          if (screen.orientation && 'unlock' in screen.orientation) {
            (screen.orientation as unknown as { unlock: () => void }).unlock();
          }
        } catch {
          // Ignore
        }
        showGuardNotice('📱 العودة للوضع القياسي');
      }
      return next;
    });
  }, []);

  const handleStoryComplete = useCallback(() => {
    setShowStory(false);
    soundManager.startRoyalAmbience();
  }, []);

  const handleOpenStory = useCallback(() => {
    setShowStory(true);
  }, []);

  const handleToggleSound = useCallback(() => {
    const next = !isMuted;
    soundManager.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black select-none touch-none ${isLandscapeMode ? 'w-screen h-screen' : ''}`}>
      {/* 3D Game Canvas */}
      <GameCanvas
        controls={controls}
        onStateUpdate={setGameState}
        resetCameraTrigger={resetCameraCount}
        cameraDrag={cameraDrag}
        guardOptions={guardOptions}
        onNearThroneChange={setIsNearThrone}
      />

      {/* Royal Order Toast Notification */}
      {guardNotice && (
        <div className="absolute top-20 inset-x-4 max-w-xl mx-auto z-40 pointer-events-none flex justify-center animate-bounce">
          <div className="bg-stone-950/90 border-2 border-amber-400/90 text-amber-200 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs sm:text-sm font-black flex items-center gap-2 text-center">
            <span>{guardNotice}</span>
          </div>
        </div>
      )}

      {/* Touch & Joystick Controls Overlay (Visible when not in story intro) */}
      {!showStory && (
        <>
          <TouchControls
            onControlChange={handleControlChange}
            onCameraDrag={handleCameraDrag}
            onResetCamera={handleResetCamera}
            isWalking={isWalking}
            onToggleWalk={handleToggleWalk}
            isSwordDrawn={isSwordDrawn}
            onToggleSword={handleToggleSword}
            onAttack={handleAttack}
            guardOptions={guardOptions}
            onToggleKneel={handleToggleKneel}
            onToggleHoldPosition={handleToggleHoldPosition}
            onToggleProtectFormation={handleToggleProtectFormation}
            invertJoystickX={invertJoystickX}
            onToggleInvertJoystickX={handleToggleInvertJoystickX}
            isNearThrone={isNearThrone}
            isSittingOnThrone={isSittingOnThrone}
            onToggleSitOnThrone={handleToggleSitOnThrone}
            isLandscapeMode={isLandscapeMode}
            onToggleLandscape={handleToggleLandscape}
          />

          <GameHUD
            animState={gameState.animState}
            isGrounded={gameState.isGrounded}
            onResetCamera={handleResetCamera}
            onOpenStory={handleOpenStory}
            onToggleSound={handleToggleSound}
            isMuted={isMuted}
            isWalking={isWalking}
            isSwordDrawn={isSwordDrawn}
            guardOptions={guardOptions}
            onToggleKneel={handleToggleKneel}
            onToggleHoldPosition={handleToggleHoldPosition}
            onToggleProtectFormation={handleToggleProtectFormation}
            isLandscapeMode={isLandscapeMode}
            onToggleLandscape={handleToggleLandscape}
            isSittingOnThrone={isSittingOnThrone}
          />
        </>
      )}

      {/* Cinematic Story Sequence */}
      {showStory && <StoryIntro onComplete={handleStoryComplete} />}
    </div>
  );
}
