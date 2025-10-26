import React from 'react';

type AnimationType = 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce' | 'flip';

type SlideDirection = 'left' | 'right' | 'up' | 'down';

interface HeaderProps {
  animationType: AnimationType;
  setAnimationType: (type: AnimationType) => void;
  slideDirection: SlideDirection;
  setSlideDirection: (direction: SlideDirection) => void;
}

const Header: React.FC<HeaderProps> = ({
  animationType,
  setAnimationType,
  slideDirection,
  setSlideDirection,
}) => {
  const animationTypes: AnimationType[] = ['fade', 'slide', 'scale', 'rotate', 'bounce', 'flip'];
  const slideDirections: SlideDirection[] = ['left', 'right', 'up', 'down'];

  return (
    <header className="header">
      <h2 className="block-title">Animation Type</h2>
      <div className="block-subtitle" style={{ display: 'block !important', color: 'red !important', fontSize: '16px' }}>
        A Telegram bot for creating and previewing CSS animations.
      </div>
      <div className="tabs">
        {animationTypes.map((type) => (
          <button
            key={type}
            className={`control-button ${animationType === type ? 'active' : ''}`}
            onClick={() => setAnimationType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      {animationType === 'slide' && (
        <div className="sub-block">
          <h3 className="block-subtitle">Direction</h3>
          <div className="tabs sub-tabs">
            {slideDirections.map((direction) => (
              <button
                key={direction}
                className={`control-button ${slideDirection === direction ? 'active' : ''}`}
                onClick={() => setSlideDirection(direction)}
              >
                {direction}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;