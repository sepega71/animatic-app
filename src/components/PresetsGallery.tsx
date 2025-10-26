import React from 'react';
import { animationPresets } from '../core/presets';
import type { AnimationPreset } from '../core/presets';

interface PresetsGalleryProps {
  onSelectPreset: (preset: AnimationPreset) => void;
}

const PresetsGallery: React.FC<PresetsGalleryProps> = ({ onSelectPreset }) => {
  return (
    <div className="presets-gallery">
      <h3>Presets</h3>
      <div className="presets-grid">
        {animationPresets.map((preset) => (
          <button
            key={preset.name}
            className="control-button"
            onClick={() => onSelectPreset(preset)}
          >
            {preset.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PresetsGallery;