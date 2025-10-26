import React, { useState } from 'react';
import CopyButton from './CopyButton';
import CubicBezierEditor from './CubicBezierEditor';
import { useTelegram } from '../hooks/useTelegram';

interface Point { x: number; y: number; }
type AnimationDirection = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

interface ControlsProps {
  duration: number;
  setDuration: (duration: number) => void;
  delay: number;
  setDelay: (delay: number) => void;
  p1: Point;
  p2: Point;
  onBezierChange: (p1: Point, p2: Point) => void;
  iterationCount: string;
  setIterationCount: (count: string) => void;
  animationDirection: AnimationDirection;
  setAnimationDirection: (direction: AnimationDirection) => void;
  generatedCss: string;
}

const Controls: React.FC<ControlsProps> = ({
  duration,
  setDuration,
  delay,
  setDelay,
  p1,
  p2,
  onBezierChange,
  iterationCount,
  setIterationCount,
  animationDirection,
  setAnimationDirection,
  generatedCss,
}) => {
  const directions: AnimationDirection[] = ['normal', 'reverse', 'alternate', 'alternate-reverse'];
  const [isCopied, setIsCopied] = useState(false);
  const { triggerHapticFeedback } = useTelegram();

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCss).then(() => {
      setIsCopied(true);
      triggerHapticFeedback('light');
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <footer className="controls">
      <fieldset className="control-group">
        <legend>Timing</legend>
        <div className="slider">
          <label>Duration: {duration}s</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value))}
          />
        </div>
        <div className="slider">
          <label>Delay: {delay}s</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={delay}
            onChange={(e) => setDelay(parseFloat(e.target.value))}
          />
        </div>
      </fieldset>

      <fieldset className="control-group">
        <legend>Easing</legend>
        <CubicBezierEditor p1={p1} p2={p2} onChange={onBezierChange} />
      </fieldset>

      <fieldset className="control-group extra-controls">
        <legend>Advanced</legend>
        <div className="input-group">
          <label>Iterations</label>
          <input
            type="text"
            value={iterationCount}
            onChange={(e) => setIterationCount(e.target.value)}
            placeholder="e.g., 1 or 'infinite'"
          />
        </div>
        <div className="input-group select-wrapper">
          <label>Direction</label>
          <select
            value={animationDirection}
            onChange={(e) => setAnimationDirection(e.target.value as AnimationDirection)}
          >
            {directions.map(dir => <option key={dir} value={dir}>{dir}</option>)}
          </select>
        </div>
      </fieldset>
      <CopyButton onClick={handleCopy} isCopied={isCopied} />
    </footer>
  );
};

export default Controls;