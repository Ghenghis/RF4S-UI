
import { EventManager } from '../../core/EventManager';
import { createRichLogger } from '../../rf4s/utils';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  mockDataFound: string[];
}

export class DataValidationService {
  private logger = createRichLogger('DataValidationService');
  private mockPatterns = [
    /Math\.random\(\)/g,
    /mock|fake|simulate|dummy/gi,
    /setInterval.*Math\.random/g,
    /setTimeout.*Math\.random/g,
    /\+ Math\.floor\(Math\.random/g
  ];

  validateComponentData(componentName: string, data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      mockDataFound: []
    };

    // Check for mock data patterns
    const dataString = JSON.stringify(data);
    
    this.mockPatterns.forEach(pattern => {
      if (pattern.test(dataString)) {
        result.mockDataFound.push(`Mock data pattern found in ${componentName}: ${pattern.source}`);
        result.isValid = false;
      }
    });

    // Validate data structure
    if (typeof data !== 'object' || data === null) {
      result.errors.push(`Invalid data structure in ${componentName}`);
      result.isValid = false;
    }

    // Check for hardcoded test values
    const testValues = ['test', 'example', 'sample', 'placeholder'];
    const stringValues = this.extractStringValues(data);
    
    stringValues.forEach(value => {
      if (testValues.some(test => value.toLowerCase().includes(test))) {
        result.warnings.push(`Potential test value found in ${componentName}: ${value}`);
      }
    });

    if (result.errors.length > 0 || result.mockDataFound.length > 0) {
      this.logger.error(`Validation failed for ${componentName}:`, result);
      
      EventManager.emit('validation.failed', {
        component: componentName,
        result,
        timestamp: new Date()
      }, 'DataValidationService');
    }

    return result;
  }

  private extractStringValues(obj: any, values: string[] = []): string[] {
    if (typeof obj === 'string') {
      values.push(obj);
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(value => {
        this.extractStringValues(value, values);
      });
    }
    return values;
  }

  scanCodebase(): Promise<ValidationResult[]> {
    return new Promise((resolve) => {
      // This would scan the actual codebase files in a real implementation
      // For now, we'll emit an event to trigger manual validation
      EventManager.emit('validation.codebase_scan_requested', {
        timestamp: new Date(),
        patterns: this.mockPatterns.map(p => p.source)
      }, 'DataValidationService');

      // Return empty results as this would be handled by the scanning process
      resolve([]);
    });
  }

  validateRealTimeData(source: string, data: any): boolean {
    // Ensure data comes from real sources, not generated
    if (!data || typeof data !== 'object') {
      this.logger.warning(`Invalid real-time data from ${source}`);
      return false;
    }

    // Check for realistic timestamp
    if (data.timestamp && (typeof data.timestamp !== 'number' || data.timestamp < 0)) {
      this.logger.warning(`Invalid timestamp in data from ${source}`);
      return false;
    }

    // Validate data freshness (should be recent)
    if (data.timestamp && (Date.now() - data.timestamp > 300000)) { // 5 minutes
      this.logger.warning(`Stale data detected from ${source}, age: ${Date.now() - data.timestamp}ms`);
      return false;
    }

    return true;
  }
}

export const dataValidationService = new DataValidationService();
