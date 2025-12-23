
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppStatus, SongMetadata } from './types';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [songMetadata, setSongMetadata] = useState<SongMetadata | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isEnded, setIsEnded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Căn giữa câu đang hát
  useEffect(() => {
    if (activeLineRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeLine = activeLineRef.current;
      
      const containerCenter = container.clientHeight / 2;
      const elementCenter = activeLine.clientHeight / 2;
      const targetScroll = activeLine.offsetTop - containerCenter + elementCenter;
      
      container.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (isEnded) setIsEnded(false);
    }
  };

  const handleEnded = () => {
    setIsEnded(true);
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsEnded(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setSongMetadata(null);
    setCurrentTime(0);
    setIsEnded(false);
    setVideoUrl(URL.createObjectURL(file));
    setStatus(AppStatus.PROCESSING);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        try {
          const result = await geminiService.processMusicVideo(base64Data, file.type);
          setSongMetadata(result);
          setStatus(AppStatus.READY);
        } catch (err) {
          setError("Lỗi xử lý AI. Thử lại video khác.");
          setStatus(AppStatus.ERROR);
        }
      };
    } catch (err) {
      setError("Lỗi tải file.");
      setStatus(AppStatus.ERROR);
    }
  };

  const activeLineId = useMemo(() => {
    if (!songMetadata) return null;
    return songMetadata.subtitles.find(line => 
      currentTime >= line.start_time && currentTime <= line.end_time
    )?.id || null;
  }, [currentTime, songMetadata]);

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden select-none">
      {/* Navbar AZZ PRO */}
      <nav className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-[100] pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-700 text-white flex items-center justify-center rounded-lg font-black text-sm shadow-lg shadow-green-500/20">A</div>
          <h1 className="text-sm font-black tracking-[0.2em] uppercase text-white drop-shadow-md">AZZ PRO</h1>
        </div>
        
        {/* Nút Đổi Video dạng Icon */}
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="pointer-events-auto w-10 h-10 bg-zinc-800/80 hover:bg-zinc-700 text-white rounded-full flex items-center justify-center border border-white/10 backdrop-blur-md transition-all shadow-lg group hover:scale-105 active:scale-95"
          title="Đổi Video"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-zinc-300 group-hover:text-white transition-colors">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {status === AppStatus.IDLE && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 p-10 text-center">
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 text-white">AZZ PRO</h2>
            <p className="text-[10px] tracking-[0.6em] text-zinc-500 uppercase font-light">Professional Karaoke System</p>
          </div>
        )}

        {status === AppStatus.PROCESSING && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#050505]">
            <div className="w-8 h-8 border-2 border-zinc-800 border-t-green-500 rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">Đang khởi tạo...</p>
          </div>
        )}

        {status === AppStatus.READY && videoUrl && songMetadata && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* VÙNG VIDEO */}
            <div className="h-[40vh] shrink-0 w-full bg-black relative flex items-center justify-center overflow-hidden z-10 border-b border-white/5">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onPlay={() => setIsEnded(false)}
                playsInline
                autoPlay
                controls={!isEnded} // Ẩn controls khi video kết thúc để hiển thị overlay đẹp hơn
              />
              
              {/* Overlay Replay khi kết thúc - Đẹp & Sang trọng */}
              {isEnded && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px] transition-all duration-500">
                  <button 
                    onClick={handleReplay}
                    className="group relative flex items-center justify-center w-16 h-16 bg-white/10 hover:bg-green-500 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 scale-100 hover:scale-110 shadow-2xl"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white pl-1">
                      <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <p className="absolute mt-24 text-[10px] uppercase tracking-[0.3em] font-bold text-white/50">Phát lại</p>
                </div>
              )}
            </div>

            {/* VÙNG LỜI NHẠC */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-4 md:px-8 py-[10vh] space-y-4 custom-scrollbar bg-[#0a0a0a] relative"
            >
              {songMetadata.subtitles.map((line) => {
                const isActive = activeLineId === line.id;
                const isPassed = currentTime > line.end_time;
                
                return (
                  <div 
                    key={line.id} 
                    ref={isActive ? activeLineRef : null}
                    className={`mx-auto max-w-2xl transition-all duration-500 rounded-xl px-6 py-6 border-l-2 flex flex-col items-start text-left gap-1 ${
                      isActive 
                        ? 'bg-[#111] border-green-500 shadow-lg scale-100 opacity-100' 
                        : isPassed 
                        ? 'bg-transparent border-transparent opacity-30 scale-95 grayscale' 
                        : 'bg-transparent border-transparent opacity-40 scale-95'
                    }`}
                  >
                    {/* Dòng 1: Phiên âm */}
                    {line.phonetic_vietnamese && (
                      <div className="text-sm md:text-base font-medium text-zinc-400 font-mono tracking-wide pl-1">
                        {line.phonetic_vietnamese}
                      </div>
                    )}

                    {/* Dòng 2: Lời gốc - Hộp viền xanh */}
                    <div className="text-2xl md:text-3xl font-bold text-white leading-relaxed flex flex-wrap gap-x-3 gap-y-2 my-1">
                      {line.word_level_timings.map((word, idx) => {
                        const isWordActive = currentTime >= word.start_time && currentTime <= word.end_time;
                        return (
                          <span 
                            key={idx}
                            className={`px-1.5 py-0.5 rounded-md transition-all duration-150 border-[1.5px] ${
                              isWordActive 
                                ? 'border-green-500 bg-green-500/10 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                                : 'border-transparent text-zinc-200'
                            }`}
                          >
                            {word.word}
                          </span>
                        );
                      })}
                    </div>

                    {/* Dòng 3: Dịch nghĩa */}
                    <div className="text-base md:text-lg text-zinc-500 italic pl-1 mt-1">
                      {line.vietnamese_translation}
                    </div>
                  </div>
                );
              })}
              
              <div className="h-[30vh]"></div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        video { outline: none; border: none; background: black; }
        .transition-all { transition-timing-function: cubic-bezier(0.2, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default App;
