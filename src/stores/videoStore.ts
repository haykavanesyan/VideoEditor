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
  exportProgress: number = 0;
  exportUrl: string | null = null;
  abortController: AbortController | null = null;

  showUploadZone: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  update<K extends keyof VideoStore>(key: K, value: VideoStore[K]) {
    (this[key] as VideoStore[K]) = value;
  }

  uploadFile(file: File, url: string) {
    if (this.exportUrl) {
      URL.revokeObjectURL(this.exportUrl);
      this.exportUrl = null;
    }

    this.videoFile = file;
    this.videoUrl = url;
    this.showUploadZone = false;
  }

  resetTrim() {
    this.trimStart = 0;
    this.trimEnd = this.duration;
    this.playbackSpeed = 1;
  }

  resetUpload() {
    if (this.exportUrl) {
      URL.revokeObjectURL(this.exportUrl);
      this.exportUrl = null;
    }
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
    }

    this.videoFile = null;
    this.videoUrl = '';
    this.duration = 0;
    this.trimStart = 0;
    this.trimEnd = 0;
    this.currentTime = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    this.showUploadZone = true;
  }

  get trimDuration() {
    return Math.max((this.trimEnd || 0) - (this.trimStart || 0), 0);
  }

  get canExport() {
    return (
      !!this.videoFile &&
      !this.isExporting &&
      this.trimDuration > 0 &&
      this.duration > 0
    );
  }

  cancelExport() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      this.isExporting = false;
      this.exportProgress = 0;
    }
  }

  finishExport() {
    this.isExporting = false;
    this.exportProgress = 0;
    this.abortController = null;
  }
}

export const videoStore = new VideoStore();
