
export interface WordTiming {
  word: string;
  start_time: number; // in seconds
  end_time: number;   // in seconds
}

export interface SubtitleLine {
  id: string;
  start_time: number;
  end_time: number;
  original_lyrics: string;
  phonetic_vietnamese: string;
  vietnamese_translation: string;
  word_level_timings: WordTiming[];
}

export interface SongMetadata {
  title: string;
  artist: string;
  detected_language: string;
  subtitles: SubtitleLine[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}
