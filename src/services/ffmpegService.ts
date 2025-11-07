import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg';

class FFmpegService {
  private ffmpeg: FFmpeg;
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  constructor() {
    this.ffmpeg = this.createInstance();
  }

  private createInstance() {
    return createFFmpeg({
      log: false,
      corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
    });
  }

  async load(onProgress?: (progress: number) => void) {
    if (this.isLoaded) return;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      if (onProgress) {
        this.ffmpeg.setProgress(({ ratio }: { ratio: number }) => {
          onProgress(Math.round(ratio * 100));
        });
      }
      await this.ffmpeg.load();
      this.isLoaded = true;
    })();

    return this.loadingPromise;
  }

  reset() {
    try {
      this.ffmpeg.exit();
    } catch {}
    this.ffmpeg = this.createInstance();
    this.isLoaded = false;
    this.loadingPromise = null;
  }

  async trimAndExport(
    file: File,
    start: number,
    end: number,
    speed: number,
    onProgress: (progress: number) => void,
    signal: AbortSignal
  ): Promise<Blob> {
    await this.load(onProgress);

    const input = 'input.mp4';
    const output = 'output.mp4';
    const duration = end - start;

    const args = [
      '-ss', `${start}`,
      '-i', input,
      '-t', `${duration}`,
      '-vf', `setpts=${1 / speed}*PTS`,
      '-af', `atempo=${speed}`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', 'faststart',
      '-y',
      output,
    ];

    this.ffmpeg.FS('writeFile', input, await fetchFile(file));

    const abortPromise = new Promise<never>((_, reject) => {
      signal.addEventListener('abort', () => {
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });

    try {
      await Promise.race([this.ffmpeg.run(...args), abortPromise]);
      onProgress(100);

      const data = this.ffmpeg.FS('readFile', output);
      return new Blob([data.buffer], { type: 'video/mp4' });

    } catch (err) {
      if (signal.aborted) this.reset();
      throw err;

    } finally {
      try {
        if (this.isLoaded) {
          this.ffmpeg.FS('unlink', input);
          this.ffmpeg.FS('unlink', output);
        }
      } catch (e) {
        console.warn('FFmpeg cleanup warning:', e);
      }
    }
  }
}

export const ffmpegService = new FFmpegService();
