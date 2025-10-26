import React, { useState, useEffect } from 'react';
import type { DemoShape } from '../App';

type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'flip';
type SlideDirection = 'left' | 'right' | 'up' | 'down';

interface PreviewProps {
  animationType: AnimationType;
  slideDirection: SlideDirection;
  demoShape: DemoShape;
  setDemoShape: (shape: DemoShape) => void;
}

const Preview: React.FC<PreviewProps> = ({
  animationType,
  slideDirection,
  demoShape,
  setDemoShape,
}) => {
  const [key, setKey] = useState(0);
  const shapes: DemoShape[] = ['square', 'circle', 'text'];

  // By changing the key, we force React to re-render the component,
  // which will re-trigger the CSS animation.
  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [animationType, slideDirection, demoShape]);

  const getAnimationClass = () => {
    // This is a simplified example. In a real app, you might have more complex logic
    // to map animationType to a specific CSS class.
    switch (animationType) {
      case 'fade': return 'fade-in';
      case 'slide': return `slide-in-${slideDirection}`;
      case 'scale': return 'scale-in';
      case 'rotate': return 'rotate-in';
      case 'bounce': return 'bounce-in';
      case 'flip': return 'flip-in';
      default: return '';
    }
  }

  const renderDemoBlock = () => {
    const className = `demo-block is-${demoShape} ${getAnimationClass()}`;
    if (demoShape === 'text') {
      return <h1 key={key} className={`${className} gradient-text`}>Animatic</h1>;
    }
    return <div key={key} className={className}></div>;
  }

  return (
    <main className="preview-area">
      <div className="shape-selector">
        {shapes.map(shape => (
          <button
            key={shape}
            className={`control-button ${demoShape === shape ? 'active' : ''}`}
            onClick={() => setDemoShape(shape)}
          >
            {shape}
          </button>
        ))}
      </div>
      {renderDemoBlock()}
    </main>
  );
};

export default Preview;