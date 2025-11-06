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

  update<K extends keyof VideoStore>(key: K, value: VideoStore[K]) {
    (this[key] as VideoStore[K]) = value;
  }

  uploadFile(file: File, url: string) {
    this.videoFile = file
    this.videoUrl = url
    this.showUploadZone = false
  }

  resetTrim() {
    this.trimStart = 0
    this.trimEnd = this.duration
    this.playbackSpeed = 1
  }

  resetUpload() {
    this.videoFile = null
    this.videoUrl = ''
    this.showUploadZone = true
  }

  get trimDuration() {
    return this.trimEnd - this.trimStart;
  }
}

export const videoStore = new VideoStore();