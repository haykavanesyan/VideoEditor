import React, { LegacyRef } from 'react';
import { Clock } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { videoStore } from '../../stores';
import { formatTime } from '../../utils/formatTime';
import styles from './Timeline.module.scss';

interface TimelineProps {
  timelineRef: LegacyRef<HTMLDivElement>
  isDragging: 'start' | 'end' | null
  onDragStart: (type: 'start' | 'end') => void
}

const Timeline: React.FC<TimelineProps> = observer(({ timelineRef, isDragging, onDragStart }) => {
  const store = videoStore

  const handleMarkerMouseDown = (type: 'start' | 'end') => {
    onDragStart(type);
  };

  const handleMarkerTouchStart = (type: 'start' | 'end') => (e: React.TouchEvent) => {
    e.stopPropagation();
    onDragStart(type);
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
          onTouchStart={handleMarkerTouchStart('start')}
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
          onTouchStart={handleMarkerTouchStart('end')}
          style={{ left: `${(store.trimEnd / store.duration) * 100}%` }}
        >
          <div className={styles.markerHandle} />
        </div>
      </div>
    </div>
  );
});

export default Timeline;
