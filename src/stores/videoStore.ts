import { makeAutoObservable } from 'mobx';

class VideoStore {
  videoFile: File | null = null;
  videoUrl: string = '';
  duration: number = 0;
  currentTime: number = 0;
  trimStart: number = 0;
  trimEnd: number = 0;
  isPlaying: boolean = false;
  playbackSpeed: number = 1;
  isExporting: boolean = false;
  showUploadZone: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  setVideoFile(file: File | null) {
    this.videoFile = file;
  }

  setVideoUrl(url: string) {
    this.videoUrl = url;
  }

  setDuration(duration: number) {
    this.duration = duration;
  }

  setCurrentTime(currentTime: number) {
    this.currentTime = currentTime;
  }

  setTrimStart(trimStart: number) {
    this.trimStart = trimStart;
  }

  setTrimEnd(trimEnd: number) {
    this.trimEnd = trimEnd;
  }

  setIsPlaying(isPlaying: boolean) {
    this.isPlaying = isPlaying;
  }

  setPlaybackSpeed(playbackSpeed: number) {
    this.playbackSpeed = playbackSpeed;
  }

  setIsExporting(isExporting: boolean) {
    this.isExporting = isExporting;
  }

  setShowUploadZone(show: boolean) {
    this.showUploadZone = show;
  }

  resetTrim() {
    this.trimStart = 0;
    this.trimEnd = this.duration;
  }

  reset() {
    this.videoFile = null;
    this.videoUrl = '';
    this.duration = 0;
    this.currentTime = 0;
    this.trimStart = 0;
    this.trimEnd = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    this.isExporting = false;
    this.showUploadZone = true;
  }

  get trimDuration() {
    return this.trimEnd - this.trimStart;
  }
}

export const videoStore = new VideoStore();