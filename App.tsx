
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppStatus, Subtitle } from './types';
import FileUploader from './components/FileUploader';
import SubtitleItem from './components/SubtitleItem';
import { processVideoWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSubtitleId, setActiveSubtitleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (file: File) => {
    setStatus(AppStatus.UPLOADING);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    try {
      setStatus(AppStatus.PROCESSING);
      
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          const result = await processVideoWithGemini(base64, file.type);
          const subsWithIds = result.subtitles.map((s, idx) => ({
            ...s,
            id: `sub-${idx}-${Date.now()}`
          }));
          setSubtitles(subsWithIds);
          setStatus(AppStatus.READY);
        } catch (err) {
          setErrorMessage("AI processing failed. Please try again with a shorter video or check your API key.");
          setStatus(AppStatus.ERROR);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setErrorMessage("Failed to read the video file.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      
      const active = subtitles.find(s => time >= s.start && time <= s.end);
      if (active && active.id !== activeSubtitleId) {
        setActiveSubtitleId(active.id);
      } else if (!active) {
        setActiveSubtitleId(null);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const handleUpdateSubtitle = (id: string, newText: string) => {
    setSubtitles(prev => prev.map(s => s.id === id ? { ...s, text: newText } : s));
  };

  const handleCopySubtitle = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback('Copied!');
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Scroll active subtitle into view
  useEffect(() => {
    if (activeSubtitleId && scrollContainerRef.current) {
      const activeEl = document.getElementById(activeSubtitleId);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSubtitleId]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              ReelsSub <span className="text-indigo-400">AI</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {status === AppStatus.READY && (
              <button 
                onClick={() => window.location.reload()}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
              >
                Start New Project
              </button>
            )}
            <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-semibold text-slate-400 uppercase tracking-widest border border-slate-700">
              v1.0 MVP
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8 flex flex-col gap-8">
        {status === AppStatus.IDLE && (
          <div className="max-w-4xl mx-auto w-full mt-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Optimized One-Line Subtitles
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Generate bilingual (RU/FR) captions for your Reels. Perfect 18-26 character length, single line, no broken grammar.
              </p>
            </div>
            <FileUploader onFileSelect={handleFileSelect} disabled={false} />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Bilingual Support', desc: 'Seamlessly handles Russian and French speech context.' },
                { title: 'Reels Ready', desc: 'Optimized length (18-30 chars) for maximum engagement.' },
                { title: 'Pro Timing', desc: 'Accurate 1.0s - 2.2s duration with linguistic logic.' }
              ].map((feature, i) => (
                <div key={i} className="bg-slate-800/30 p-6 rounded-xl border border-slate-800/50">
                  <h4 className="font-semibold mb-2 text-indigo-400">{feature.title}</h4>
                  <p className="text-sm text-slate-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(status === AppStatus.PROCESSING || status === AppStatus.UPLOADING) && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {status === AppStatus.UPLOADING ? 'Uploading Media...' : 'AI is transcribing...'}
            </h3>
            <p className="text-slate-400 animate-pulse">
              Analyzing bilingual context and segmenting lines...
            </p>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Processing Error</h3>
            <p className="text-slate-400 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {status === AppStatus.READY && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)]">
            {/* Left: Video Player */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
              <div className="flex-1 flex items-center justify-center bg-black group relative">
                {videoUrl && (
                  <video 
                    ref={videoRef}
                    src={videoUrl}
                    className="max-h-full max-w-full"
                    controls
                    onTimeUpdate={handleTimeUpdate}
                  />
                )}
                
                {/* Active Subtitle Overlay (Preview) */}
                {activeSubtitleId && (
                  <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none px-12">
                    <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-xl border border-white/10 text-xl font-bold text-center shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {subtitles.find(s => s.id === activeSubtitleId)?.text}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-t border-slate-800">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono text-indigo-400">
                    {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(1).padStart(4, '0')}
                  </span>
                  <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500" 
                      style={{ width: `${videoRef.current ? (currentTime / videoRef.current.duration) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Preview Area</p>
              </div>
            </div>

            {/* Right: Subtitle List */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <h3 className="font-bold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                  Subtitles List
                </h3>
                <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-800 rounded">
                  {subtitles.length} segments
                </span>
              </div>
              
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
              >
                {subtitles.map((sub) => (
                  <div key={sub.id} id={sub.id}>
                    <SubtitleItem 
                      subtitle={sub}
                      isActive={activeSubtitleId === sub.id}
                      onSelect={handleSeek}
                      onUpdate={handleUpdateSubtitle}
                      onCopy={handleCopySubtitle}
                    />
                  </div>
                ))}
              </div>
              
              <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                  Click text to edit • Click time to jump
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Copy Toast */}
      {copyFeedback && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full shadow-xl shadow-indigo-600/40 z-[100] animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4-4L19 7" />
            </svg>
            {copyFeedback}
          </div>
        </div>
      )}

      {/* Footer info */}
      <footer className="py-6 border-t border-slate-800/50 mt-auto">
        <div className="container mx-auto px-6 text-center text-slate-500 text-xs">
          <p>© 2024 ReelsSub AI • One-line Subtitle Generator for Bilingual Creators</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
