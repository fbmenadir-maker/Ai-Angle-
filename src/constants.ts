import { Angle, Translation, Language } from './types';

export const ANGLES: Angle[] = [
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

export const TRANSLATIONS: Record<Language, Translation> = {
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
    reset: 'Reset Sliders',
    apiKey: 'API KEY',
    apiKeyPlaceholder: 'Enter your API Key here...',
    getApiKey: 'Get your own API KEY in seconds',
    visitAIStudio: 'Visit AI Studio'
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
    reset: 'Réinitialiser',
    apiKey: 'Clé API',
    apiKeyPlaceholder: 'Entrez votre clé API ici...',
    getApiKey: 'Obtenez votre propre clé API en quelques secondes',
    visitAIStudio: 'Visiter AI Studio'
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
    reset: 'إعادة تعيين',
    apiKey: 'API KEY',
    apiKeyPlaceholder: 'أدخل مفتاح API الخاص بك هنا...',
    getApiKey: 'تحصل على API KEY خاص بك في ثواني',
    visitAIStudio: 'زيارة AI Studio'
  }
};
