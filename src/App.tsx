/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Upload, 
  Download, 
  Camera, 
  Loader2, 
  ChevronDown,
  Sparkles,
  User,
  SlidersHorizontal,
  Maximize,
  Minimize,
  Move,
  RotateCcw,
  Settings2,
  Key,
  ExternalLink
} from 'lucide-react';
import { Language } from './types';
import { ANGLES, TRANSLATIONS } from './constants';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string>('');
  
  // Custom Sliders State
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [height, setHeight] = useState(0);
  const [isCustomActive, setIsCustomActive] = useState(false);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = useMemo(() => TRANSLATIONS[lang], [lang]);
  const isRtl = lang === 'ar';

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetCustom = () => {
    setRotation(0);
    setTilt(0);
    setZoom(1.0);
    setHeight(0);
  };

  const generateImage = async () => {
    if (!selectedImage) {
      setError(t.noImage);
      return;
    }
    if (!selectedAngle && !isCustomActive) {
      setError(t.noAngle);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiKeyToUse = userApiKey || process.env.GEMINI_API_KEY;
      if (!apiKeyToUse) {
        throw new Error("API Key is missing. Please provide one.");
      }
      const ai = new GoogleGenAI({ apiKey: apiKeyToUse });
      
      let finalPrompt = "";
      if (isCustomActive) {
        finalPrompt = `Act as a 3D camera operator. Re-render this scene from a new perspective with these exact parameters: 
        - Horizontal Orbit Rotation: ${rotation} degrees around the subject.
        - Vertical Tilt: ${tilt} degrees (positive is looking down, negative is looking up).
        - Zoom Factor: ${zoom}x (1.0 is standard, >1.0 is zoom in, <1.0 is wide angle).
        - Camera Relative Height: ${height} units.
        
        CRITICAL INSTRUCTIONS:
        1. Maintain 100% consistency of the subject's identity, clothing, colors, and features.
        2. DO NOT duplicate people or objects. Ensure there is only one of each main subject.
        3. Hallucinate and predict the environment logically to fill in gaps created by the new camera angle.
        4. The camera moves in a 360-degree 3D space around the scene.
        5. Output a high-resolution, clean image with no visual artifacts or double-limbed subjects.`;
      } else {
        const angleData = ANGLES.find(a => a.id === selectedAngle);
        if (!angleData) throw new Error("Invalid angle");
        finalPrompt = `Generate a new image based on this one from a different perspective. ${angleData.prompt}. 
        
        CRITICAL INSTRUCTIONS:
        1. Maintain 100% consistency of the subject's identity, clothing, colors, and features.
        2. DO NOT duplicate people or objects. Ensure there is only one of each main subject.
        3. Hallucinate and predict the environment logically to fill in gaps created by the new camera angle.
        4. The camera moves in a 360-degree 3D space around the scene.
        5. Output a high-resolution, clean image with no visual artifacts or double-limbed subjects.`;
      }

      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: finalPrompt,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          setGeneratedImage(`data:image/png;base64,${base64EncodeString}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("No image generated in response");
      }
    } catch (err) {
      console.error(err);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-angle-${isCustomActive ? 'custom' : selectedAngle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-yellow-400 selection:text-black ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Header / Language Switcher */}
      <header className="p-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          {/* Top Row: Language Icons + Select Key Button */}
          <div className="w-full flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setLang('fr')}
                className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 ${lang === 'fr' ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'opacity-50 grayscale hover:grayscale-0'}`}
                title="Français"
              >
                <img src="https://flagcdn.com/w40/fr.png" alt="France" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
              </button>
              <button 
                onClick={() => setLang('ar')}
                className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 ${lang === 'ar' ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'opacity-50 grayscale hover:grayscale-0'}`}
                title="العربية"
              >
                <img src="https://flagcdn.com/w40/dz.png" alt="Algeria" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 ${lang === 'en' ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'opacity-50 grayscale hover:grayscale-0'}`}
                title="English"
              >
                <img src="https://flagcdn.com/w40/gb.png" alt="England" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
              </button>
            </div>
            <div className="flex-1 flex justify-end">
              <button 
                onClick={async () => {
                  if (window.aistudio) {
                    await window.aistudio.openSelectKey();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_4px_0_rgb(161,98,7)] active:shadow-none active:translate-y-1"
              >
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">{t.apiKey}</span>
              </button>
            </div>
          </div>
          
          {/* Bottom Row: Direct Input Field */}
          <div className="relative w-full max-w-md group">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-400/50 group-focus-within:text-yellow-400 transition-colors" />
            <input 
              type="password"
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              placeholder={t.apiKeyPlaceholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all placeholder:text-white/20 text-center"
            />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-yellow-400 mb-2 drop-shadow-[0_5px_15px_rgba(250,204,21,0.2)]">
            {t.title}
          </h1>
          <div className="h-1 w-24 bg-yellow-400 mx-auto rounded-full" />
        </div>

        <div className="grid gap-12">
          {/* Upload Section */}
          <div className="space-y-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] overflow-hidden ${selectedImage ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-white/10 hover:border-yellow-400/30 hover:bg-white/5'}`}
            >
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt="Original" 
                  className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto shadow-[0_10px_30px_rgba(250,204,21,0.3)] group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-10 h-10 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{t.uploadTitle}</h3>
                    <p className="text-white/40 text-sm">{t.uploadDesc}</p>
                  </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-8">
            {/* Preset Angles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  {t.selectAngle}
                </label>
                <button 
                  onClick={() => {
                    setIsCustomActive(!isCustomActive);
                    if (!isCustomActive) setSelectedAngle('');
                  }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isCustomActive ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  {t.custom}
                </button>
              </div>
              
              {!isCustomActive ? (
                <div className="relative">
                  <select 
                    value={selectedAngle}
                    onChange={(e) => setSelectedAngle(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all font-medium text-lg cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#0a0a0a]">{t.selectAngle}</option>
                    {ANGLES.map((angle) => (
                      <option key={angle.id} value={angle.id} className="bg-[#0a0a0a]">
                        {angle.title[lang]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute ${isRtl ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none`} />
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6 transition-all duration-300">
                  {/* Rotation Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-yellow-400" />
                        {t.rotation}
                      </span>
                      <span className="text-yellow-400 font-mono font-bold">{rotation}°</span>
                    </div>
                    <input 
                      type="range" min="-180" max="180" step="1"
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                  </div>

                  {/* Tilt Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-yellow-400" />
                        {t.tilt}
                      </span>
                      <span className="text-yellow-400 font-mono font-bold">{tilt}°</span>
                    </div>
                    <input 
                      type="range" min="-90" max="90" step="1"
                      value={tilt}
                      onChange={(e) => setTilt(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                  </div>

                  {/* Zoom Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold flex items-center gap-2">
                        {zoom > 1 ? <Maximize className="w-4 h-4 text-yellow-400" /> : <Minimize className="w-4 h-4 text-yellow-400" />}
                        {t.zoom}
                      </span>
                      <span className="text-yellow-400 font-mono font-bold">{zoom.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="3.0" step="0.1"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                  </div>

                  {/* Height Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold flex items-center gap-2">
                        <Move className="w-4 h-4 text-yellow-400" />
                        {t.height}
                      </span>
                      <span className="text-yellow-400 font-mono font-bold">{height > 0 ? '+' : ''}{height}</span>
                    </div>
                    <input 
                      type="range" min="-50" max="50" step="1"
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                  </div>

                  <button 
                    onClick={resetCustom}
                    className="w-full py-2 text-xs font-bold text-white/40 hover:text-yellow-400 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t.reset}
                  </button>
                </div>
              )}
            </div>

            {/* 3D Yellow Button */}
            <button
              onClick={generateImage}
              disabled={isLoading || !selectedImage || (!selectedAngle && !isCustomActive)}
              className={`w-full relative group py-5 rounded-2xl font-black text-xl uppercase tracking-tighter transition-all duration-300 transform active:translate-y-1 ${
                isLoading || !selectedImage || (!selectedAngle && !isCustomActive)
                  ? 'bg-white/10 text-white/20 cursor-not-allowed'
                  : 'bg-yellow-400 text-black shadow-[0_8px_0_rgb(161,98,7)] hover:shadow-[0_4px_0_rgb(161,98,7)] hover:translate-y-1 active:shadow-none'
              }`}
            >
              <span className="flex items-center justify-center gap-3">
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    {t.generate}
                  </>
                )}
              </span>
            </button>

            {error && (
              <p className="text-red-500 text-center font-bold">
                {error}
              </p>
            )}
          </div>

          {/* Result Section */}
          {generatedImage && (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <div className="relative group rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-4">
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className="w-full h-auto rounded-2xl shadow-2xl" 
                  referrerPolicy="no-referrer"
                />
                
                {/* Small Download Button */}
                <button 
                  onClick={downloadImage}
                  className="absolute top-8 right-8 p-3 bg-yellow-400 text-black rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all duration-300"
                  title={t.download}
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-white/5 text-center px-6">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-yellow-400 font-bold text-xl">
              {t.getApiKey}
            </p>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
            >
              <ExternalLink className="w-5 h-5 text-yellow-400" />
              {t.visitAIStudio}
            </a>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-white/40 font-medium text-lg">
              {t.footer}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
