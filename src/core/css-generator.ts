interface AnimationParams {
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'flip';
  direction?: 'in' | 'out' | 'left' | 'right' | 'up' | 'down';
  duration: number; // in seconds
  delay: number; // in seconds
  easing: string;
  iterationCount?: string;
  animationDirection?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

export const generateAnimationCss = (params: AnimationParams): string => {
  const { type, duration, delay, easing, iterationCount = '1', animationDirection = 'normal' } = params;

  switch (type) {
    case 'fade': {
      // For now, only fade-in is implemented
      const keyframes = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}`;
      const animationClass = `
.fade-in {
  animation: fadeIn ${duration}s ${easing} ${delay}s ${iterationCount} ${animationDirection} forwards;
}`;
      return `${keyframes}\n${animationClass}`;
    }

    case 'slide': {
      const direction = params.direction || 'left';
      const startTransform =
        direction === 'left' ? 'translateX(-100%)' :
        direction === 'right' ? 'translateX(100%)' :
        direction === 'up' ? 'translateY(-100%)' : 'translateY(100%)';

      const keyframes = `
@keyframes slideInFrom${direction.charAt(0).toUpperCase() + direction.slice(1)} {
  from { transform: ${startTransform}; opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}`;
      const animationClass = `
.slide-in-${direction} {
  animation: slideInFrom${direction.charAt(0).toUpperCase() + direction.slice(1)} ${duration}s ${easing} ${delay}s ${iterationCount} ${animationDirection} forwards;
}`;
      return `${keyframes}\n${animationClass}`;
    }
    case 'scale': {
        const keyframes = `
@keyframes scaleIn {
  from { transform: scale(0); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`;
        const animationClass = `
.scale-in {
  animation: scaleIn ${duration}s ${easing} ${delay}s ${iterationCount} ${animationDirection} forwards;
}`;
        return `${keyframes}\n${animationClass}`;
    }
    case 'rotate': {
        const keyframes = `
@keyframes rotateIn {
  from { transform: rotate(-360deg); opacity: 0; }
  to { transform: rotate(0deg); opacity: 1; }
}`;
        const animationClass = `
.rotate-in {
  animation: rotateIn ${duration}s ${easing} ${delay}s ${iterationCount} ${animationDirection} forwards;
}`;
        return `${keyframes}\n${animationClass}`;
    }
    case 'bounce': {
        const keyframes = `
@keyframes bounceIn {
  0%, 20%, 40%, 60%, 80%, 100% {
    transition-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
  }
  0% { opacity: 0; transform: scale3d(.3, .3, .3); }
  20% { transform: scale3d(1.1, 1.1, 1.1); }
  40% { transform: scale3d(.9, .9, .9); }
  60% { opacity: 1; transform: scale3d(1.03, 1.03, 1.03); }
  80% { transform: scale3d(.97, .97, .97); }
  100% { opacity: 1; transform: scale3d(1, 1, 1); }
}`;
        const animationClass = `
.bounce-in {
  animation: bounceIn ${duration}s ${easing} ${delay}s ${iterationCount} ${animationDirection} forwards;
}`;
        return `${keyframes}\n${animationClass}`;
    }
    case 'flip': {
        const keyframes = `
@keyframes flipInX {
  from {
    transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
    animation-timing-function: ease-in;
    opacity: 0;
  }
  40% {
    transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
    animation-timing-function: ease-in;
  }
  60% {
    transform: perspective(400px) rotate3d(1, 0, 0, 10deg);
    opacity: 1;
  }
  80% {
    transform: perspective(400px) rotate3d(1, 0, 0, -5deg);
  }
  to {
    transform: perspective(400px);
  }
}`;
        const animationClass = `
.flip-in {
  backface-visibility: visible !important;
  animation: flipInX ${duration}s ${easing} ${delay}s ${iterationCount} ${animationDirection} forwards;
}`;
        return `${keyframes}\n${animationClass}`;
    }
    default:
      return '';
  }
};