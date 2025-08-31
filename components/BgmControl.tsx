import * as React from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from './icons/SpeakerIcons';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

const VolumeControl = ({ volume, onVolumeChange, className = '' }: VolumeControlProps) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };
  
  return (
    <div className={`flex items-center space-x-2 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg ${className}`}>
      <SpeakerXMarkIcon className={`h-6 w-6 ${volume > 0 ? 'text-gray-400' : 'text-red-500'}`} />
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        aria-label="音量調整"
      />
      <SpeakerWaveIcon className={`h-6 w-6 ${volume > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
    </div>
  );
};
export default VolumeControl;