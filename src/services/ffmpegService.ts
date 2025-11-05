import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

class FFmpegService {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async load() {
    if (this.isLoaded) return;
    this.ffmpeg = new FFmpeg();
    await this.ffmpeg.load();
    this.isLoaded = true;
  }

  async trimAndExport(
    file: File,
    start: number,
    end: number,
    speed: number
  ): Promise<Blob> {
    if (!this.ffmpeg) throw new Error('FFmpeg not loaded');

    const inputName = 'input.mp4';
    const outputName = 'output.mp4';

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    const duration = end - start;
    const speedFilter = `setpts=${1 / speed}*PTS`;

    await this.ffmpeg.exec([
      '-ss', `${start}`,
      '-t', `${duration}`,
      '-i', inputName,
      '-vf', speedFilter,
      '-af', `atempo=${speed}`,
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-movflags', 'faststart',
      outputName,
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    return new Blob([data], { type: 'video/mp4' });
  }
}

export const ffmpegService = new FFmpegService();
