export type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'flip';
export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
export type SlideDirection = 'left' | 'right' | 'up' | 'down';
export type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

export interface AnimationPresetParams {
  type: AnimationType;
  duration: number;
  delay: number;
  easing: string; // Can be 'ease-in' or 'cubic-bezier(...)'
  p1?: { x: number, y: number };
  p2?: { x: number, y: number };
  direction?: SlideDirection;
  iterationCount?: string;
  animationDirection?: AnimationDirection;
}

export interface AnimationPreset {
  name: string;
  params: AnimationPresetParams;
}

export const animationPresets: AnimationPreset[] = [
  {
    name: 'Плавное появление',
    params: {
      type: 'fade',
      duration: 0.8,
      delay: 0,
      easing: 'ease-out',
    },
  },
  {
    name: 'Вылет слева',
    params: {
      type: 'slide',
      duration: 0.6,
      delay: 0,
      easing: 'ease-out',
      direction: 'left',
    },
  },
  {
    name: 'Увеличение',
    params: {
      type: 'scale',
      duration: 0.5,
      delay: 0,
      easing: 'ease-out',
    },
  },
  {
    name: 'Дрожание',
    params: {
      type: 'bounce',
      duration: 1,
      delay: 0,
      easing: 'ease-in-out',
    },
  },
  {
    name: 'Переворот',
    params: {
      type: 'flip',
      duration: 0.7,
      delay: 0,
      easing: 'ease-out',
    },
  },
];