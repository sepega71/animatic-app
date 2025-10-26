

import { useState, useEffect } from 'react';
import Header from './components/Header';
import Preview from './components/Preview';
import Controls from './components/Controls';
import PresetsGallery from './components/PresetsGallery';
import { generateAnimationCss } from './core/css-generator';
import { useTelegram } from './hooks/useTelegram';
import type { AnimationPreset } from './core/presets';

type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'flip';
// type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'; // No longer needed
type SlideDirection = 'left' | 'right' | 'up' | 'down';
type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
export type DemoShape = 'square' | 'circle' | 'text';

interface Preset {
  animationType: AnimationType;
  duration: number;
  delay: number;
  // easing: string; // No longer needed, we use p1 and p2
  p1?: { x: number, y: number };
  p2?: { x: number, y: number };
  slideDirection?: SlideDirection;
  iterationCount?: string;
  animationDirection?: AnimationDirection;
}

function App() {
  const { tg, saveData, readData } = useTelegram();
  const [animationType, setAnimationType] = useState<AnimationType>('fade');
  const [duration, setDuration] = useState(0.6);
  const [delay, setDelay] = useState(0);
  const [p1, setP1] = useState({ x: 0.25, y: 0.1 });
  const [p2, setP2] = useState({ x: 0.25, y: 1.0 });
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('left');
  const [iterationCount, setIterationCount] = useState<string>('1');
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('normal');
  const [demoShape, setDemoShape] = useState<DemoShape>('square');

  useEffect(() => {
    const onThemeChanged = () => {
      document.body.setAttribute('data-theme', tg.colorScheme);
    };

    tg.onEvent('themeChanged', onThemeChanged);
    onThemeChanged(); // Set initial theme

    readData().then(preset => {
      if (preset) {
        const p = preset as Preset;
        setAnimationType(p.animationType);
        setDuration(p.duration);
        setDelay(p.delay);
        if (p.p1 && p.p2) {
          setP1(p.p1);
          setP2(p.p2);
        }
        if (p.slideDirection) {
          setSlideDirection(p.slideDirection);
        }
        if (p.iterationCount) {
          setIterationCount(p.iterationCount);
        }
        if (p.animationDirection) {
          setAnimationDirection(p.animationDirection);
        }
      }
    });

    // Cleanup event listener on component unmount
    return () => {
      tg.offEvent('themeChanged', onThemeChanged);
    };
  }, [tg, readData]);

  useEffect(() => {
    saveData({ animationType, duration, delay, p1, p2, slideDirection, iterationCount, animationDirection });
  }, [animationType, duration, delay, p1, p2, slideDirection, iterationCount, animationDirection, saveData]);

  const generatedCss = generateAnimationCss({
    type: animationType,
    direction: slideDirection,
    duration,
    delay,
    easing: `cubic-bezier(${p1.x.toFixed(2)}, ${p1.y.toFixed(2)}, ${p2.x.toFixed(2)}, ${p2.y.toFixed(2)})`,
    iterationCount,
    animationDirection,
  });

  const handleSelectPreset = (preset: AnimationPreset) => {
    const { type, duration, delay, direction, iterationCount, animationDirection, p1: presetP1, p2: presetP2 } = preset.params;
    setAnimationType(type);
    setDuration(duration);
    setDelay(delay);
    if (presetP1 && presetP2) {
      setP1(presetP1);
      setP2(presetP2);
    }
    if (direction) {
      setSlideDirection(direction);
    }
    if (iterationCount) {
      setIterationCount(iterationCount);
    }
    if (animationDirection) {
      setAnimationDirection(animationDirection);
    }
  };

  return (
    <div className="app-container">
      <Header
        animationType={animationType}
        setAnimationType={setAnimationType}
        slideDirection={slideDirection}
        setSlideDirection={setSlideDirection}
      />
      <PresetsGallery onSelectPreset={handleSelectPreset} />
      <Preview
        animationType={animationType}
        slideDirection={slideDirection}
        demoShape={demoShape}
        setDemoShape={setDemoShape}
      />
      <Controls
        duration={duration}
        setDuration={setDuration}
        delay={delay}
        setDelay={setDelay}
        p1={p1}
        p2={p2}
        onBezierChange={(np1: { x: number, y: number }, np2: { x: number, y: number }) => {
          setP1(np1);
          setP2(np2);
        }}
        iterationCount={iterationCount}
        setIterationCount={setIterationCount}
        animationDirection={animationDirection}
        setAnimationDirection={setAnimationDirection}
        generatedCss={generatedCss}
      />
      <style>{generatedCss}</style>
    </div>
  );
}

export default App;
