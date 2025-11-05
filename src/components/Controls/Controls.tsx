import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { videoStore } from '../../stores';

import styles from './Controls.module.scss';

interface ControlsProps {
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onResetTrim: () => void;
}

const Controls: React.FC<ControlsProps> = observer(({ onPlayPause, onSpeedChange, onResetTrim }) => {
  const store = videoStore;
  const speedOptions = [0.5, 1, 1.5, 2];

  return (
    <div className={styles.controls}>
      <button 
        onClick={onPlayPause} 
        className={styles.playButton}
        disabled={!store.videoUrl}
      >
        {store.isPlaying ? <Pause size={20} /> : <Play size={20} />}
        {store.isPlaying ? 'Pause' : 'Play'}
      </button>

      <div className={styles.speedControls}>
        <span className={styles.speedLabel}>Speed:</span>
        {speedOptions.map(speed => (
          <button
            key={speed}
            onClick={() => onSpeedChange(speed)}
            className={`${styles.speedButton} ${
              store.playbackSpeed === speed ? styles.speedButtonActive : ''
            }`}
            disabled={!store.videoUrl}
          >
            {speed}x
          </button>
        ))}
      </div>

      <button 
        onClick={onResetTrim} 
        className={styles.resetButton}
        disabled={!store.videoUrl}
      >
        <RotateCcw size={16} />
        Reset
      </button>
    </div>
  );
});

export default Controls;