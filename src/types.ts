export type Language = 'en' | 'fr' | 'ar';

export interface Angle {
  id: string;
  title: {
    en: string;
    fr: string;
    ar: string;
  };
  prompt: string;
}

export interface Translation {
  title: string;
  uploadTitle: string;
  uploadDesc: string;
  selectAngle: string;
  custom: string;
  rotation: string;
  tilt: string;
  zoom: string;
  height: string;
  generate: string;
  generating: string;
  download: string;
  footer: string;
  error: string;
  noImage: string;
  noAngle: string;
  reset: string;
  apiKey: string;
  apiKeyPlaceholder: string;
  getApiKey: string;
  visitAIStudio: string;
}
