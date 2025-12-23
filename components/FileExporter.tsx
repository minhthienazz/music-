
import React from 'react';
import { SongMetadata } from '../types';

interface FileExporterProps {
  metadata: SongMetadata;
}

const FileExporter: React.FC<FileExporterProps> = ({ metadata }) => {
  const formatTime = (seconds: number) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    const ms = Math.floor((seconds % 1) * 1000);
    return date.toISOString().substr(11, 8) + ',' + ms.toString().padStart(3, '0');
  };

  const generateSRT = () => {
    let srt = '';
    metadata.subtitles.forEach((line, index) => {
      srt += `${index + 1}\n`;
      srt += `${formatTime(line.start_time)} --> ${formatTime(line.end_time)}\n`;
      srt += `${line.original_lyrics}\n`;
      srt += `${line.phonetic_vietnamese}\n`;
      srt += `${line.vietnamese_translation}\n\n`;
    });
    return srt;
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => downloadFile(generateSRT(), `${metadata.title}_lyrics.srt`, 'text/plain')}
        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        SRT
      </button>
      <button
        onClick={() => downloadFile(JSON.stringify(metadata, null, 2), `${metadata.title}_data.json`, 'application/json')}
        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        JSON
      </button>
    </div>
  );
};

export default FileExporter;
