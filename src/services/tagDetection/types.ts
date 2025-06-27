
export interface TagColor {
  id: string;
  name: string;
  hexCode: string;
  rgbValues: { r: number; g: number; b: number };
  hsvValues: { h: number; s: number; v: number };
  tolerance: number;
  enabled: boolean;
}

export interface TagDefinition {
  id: string;
  name: string;
  colors: TagColor[];
  shape: 'circle' | 'square' | 'triangle' | 'diamond' | 'custom';
  size: { width: number; height: number };
  position: 'fin' | 'body' | 'head' | 'tail' | 'any';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  value: number;
}

export interface TagDetectionResult {
  detected: boolean;
  tagDefinition: TagDefinition | null;
  confidence: number;
  position: { x: number; y: number } | null;
  colorMatch: TagColor | null;
  timestamp: Date;
  metadata: {
    imageData?: string;
    processingTime: number;
    detectionMethod: 'color' | 'template' | 'hybrid';
  };
}

export interface DetectionConfiguration {
  colorTolerance: number;
  minimumTagSize: number;
  maximumTagSize: number;
  confidenceThreshold: number;
  enableColorDetection: boolean;
  enableTemplateMatching: boolean;
  enableHybridDetection: boolean;
  processMultipleTags: boolean;
}

export interface ColorAnalysisResult {
  color: { r: number; g: number; b: number };
  count: number;
  position: { x: number; y: number };
}

export interface ColorMatchResult {
  color: TagColor;
  confidence: number;
  position: { x: number; y: number };
}
