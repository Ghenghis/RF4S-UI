
import { FishData, FilterRule } from './types';

export class ConfidenceCalculator {
  calculateFilterConfidence(fishData: FishData, matchedRules: FilterRule[]): number {
    let confidence = 0.8; // Base confidence

    // Increase confidence with more rule matches
    confidence += Math.min(matchedRules.length * 0.1, 0.2);

    // Adjust based on fish data completeness
    const dataCompleteness = this.calculateDataCompleteness(fishData);
    confidence *= dataCompleteness;

    return Math.min(confidence, 1.0);
  }

  private calculateDataCompleteness(fishData: FishData): number {
    const requiredFields = ['name', 'weight', 'species'];
    const optionalFields = ['length', 'tags', 'location'];
    
    let score = 0;
    let maxScore = requiredFields.length + optionalFields.length * 0.5;

    // Required fields
    requiredFields.forEach(field => {
      if (fishData[field as keyof FishData] && fishData[field as keyof FishData] !== 'Unknown') {
        score += 1;
      }
    });

    // Optional fields
    optionalFields.forEach(field => {
      if (fishData[field as keyof FishData]) {
        score += 0.5;
      }
    });

    return score / maxScore;
  }
}
