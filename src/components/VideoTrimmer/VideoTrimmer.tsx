import React, { useRef } from 'react';
import { Scissors, Download, Plus } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { videoStore } from '../../stores';
import UploadZone from '../UploadZone/UploadZone';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import Controls from '../Controls/Controls';
import Timeline from '../Timeline/Timeline';
import { ffmpegService } from '../../services/ffmpegService';

import styles from './VideoTrimmer.module.scss';

const VideoTrimmer: React.FC = observer(() => {
  const store = videoStore;
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    store.uploadFile(file, url)
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      store.update('duration', video.duration);
      store.update('trimEnd', video.duration);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      store.update('currentTime', video.currentTime);
      if (video.currentTime >= store.trimEnd) {
        video.currentTime = store.trimStart;
      }
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
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
    }
  };

  const changeSpeed = (speed: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      store.update('playbackSpeed', speed);
    }
  };

  const resetTrim = () => {
    store.resetTrim()
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.playbackRate = 1
      video.pause()
    }
  };

  const handleFileReset = () => {
    store.resetUpload()
    resetTrim()
  };

  const exportVideo = async () => {
    if (!store.videoFile) return;

    store.update('isExporting', true);
    try {
      await ffmpegService.load();

      const blob = await ffmpegService.trimAndExport(
        store.videoFile,
        store.trimStart,
        store.trimEnd,
        store.playbackSpeed
      );

      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `trimmed_${store.videoFile.name}`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export video');
    } finally {
      store.update('isExporting', false);
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Scissors size={32} />
            <div>
              <h1 className={styles.title}>Video Trimmer</h1>
              <p className={styles.subtitle}>
                Trim your videos with precision and ease
              </p>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {store.showUploadZone ? (
            <UploadZone onFileUpload={handleFileUpload} />
          ) : (
            <div className={styles.editor}>
              <div
                className={styles.uploadNewContainer}
              >
                <button
                  onClick={handleFileReset}
                  className={styles.uploadNewButton}
                >
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

              <Timeline videoRef={videoRef} />

              <button
                onClick={exportVideo}
                disabled={store.isExporting || !store.videoFile}
                className={styles.exportButton}
              >
                {store.isExporting ? (
                  <>
                    <div className={styles.spinner} />
                    Exporting...
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