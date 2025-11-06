import { useEffect, useRef, useState, useCallback } from 'react';
import { videoStore } from '../stores';

export const useVideoTimeline = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const store = videoStore;
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

  const getTimeFromClientX = useCallback((clientX: number) => {
    const timeline = timelineRef.current;
    if (!timeline) return 0;
    const rect = timeline.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    return percentage * store.duration;
  }, []);

  const updateTrim = useCallback((clientX: number) => {
    if (!isDragging) return;
    const time = getTimeFromClientX(clientX);

    if (isDragging === 'start') {
      const newStart = Math.min(time, store.trimEnd - 0.1);
      store.update('trimStart', newStart);
      if (videoRef.current) videoRef.current.currentTime = newStart;
    } else {
      const newEnd = Math.max(time, store.trimStart + 0.1);
      store.update('trimEnd', newEnd);
    }
  }, [isDragging, store, videoRef, getTimeFromClientX]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
      if (clientX) updateTrim(clientX);
    };
    const stop = () => setIsDragging(null);

    const opts = { passive: false };
    document.addEventListener('mousemove', handleMove, opts);
    document.addEventListener('mouseup', stop, opts);
    document.addEventListener('touchmove', handleMove, opts);
    document.addEventListener('touchend', stop, opts);
    document.addEventListener('touchcancel', stop, opts);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', stop);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', stop);
      document.removeEventListener('touchcancel', stop);
    };
  }, [isDragging, updateTrim]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => store.update('isPlaying', true);
    const handlePause = () => store.update('isPlaying', false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef, store]);

  const onDragStart = useCallback((type: 'start' | 'end') => {
    setIsDragging(type);
  }, []);

  return { timelineRef, isDragging, onDragStart };
};
