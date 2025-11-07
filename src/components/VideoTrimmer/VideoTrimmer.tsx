import React, { useRef, useEffect } from 'react';
import { Scissors, Download, Plus, X } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { videoStore } from '../../stores';
import UploadZone from '../UploadZone/UploadZone';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import Controls from '../Controls/Controls';
import Timeline from '../Timeline/Timeline';
import Progress from '../Progress/Progress';
import { ffmpegService } from '../../services/ffmpegService';
import { errorService } from '../../services/errorService';
import { useVideoTimeline } from '../../hooks/useVideoTimeline';

import styles from './VideoTrimmer.module.scss';

const VideoTrimmer: React.FC = observer(() => {
  const store = videoStore;
  const videoRef = useRef<HTMLVideoElement>(null);

  const { timelineRef, isDragging, onDragStart } = useVideoTimeline(videoRef);

  const cleanupUrls = () => {
    if (store.videoUrl) URL.revokeObjectURL(store.videoUrl);
    if (store.exportUrl) URL.revokeObjectURL(store.exportUrl);
  };

  const getVideo = () => {
    const video = videoRef.current;
    if (!video) throw new Error('Video element is not available');
    return video;
  };

  const handleFileUpload = (file: File) => {
    cleanupUrls();
    const url = URL.createObjectURL(file);
    store.uploadFile(file, url);
  };

  const handleLoadedMetadata = () => {
    const video = getVideo();
    if (video && video.duration) {
      store.update('duration', video.duration);
      store.update('trimEnd', video.duration);
    }
  };

  const handleTimeUpdate = () => {
    const video = getVideo();
    if (video && store.duration > 0) {
      store.update('currentTime', video.currentTime);
      if (video.currentTime >= store.trimEnd) {
        video.currentTime = store.trimStart;
      }
    }
  };

  const togglePlayPause = () => {
    const video = getVideo();
    if (!video || store.duration <= 0) return;

    if (store.isPlaying) {
      video.pause();
      store.update('isPlaying', false);
    } else {
      if (video.currentTime >= store.trimEnd || video.currentTime < store.trimStart) {
        video.currentTime = store.trimStart;
      }
      video.play().catch(console.error);
      store.update('isPlaying', true);
    }
  };

  const changeSpeed = (speed: number) => {
    const video = getVideo();
    if (video) {
      video.playbackRate = speed;
      store.update('playbackSpeed', speed);
    }
  };

  const resetTrim = () => {
    store.resetTrim();
    const video = getVideo();
    if (video) {
      video.currentTime = 0;
      video.playbackRate = 1;
      video.pause();
    }
  };

  const handleFileReset = () => {
    cleanupUrls();
    store.resetUpload();
    resetTrim();
  };

  const exportVideo = async () => {
    if (!store.videoFile) return;
  
    store.update('isExporting', true);
    store.update('exportProgress', 0);
  
    const controller = new AbortController();
    store.update('abortController', controller);
  
    try {
      const blob = await ffmpegService.trimAndExport(
        store.videoFile,
        store.trimStart,
        store.trimEnd,
        store.playbackSpeed,
        (progress) => store.update('exportProgress', progress),
        controller.signal
      );
  
      const url = URL.createObjectURL(blob);
      if (store.exportUrl) URL.revokeObjectURL(store.exportUrl);
      store.update('exportUrl', url);
  
      const link = document.createElement('a');
      link.href = url;
      link.download = `trimmed_${store.videoFile.name}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        errorService.handle('warning', '', 'Export canceled');
      } else {
        errorService.handle('error', err, 'Failed to export video');
      }
    } finally {
      store.finishExport();
    }
  };

  useEffect(() => {
    return () => {
      cleanupUrls()
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Scissors size={32} />
            <div>
              <h1 className={styles.title}>Video Trimmer</h1>
              <p className={styles.subtitle}>Trim your videos with precision and ease</p>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {store.showUploadZone ? (
            <UploadZone onFileUpload={handleFileUpload} />
          ) : (
            <div className={styles.editor}>
              <div className={styles.uploadNewContainer}>
                <button onClick={handleFileReset} className={styles.uploadNewButton}>
                  <Plus size={16} />
                  Upload new video
                </button>
              </div>

              <VideoPlayer
                videoRef={videoRef}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
              />

              <Controls
                onPlayPause={togglePlayPause}
                onSpeedChange={changeSpeed}
                onResetTrim={resetTrim}
              />

              <Timeline
                timelineRef={timelineRef}
                isDragging={isDragging}
                onDragStart={onDragStart}
              />

              <Progress />

              <button
                onClick={exportVideo}
                disabled={store.isExporting || !store.videoFile || store.trimDuration <= 0}
                className={styles.exportButton}
              >
                {store.isExporting ? (
                  <>
                    <div className={styles.spinner} />
                    Exporting... {store.exportProgress}%
                  </>
                ) : (
                  <>
                    <Download size={24} />
                    Export Trimmed Video
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default VideoTrimmer;