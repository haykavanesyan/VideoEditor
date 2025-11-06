import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import { videoStore } from '../../stores';

import styles from './VideoPlayer.module.scss';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = observer(({ 
  videoRef, 
  onLoadedMetadata, 
  onTimeUpdate 
}) => {
  const store = videoStore;

  return (
    <div className={styles.videoPlayer}>
      <video
        ref={videoRef}
        src={store.videoUrl}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        className={styles.video}
      />
    </div>
  );
});

export default VideoPlayer;