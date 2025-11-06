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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => store.update('isPlaying',true);
    const handlePause = () => store.update('isPlaying',false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef, store]);

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