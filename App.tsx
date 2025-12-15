import React, { useState, useCallback, useEffect } from 'react';
import { generateBokeCaption } from './services/geminiService';
import { Spinner } from './components/Spinner';
import { MemeCanvas } from './components/MemeCanvas';
import { AppState } from './types';

// Define available models
const MODELS = [
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      processFile(file);
    }
  }, []);

  const processFile = (file: File) => {
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageSrc(e.target.result as string);
        setAppState(AppState.IDLE);
        setCaption("");
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Paste Event Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            processFile(file);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleGenerate = async () => {
    if (!imageSrc) return;

    setAppState(AppState.GENERATING);
    setErrorMessage(null);

    try {
      const generatedText = await generateBokeCaption(imageSrc, mimeType, selectedModel);
      setCaption(generatedText);
      setAppState(AppState.SUCCESS);
    } catch (error: any) {
      setAppState(AppState.ERROR);
      setErrorMessage(error.message || "Failed to generate caption. Please try again.");
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setCaption("");
    setAppState(AppState.IDLE);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white selection:bg-yellow-500 selection:text-black">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="text-center mb-10 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-yellow-400 drop-shadow-lg">
            AI 大喜利
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl font-light">
            苦思冥想，但一句正经没有
          </p>
        </header>

        {/* Main Content Area */}
        <main className="flex flex-col items-center justify-center space-y-8">
          
          {/* Model Selector */}
          <div className="bg-neutral-800 p-1 rounded-lg inline-flex shadow-inner">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedModel === model.id
                    ? 'bg-neutral-700 text-yellow-400 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {model.name}
              </button>
            ))}
          </div>

          {/* 1. Upload Section (Visible only if no image is loaded) */}
          {!imageSrc && (
            <div className="w-full max-w-2xl">
              <label 
                htmlFor="file-upload" 
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-neutral-700 border-dashed rounded-xl cursor-pointer bg-neutral-800 hover:bg-neutral-750 hover:border-yellow-400 hover:text-yellow-400 transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                  <svg className="w-12 h-12 mb-4 text-neutral-500 group-hover:text-yellow-400 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-neutral-400 group-hover:text-yellow-100"><span className="font-semibold">点击上传</span> 或拖拽图片</p>
                  <p className="text-xs text-neutral-500">支持 Ctrl+V 粘贴剪贴板图片</p>
                  <p className="text-xs text-neutral-600 mt-1">PNG, JPG, WEBP</p>
                </div>
                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          )}

          {/* 2. Error Message */}
          {errorMessage && (
            <div className="w-full max-w-4xl p-4 mb-4 text-sm text-red-200 rounded-lg bg-red-900/50 border border-red-800" role="alert">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-red-400">生成失败:</span>
              </div>
              <div className="mt-2 ml-7 break-all opacity-90">{errorMessage}</div>
            </div>
          )}

          {/* 3. Image Display & Result */}
          {imageSrc && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              
              {/* Canvas Renderer */}
              <MemeCanvas imageSrc={imageSrc} caption={caption} />

              {/* Controls */}
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                {appState === AppState.IDLE && (
                   <button 
                   onClick={handleGenerate}
                   className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold rounded-full shadow-lg hover:shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-lg"
                 >
                   <span>🔥</span> 生成神吐槽
                 </button>
                )}

                {appState === AppState.GENERATING && (
                  <div className="flex items-center gap-3 px-8 py-3 bg-neutral-800 rounded-full border border-neutral-700">
                    <Spinner />
                    <span className="text-neutral-300 font-medium animate-pulse">AI 正在疯狂思考...</span>
                  </div>
                )}

                {appState === AppState.SUCCESS && (
                   <button 
                   onClick={handleGenerate}
                   className="px-6 py-3 bg-neutral-700 text-white font-semibold rounded-full hover:bg-neutral-600 transition-colors flex items-center gap-2"
                 >
                   <span>🎲</span> 再来一个
                 </button>
                )}

                {appState === AppState.ERROR && (
                   <button 
                   onClick={handleGenerate}
                   className="px-8 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-lg"
                 >
                   <span>🔄</span> 重试一下
                 </button>
                )}

                <button 
                  onClick={handleReset}
                  className="px-6 py-3 bg-transparent border border-neutral-600 text-neutral-400 font-medium rounded-full hover:border-neutral-400 hover:text-white transition-colors"
                >
                  换张图
                </button>
              </div>

              {appState === AppState.SUCCESS && (
                <div className="mt-4 text-neutral-500 text-sm">
                  * 内容由 {MODELS.find(m => m.id === selectedModel)?.name} 生成，仅供娱乐
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;