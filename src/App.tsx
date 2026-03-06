import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Download, Camera, Loader2, ChevronDown, Sparkles, User, SlidersHorizontal, Maximize, Minimize, Move, RotateCcw, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type Language = 'en' | 'fr' | 'ar';

interface Angle {
  id: string;
  title: { en: string; fr: string; ar: string };
  prompt: string;
}

// --- Constants ---
const ANGLES: Angle[] = [
  {
    id: 'top-down',
    title: { en: 'Top-down view', fr: 'Vue de dessus', ar: 'منظر من الأعلى' },
    prompt: 'Execute a 90-degree vertical overhead shot...'
  },
  {
    id: 'low-cinematic',
    title: { en: 'Low cinematic angle', fr: 'Angle cinématique bas', ar: 'زاوية سينمائية منخفضة' },
    prompt: 'Position the camera at ground level, tilted upwards...'
  }
  // أضف باقي الزوايا هنا بنفس التنسيق
];

// --- Translations ---
const TRANSLATIONS = {
  en: { title: 'AI ANGLE By Nadir Infograph', uploadTitle: 'Upload Image', uploadDesc: 'Drag and drop or click to select', selectAngle: 'Select Camera Angle', custom: 'Custom Controls', rotation: 'Horizontal Rotation', tilt: 'Vertical Tilt', zoom: 'Zoom Level', height: 'Camera Height', generate: 'Generate Image', generating: 'Generating...', download: 'Download', footer: 'This tool was developed by: Nadir Houamria', error: 'An error occurred. Please try again.', noImage: 'Please upload an image first.', noAngle: 'Please select an angle or use custom controls.', reset: 'Reset Sliders' },
  fr: { title: 'AI ANGLE Par Nadir Infograph', uploadTitle: 'Télécharger l\'image', uploadDesc: 'Glissez-déposez ou cliquez pour sélectionner', selectAngle: 'Sélectionner l\'angle de la caméra', custom: 'Contrôles Personnalisés', rotation: 'Rotation Horizontale', tilt: 'Inclinaison Verticale', zoom: 'Niveau de Zoom', height: 'Hauteur de Caméra', generate: 'Générer l\'image', generating: 'Génération...', download: 'Télécharger', footer: 'Cet outil a été développé par : Nadir Houamria', error: 'Une erreur est survenue. Veuillez réessayer.', noImage: 'Veuillez d\'abord télécharger une image.', noAngle: 'Veuillez sélectionner un angle ou utiliser les contrôles.', reset: 'Réinitialiser' },
  ar: { title: 'AI ANGLE By Nadir Infograph', uploadTitle: 'رفع صورة', uploadDesc: 'اسحب وأفلت أو انقر للاختيار', selectAngle: 'اختر زاوية الكاميرا', custom: 'مخصص', rotation: 'دوران أفقي', tilt: 'إمالة رأسية', zoom: 'مستوى التقريب', height: 'ارتفاع الكاميرا', generate: 'توليد الصورة', generating: 'جاري التوليد...', download: 'تحميل', footer: 'هذه الآداة من تطوير : حوامرية نذير', error: 'حدث خطأ. يرجى المحاولة مرة أخرى.', noImage: 'يرجى رفع صورة أولاً.', noAngle: 'يرجى اختيار زاوية أو استخدام أدوات التحكم المخصصة.', reset: 'إعادة تعيين' }
};

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string>('');
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [height, setHeight] = useState(0);
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[lang];
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

  const resetCustom = () => { setRotation(0); setTilt(0); setZoom(1.0); setHeight(0); };

  const generateImage = async () => {
    if (!selectedImage) { setError(t.noImage); return; }
    if (!selectedAngle && !isCustomActive) { setError(t.noAngle); return; }
    setIsLoading(true); setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.OPENROUTER_API_KEY! });
      let finalPrompt = '';

      if (isCustomActive) {
        finalPrompt = `Act as a 3D camera operator... rotation: ${rotation}, tilt: ${tilt}, zoom: ${zoom}, height: ${height}`;
      } else {
        const angleData = ANGLES.find(a => a.id === selectedAngle);
        if (!angleData) throw new Error("Invalid angle");
        finalPrompt = `Generate a new image... ${angleData.prompt}`;
      }

      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ inlineData: { data: base64Data, mimeType } }, { text: finalPrompt }] }
      });

      const imgPart = response.candidates[0].content.parts.find(p => p.inlineData);
      if (!imgPart) throw new Error("No image generated");
      setGeneratedImage(`data:image/png;base64,${imgPart!.inlineData!.data}`);

    } catch (err) { console.error(err); setError(t.error); }
    finally { setIsLoading(false); }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ai-angle-${isCustomActive ? 'custom' : selectedAngle}.png`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  return <div className={`min-h-screen bg-[#0a0a0a] text-white ${isRtl ? 'rtl' : 'ltr'}`}> {/* باقي الكود هنا مثل السابق */}</div>;
}  { id: 'low-cinematic', title: { en: 'Low cinematic angle', fr: 'Angle cinématique bas', ar: 'زاوية سينمائية منخفضة' }, prompt: 'Position the camera at ground level, tilted upwards at a sharp angle. Create a powerful, heroic perspective that emphasizes the subject’s scale and dominance.' },
  { id: '3-4-left', title: { en: '3/4 left angle', fr: 'Angle 3/4 gauche', ar: 'زاوية 3/4 يسار' }, prompt: 'Orbit the camera 45 degrees to the left of the subject. Show a three-quarter perspective that highlights the subject’s volume and depth in the 3D space.' },
  { id: 'over-shoulder', title: { en: 'Over-the-shoulder shot', fr: 'Plan par-dessus l\'épaule', ar: 'لقطة من فوق الكتف' }, prompt: 'Place the camera behind a secondary element or shoulder, focusing on the primary subject. Use a shallow depth of field to create an intimate, narrative perspective.' },
  { id: 'side-profile', title: { en: 'Side profile', fr: 'Profil latéral', ar: 'ملف جانبي' }, prompt: 'Move the camera to a precise 90-degree side-on position at eye level. Capture a clean profile view, maintaining strict horizontal alignment.' },
  { id: 'wide-establishing', title: { en: 'Wide establishing angle', fr: 'Angle large de situation', ar: 'زاوية تأسيسية واسعة' }, prompt: 'Pull the camera significantly back along the Z-axis. Reveal the full environment and context, making the subject part of a larger, detailed landscape.' },
  { id: 'dynamic-tilt', title: { en: 'Dynamic tilt (Dutch angle)', fr: 'Inclinaison dynamique (Angle hollandais)', ar: 'إمالة ديناميكية (زاوية هولندية)' }, prompt: 'Rotate the camera 25 degrees on its roll axis. Create a dynamic, tilted horizon line that conveys energy, tension, or a stylized cinematic look.' },
  { id: 'close-up-frontal', title: { en: 'Close-up frontal', fr: 'Gros plan frontal', ar: 'لقطة قريبة أمامية' }, prompt: 'Move the camera forward for an intimate close-up. Focus on the subject’s face or central features with high detail and clarity at eye level.' },
  { id: 'high-angle', title: { en: 'High angle perspective', fr: 'Perspective en plongée', ar: 'منظور زاوية عالية' }, prompt: 'Position the camera above the subject, looking down at a 45-degree angle. Provide a clear overview of the subject and its immediate surroundings.' },
  { id: 'orbit-shot', title: { en: 'Orbit shot position', fr: 'Position de prise de vue en orbite', ar: 'وضعية لقطة المدار' }, prompt: 'Capture a dynamic frame from a 360-degree orbit. The camera is at a diagonal 45-degree angle, showing the subject from a unique spatial perspective.' },
  { id: 'extreme-closeup', title: { en: 'Extreme Close-up', fr: 'Gros plan extrême', ar: 'لقطة قريبة جداً' }, prompt: 'Macro lens perspective. Focus exclusively on a tiny detail or texture of the subject, magnifying it to fill the entire frame with hyper-realistic detail.' },
  { id: 'fisheye', title: { en: 'Fisheye Lens', fr: 'Objectif Fisheye', ar: 'عدسة عين السمكة' }, prompt: 'Apply an ultra-wide 180-degree fisheye distortion. Curvate the environment around the subject to create a spherical, immersive visual effect.' },
  { id: 'drone-aerial', title: { en: 'Drone Aerial View', fr: 'Vue aérienne par drone', ar: 'منظر جوي (درون)' }, prompt: 'High-altitude drone perspective. Look down at the subject from a significant height, capturing the vastness of the surrounding environment.' },
  { id: 'isometric', title: { en: 'Isometric View', fr: 'Vue isométrique', ar: 'منظور آيزومتري' }, prompt: 'Render the scene in a true isometric 3D projection. Use a fixed 45-degree top-down angle with no perspective distortion; all parallel lines remain parallel.' }
];

const TRANSLATIONS = {
  en: { title: 'AI ANGLE By Nadir Infograph', uploadTitle: 'Upload Image', uploadDesc: 'Drag and drop or click to select', selectAngle: 'Select Camera Angle', custom: 'Custom Controls', rotation: 'Horizontal Rotation', tilt: 'Vertical Tilt', zoom: 'Zoom Level', height: 'Camera Height', generate: 'Generate Image', generating: 'Generating...', download: 'Download', footer: 'This tool was developed by: Nadir Houamria', error: 'An error occurred. Please try again.', noImage: 'Please upload an image first.', noAngle: 'Please select an angle or use custom controls.', reset: 'Reset Sliders' },
  fr: { title: 'AI ANGLE Par Nadir Infograph', uploadTitle: 'Télécharger l\'image', uploadDesc: 'Glissez-déposez ou cliquez pour sélectionner', selectAngle: 'Sélectionner l\'angle de la caméra', custom: 'Contrôles Personnalisés', rotation: 'Rotation Horizontale', tilt: 'Inclinaison Verticale', zoom: 'Niveau de Zoom', height: 'Hauteur de Caméra', generate: 'Générer l\'image', generating: 'Génération...', download: 'Télécharger', footer: 'Cet outil a été développé par : Nadir Houamria', error: 'Une erreur est survenue. Veuillez réessayer.', noImage: 'Veuillez d\'abord télécharger une image.', noAngle: 'Veuillez sélectionner un angle ou utiliser les contrôles.', reset: 'Réinitialiser' },
  ar: { title: 'AI ANGLE By Nadir Infograph', uploadTitle: 'رفع صورة', uploadDesc: 'اسحب وأفلت أو انقر للاختيار', selectAngle: 'اختر زاوية الكاميرا', custom: 'مخصص', rotation: 'دوران أفقي', tilt: 'إمالة رأسية', zoom: 'مستوى التقريب', height: 'ارتفاع الكاميرا', generate: 'توليد الصورة', generating: 'جاري التوليد...', download: 'تحميل', footer: 'هذه الآداة من تطوير : حوامرية نذير', error: 'حدث خطأ. يرجى المحاولة مرة أخرى.', noImage: 'يرجى رفع صورة أولاً.', noAngle: 'يرجى اختيار زاوية أو استخدام أدوات التحكم المخصصة.', reset: 'إعادة تعيين' }
};

// --- App Component ---
export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string>('');
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [height, setHeight] = useState(0);
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang];
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
    if (!selectedImage) { setError(t.noImage); return; }
    if (!selectedAngle && !isCustomActive) { setError(t.noAngle); return; }

    setIsLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.OPENROUTER_API_KEY! });

      let finalPrompt = '';
      if (isCustomActive) {
        finalPrompt = `Act as a 3D camera operator. Re-render this scene from a new perspective with these exact parameters: Horizontal Rotation: ${rotation}, Vertical Tilt: ${tilt}, Zoom: ${zoom}, Height: ${height}. Maintain all subject details.`;
      } else {
        const angleData = ANGLES.find(a => a.id === selectedAngle);
        if (!angleData) throw new Error('Invalid angle');
        finalPrompt = `Generate a new image based on this one from a different perspective. ${angleData.prompt}. Maintain all subject details.`;
      }

      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedImage.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: finalPrompt }
          ]
        }
      });

      const part = response.candidates[0].content.parts.find(p => p.inlineData);
      if (part?.inlineData) setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
      else throw new Error('No image generated');
    } catch (err) {
      console.error(err);
      setError(t.error);
    } finally { setIsLoading(false); }
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
    <div className={`min-h-screen bg-[#0a0a0a] text-white font-sans ${isRtl ? 'rtl' : 'ltr'}`}>
      <header className="p-4 flex justify-center gap-4 border-b border-white/5 bg-black/50 sticky top-0 z-50">
        <button onClick={() => setLang('fr')} title="Français" className={lang==='fr'?'ring-2 ring-yellow-400':'opacity-50'}><img src="https://flagcdn.com/w40/fr.png" className="w-8 h-8 rounded-full"/></button>
        <button onClick={() => setLang('ar')} title="العربية" className={lang==='ar'?'ring-2 ring-yellow-400':'opacity-50'}><img src="https://flagcdn.com/w40/dz.png" className="w-8 h-8 rounded-full"/></button>
        <button onClick={() => setLang('en')} title="English" className={lang==='en'?'ring-2 ring-yellow-400':'opacity-50'}><img src="https://flagcdn.com/w40/gb.png" className="w-8 h-8 rounded-full"/></button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <h1 className="text-center text-4xl md:text-6xl font-black text-yellow-400">{t.title}</h1>

        <div className="space-y-8">
          {/* Upload */}
          <div onClick={() => fileInputRef.current?.click()} className={`cursor-pointer border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center ${selectedImage?'border-yellow-400/50':'border-white/10'}`}>
            {selectedImage ? <img src={selectedImage} className="w-full h-64 object-contain"/> : <Upload className="w-16 h-16 text-yellow-400"/>}
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-white/60 flex items-center gap-2"><Camera className="w-4 h-4"/>{t.selectAngle}</label>
              <button onClick={()=>{setIsCustomActive(!isCustomActive); if(!isCustomActive)setSelectedAngle('')}} className="bg-white/5 px-4 py-1 rounded-full">{t.custom}</button>
            </div>
            {!isCustomActive ? (
              <select value={selectedAngle} onChange={(e)=>setSelectedAngle(e.target.value)} className="w-full bg-white/5 rounded-2xl p-4">
                <option value="" disabled>{t.selectAngle}</option>
                {ANGLES.map(a=><option key={a.id} value={a.id}>{a.title[lang]}</option>)}
              </select>
            ) : (
              <div className="space-y-4">
                {/* sliders */}
                {[{label:t.rotation,value:rotation,set:setRotation,min:-180,max:180},
                  {label:t.tilt,value:tilt,set:setTilt,min:-90,max:90},
                  {label:t.zoom,value:zoom,set:setZoom,min:0.5,max:3,step:0.1},
                  {label:t.height,value:height,set:setHeight,min:-50,max:50}].map((s,i)=>(
                  <div key={i} className="space-y-2">
                    <label className="text-white">{s.label}: {s.value}</label>
                    <input type="range" min={s.min} max={s.max} step={s.step||1} value={s.value} onChange={e=>s.set(parseFloat(e.target.value))} className="w-full"/>
                  </div>
                ))}
                <button onClick={resetCustom}>{t.reset}</button>
              </div>
            )}

            <button onClick={generateImage} disabled={isLoading || !selectedImage || (!selectedAngle && !isCustomActive)} className="w-full bg-yellow-400 py-3 rounded-2xl font-bold text-black">
              {isLoading ? <Loader2 className="animate-spin w-6 h-6 mx-auto"/> : t.generate}
            </button>

            {error && <p className="text-red-500 text-center">{error}</p>}
          </div>

          {/* Result */}
          <AnimatePresence>
            {generatedImage && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                <div className="relative">
                  <img src={generatedImage} className="w-full rounded-2xl"/>
                  <button onClick={downloadImage} className="absolute top-4 right-4 bg-yellow-400 p-2 rounded-full"><Download className="w-5 h-5"/></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-12 text-center text-white/40">{t.footer}</footer>
    </div>
  );
        }    id: 'top-down',
    title: { en: 'Top-down view', fr: 'Vue de dessus', ar: 'منظر من الأعلى' },
    prompt: 'Execute a 90-degree vertical overhead shot. The camera is positioned directly above the subject, looking straight down. Capture a perfect planimetric view of the scene.'
  },
  // ... (يمكنك الاحتفاظ بكل الزوايا كما هي)
];

// --- Translations ---
const TRANSLATIONS = {
  en: { title: 'AI ANGLE By Nadir Infograph', uploadTitle: 'Upload Image', uploadDesc: 'Drag and drop or click to select', selectAngle: 'Select Camera Angle', custom: 'Custom Controls', rotation: 'Horizontal Rotation', tilt: 'Vertical Tilt', zoom: 'Zoom Level', height: 'Camera Height', generate: 'Generate Image', generating: 'Generating...', download: 'Download', footer: 'This tool was developed by: Nadir Houamria', error: 'An error occurred. Please try again.', noImage: 'Please upload an image first.', noAngle: 'Please select an angle or use custom controls.', reset: 'Reset Sliders' },
  fr: { title: 'AI ANGLE Par Nadir Infograph', uploadTitle: 'Télécharger l\'image', uploadDesc: 'Glissez-déposez ou cliquez pour sélectionner', selectAngle: 'Sélectionner l\'angle de la caméra', custom: 'Contrôles Personnalisés', rotation: 'Rotation Horizontale', tilt: 'Inclinaison Verticale', zoom: 'Niveau de Zoom', height: 'Hauteur de Caméra', generate: 'Générer l\'image', generating: 'Génération...', download: 'Télécharger', footer: 'Cet outil a été développé par : Nadir Houamria', error: 'Une erreur est survenue. Veuillez réessayer.', noImage: 'Veuillez d\'abord télécharger une image.', noAngle: 'Veuillez sélectionner un angle ou utiliser les contrôles.', reset: 'Réinitialiser' },
  ar: { title: 'AI ANGLE By Nadir Infograph', uploadTitle: 'رفع صورة', uploadDesc: 'اسحب وأفلت أو انقر للاختيار', selectAngle: 'اختر زاوية الكاميرا', custom: 'مخصص', rotation: 'دوران أفقي', tilt: 'إمالة رأسية', zoom: 'مستوى التقريب', height: 'ارتفاع الكاميرا', generate: 'توليد الصورة', generating: 'جاري التوليد...', download: 'تحميل', footer: 'هذه الآداة من تطوير : حوامرية نذير', error: 'حدث خطأ. يرجى المحاولة مرة أخرى.', noImage: 'يرجى رفع صورة أولاً.', noAngle: 'يرجى اختيار زاوية أو استخدام أدوات التحكم المخصصة.', reset: 'إعادة تعيين' }
};

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedAngle, setSelectedAngle] = useState<string>('');
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [height, setHeight] = useState(0);
  const [isCustomActive, setIsCustomActive] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang];
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
    setRotation(0); setTilt(0); setZoom(1.0); setHeight(0);
  };

  const generateImage = async () => {
    if
// --- Constants ---
const ANGLES: Angle[] = [
  {
    id: 'top-down',
    title: {
      en: 'Top-down view',
      fr: 'Vue de dessus',
      ar: 'منظر من الأعلى'
    },
    prompt: 'Execute a 90-degree vertical overhead shot. The camera is positioned directly above the subject, looking straight down. Capture a perfect planimetric view of the scene.'
  },
  {
    id: 'low-cinematic',
    title: {
      en: 'Low cinematic angle',
      fr: 'Angle cinématique bas',
      ar: 'زاوية سينمائية منخفضة'
    },
    prompt: 'Position the camera at ground level, tilted upwards at a sharp angle. Create a powerful, heroic perspective that emphasizes the subject’s scale and dominance.'
  },
  {
    id: '3-4-left',
    title: {
      en: '3/4 left angle',
      fr: 'Angle 3/4 gauche',
      ar: 'زاوية 3/4 يسار'
    },
    prompt: 'Orbit the camera 45 degrees to the left of the subject. Show a three-quarter perspective that highlights the subject’s volume and depth in the 3D space.'
  },
  {
    id: 'over-shoulder',
    title: {
      en: 'Over-the-shoulder shot',
      fr: 'Plan par-dessus l\'épaule',
      ar: 'لقطة من فوق الكتف'
    },
    prompt: 'Place the camera behind a secondary element or shoulder, focusing on the primary subject. Use a shallow depth of field to create an intimate, narrative perspective.'
  },
  {
    id: 'side-profile',
    title: {
      en: 'Side profile',
      fr: 'Profil latéral',
      ar: 'ملف جانبي'
    },
    prompt: 'Move the camera to a precise 90-degree side-on position at eye level. Capture a clean profile view, maintaining strict horizontal alignment.'
  },
  {
    id: 'wide-establishing',
    title: {
      en: 'Wide establishing angle',
      fr: 'Angle large de situation',
      ar: 'زاوية تأسيسية واسعة'
    },
    prompt: 'Pull the camera significantly back along the Z-axis. Reveal the full environment and context, making the subject part of a larger, detailed landscape.'
  },
  {
    id: 'dynamic-tilt',
    title: {
      en: 'Dynamic tilt (Dutch angle)',
      fr: 'Inclinaison dynamique (Angle hollandais)',
      ar: 'إمالة ديناميكية (زاوية هولندية)'
    },
    prompt: 'Rotate the camera 25 degrees on its roll axis. Create a dynamic, tilted horizon line that conveys energy, tension, or a stylized cinematic look.'
  },
  {
    id: 'close-up-frontal',
    title: {
      en: 'Close-up frontal',
      fr: 'Gros plan frontal',
      ar: 'لقطة قريبة أمامية'
    },
    prompt: 'Move the camera forward for an intimate close-up. Focus on the subject’s face or central features with high detail and clarity at eye level.'
  },
  {
    id: 'high-angle',
    title: {
      en: 'High angle perspective',
      fr: 'Perspective en plongée',
      ar: 'منظور زاوية عالية'
    },
    prompt: 'Position the camera above the subject, looking down at a 45-degree angle. Provide a clear overview of the subject and its immediate surroundings.'
  },
  {
    id: 'orbit-shot',
    title: {
      en: 'Orbit shot position',
      fr: 'Position de prise de vue en orbite',
      ar: 'وضعية لقطة المدار'
    },
    prompt: 'Capture a dynamic frame from a 360-degree orbit. The camera is at a diagonal 45-degree angle, showing the subject from a unique spatial perspective.'
  },
  {
    id: 'extreme-closeup',
    title: {
      en: 'Extreme Close-up',
      fr: 'Gros plan extrême',
      ar: 'لقطة قريبة جداً'
    },
    prompt: 'Macro lens perspective. Focus exclusively on a tiny detail or texture of the subject, magnifying it to fill the entire frame with hyper-realistic detail.'
  },
  {
    id: 'fisheye',
    title: {
      en: 'Fisheye Lens',
      fr: 'Objectif Fisheye',
      ar: 'عدسة عين السمكة'
    },
    prompt: 'Apply an ultra-wide 180-degree fisheye distortion. Curvate the environment around the subject to create a spherical, immersive visual effect.'
  },
  {
    id: 'drone-aerial',
    title: {
      en: 'Drone Aerial View',
      fr: 'Vue aérienne par drone',
      ar: 'منظر جوي (درون)'
    },
    prompt: 'High-altitude drone perspective. Look down at the subject from a significant height, capturing the vastness of the surrounding environment.'
  },
  {
    id: 'isometric',
    title: {
      en: 'Isometric View',
      fr: 'Vue isométrique',
      ar: 'منظور آيزومتري'
    },
    prompt: 'Render the scene in a true isometric 3D projection. Use a fixed 45-degree top-down angle with no perspective distortion; all parallel lines remain parallel.'
  }
];

const TRANSLATIONS = {
  en: {
    title: 'AI ANGLE By Nadir Infograph',
    uploadTitle: 'Upload Image',
    uploadDesc: 'Drag and drop or click to select',
    selectAngle: 'Select Camera Angle',
    custom: 'Custom Controls',
    rotation: 'Horizontal Rotation',
    tilt: 'Vertical Tilt',
    zoom: 'Zoom Level',
    height: 'Camera Height',
    generate: 'Generate Image',
    generating: 'Generating...',
    download: 'Download',
    footer: 'This tool was developed by: Nadir Houamria',
    error: 'An error occurred. Please try again.',
    noImage: 'Please upload an image first.',
    noAngle: 'Please select an angle or use custom controls.',
    reset: 'Reset Sliders'
  },
  fr: {
    title: 'AI ANGLE Par Nadir Infograph',
    uploadTitle: 'Télécharger l\'image',
    uploadDesc: 'Glissez-déposez ou cliquez pour sélectionner',
    selectAngle: 'Sélectionner l\'angle de la caméra',
    custom: 'Contrôles Personnalisés',
    rotation: 'Rotation Horizontale',
    tilt: 'Inclinaison Verticale',
    zoom: 'Niveau de Zoom',
    height: 'Hauteur de Caméra',
    generate: 'Générer l\'image',
    generating: 'Génération...',
    download: 'Télécharger',
    footer: 'Cet outil a été développé par : Nadir Houamria',
    error: 'Une erreur est survenue. Veuillez réessayer.',
    noImage: 'Veuillez d\'abord télécharger une image.',
    noAngle: 'Veuillez sélectionner un angle ou utiliser les contrôles.',
    reset: 'Réinitialiser'
  },
  ar: {
    title: 'AI ANGLE By Nadir Infograph',
    uploadTitle: 'رفع صورة',
    uploadDesc: 'اسحب وأفلت أو انقر للاختيار',
    selectAngle: 'اختر زاوية الكاميرا',
    custom: 'مخصص',
    rotation: 'دوران أفقي',
    tilt: 'إمالة رأسية',
    zoom: 'مستوى التقريب',
    height: 'ارتفاع الكاميرا',
    generate: 'توليد الصورة',
    generating: 'جاري التوليد...',
    download: 'تحميل',
    footer: 'هذه الآداة من تطوير : حوامرية نذير',
    error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    noImage: 'يرجى رفع صورة أولاً.',
    noAngle: 'يرجى اختيار زاوية أو استخدام أدوات التحكم المخصصة.',
    reset: 'إعادة تعيين'
  }
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = TRANSLATIONS[lang];
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
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
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
      <header className="p-4 flex justify-center gap-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={() => setLang('fr')}
          className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 ${lang === 'fr' ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'opacity-50 grayscale hover:grayscale-0'}`}
          title="Français"
        >
          <img src="https://flagcdn.com/w40/fr.png" alt="France" className="w-8 h-8 rounded-full object-cover" />
        </button>
        <button 
          onClick={() => setLang('ar')}
          className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 ${lang === 'ar' ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'opacity-50 grayscale hover:grayscale-0'}`}
          title="العربية"
        >
          <img src="https://flagcdn.com/w40/dz.png" alt="Algeria" className="w-8 h-8 rounded-full object-cover" />
        </button>
        <button 
          onClick={() => setLang('en')}
          className={`p-1.5 rounded-full transition-all duration-300 hover:scale-110 ${lang === 'en' ? 'ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]' : 'opacity-50 grayscale hover:grayscale-0'}`}
          title="English"
        >
          <img src="https://flagcdn.com/w40/gb.png" alt="England" className="w-8 h-8 rounded-full object-cover" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-yellow-400 mb-2 drop-shadow-[0_5px_15px_rgba(250,204,21,0.2)]">
            {t.title}
          </h1>
          <div className="h-1 w-24 bg-yellow-400 mx-auto rounded-full" />
        </motion.div>

        <div className="grid gap-12">
          {/* Upload Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-8 transition-all duration-500 flex flex-col items-center justify-center min-h-[300px] overflow-hidden ${selectedImage ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-white/10 hover:border-yellow-400/30 hover:bg-white/5'}`}
            >
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt="Original" 
                  className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105" 
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
          </motion.div>

          {/* Controls Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
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
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-6"
                >
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
                </motion.div>
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
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-center font-bold"
              >
                {error}
              </motion.p>
            )}
          </motion.div>

          {/* Result Section */}
          <AnimatePresence>
            {generatedImage && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-4"
              >
                <div className="relative group rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-4">
                  <img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full h-auto rounded-2xl shadow-2xl" 
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-white/5 text-center px-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-yellow-400" />
          </div>
          <p className="text-white/40 font-medium text-lg">
            {t.footer}
          </p>
        </div>
      </footer>
    </div>
  );
}
