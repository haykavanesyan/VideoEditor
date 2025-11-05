import React, { useRef, useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';

import { videoStore } from '../../stores';
import { formatTime } from '../../utils/formatTime';

import styles from './Timeline.module.scss';

interface TimelineProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const Timeline: React.FC<TimelineProps> = observer(({ videoRef }) => {
  const store = videoStore;
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const timeline = timelineRef.current;
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const time = percentage * store.duration;

    if (isDragging === 'start') {
      store.setTrimStart(Math.min(time, store.trimEnd - 0.1));
      const video = videoRef.current
      if (video) {
        video.currentTime = Math.min(time, store.trimEnd - 0.1)
      }
    } else if (isDragging === 'end') {
      store.setTrimEnd(Math.max(time, store.trimStart + 0.1));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, store.duration, store.trimStart, store.trimEnd]);

  const handleMarkerMouseDown = (type: 'start' | 'end') => {
    setIsDragging(type);
  };

  return (
    <div className={styles.timelineContainer}>
      <div className={styles.timelineHeader}>
        <div className={styles.trimInfo}>
          <Clock size={20} className={styles.clockIcon} />
          <span className={styles.trimText}>
            Trim: {formatTime(store.trimStart)} - {formatTime(store.trimEnd)}
          </span>
          <span className={styles.durationBadge}>
            {formatTime(store.trimDuration)} duration
          </span>
        </div>
        <span className={styles.currentTime}>
          Current: {formatTime(store.currentTime)}
        </span>
      </div>

      <div
        ref={timelineRef}
        className={styles.timeline}
        style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
      >
        <div
          className={styles.selectedRange}
          style={{
            left: `${(store.trimStart / store.duration) * 100}%`,
            width: `${((store.trimEnd - store.trimStart) / store.duration) * 100}%`,
          }}
        />

        <div
          className={styles.currentTimeIndicator}
          style={{ left: `${(store.currentTime / store.duration) * 100}%` }}
        />

        <div
          className={styles.marker}
          data-type="start"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMarkerMouseDown('start');
          }}
          style={{ left: `${(store.trimStart / store.duration) * 100}%` }}
        >
          <div className={styles.markerHandle} />
        </div>

        <div
          className={styles.marker}
          data-type="end"
          onMouseDown={(e) => {
            e.stopPropagation();
            handleMarkerMouseDown('end');
          }}
          style={{ left: `${(store.trimEnd / store.duration) * 100}%` }}
        >
          <div className={styles.markerHandle} />
        </div>
      </div>
    </div>
  );
});

export default Timeline;