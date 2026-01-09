
export interface Subtitle {
  id: string;
  start: number; // in seconds
  end: number;   // in seconds
  text: string;
}

export interface TranscriptionResponse {
  subtitles: Omit<Subtitle, 'id'>[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}
