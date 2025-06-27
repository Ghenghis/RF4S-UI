
/**
 * Utility functions for RF4S automation.
 */

export const BASE_DELAY = 1.2;
export const LOOP_DELAY = 1;
export const ANIMATION_DELAY = 1;

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function getBoxCenter(box: Box): [number, number] {
  return [
    Math.round(box.left + box.width / 2),
    Math.round(box.top + box.height / 2)
  ];
}

export function sleepAndDecrease(num: number, delay: number): number {
  return Math.max(0, num - delay);
}

export function createRichLogger(name: string = "RF4S") {
  return {
    info: (message: string, ...args: any[]) => console.log(`[${name}] ${message}`, ...args),
    debug: (message: string, ...args: any[]) => console.debug(`[${name}] ${message}`, ...args),
    warning: (message: string, ...args: any[]) => console.warn(`[${name}] ${message}`, ...args),
    error: (message: string, ...args: any[]) => console.error(`[${name}] ${message}`, ...args),
    critical: (message: string, ...args: any[]) => console.error(`[${name}] CRITICAL: ${message}`, ...args),
  };
}

export function askForConfirmation(msg: string = "Ready to start"): Promise<boolean> {
  return new Promise((resolve) => {
    const result = window.confirm(`${msg}?`);
    resolve(result);
  });
}

export function safeExit(): void {
  if (typeof window !== 'undefined') {
    window.close();
  }
}

export function isCompiled(): boolean {
  return false; // Always false in web environment
}

export function isRunByClicking(): boolean {
  return false; // Always false in web environment
}

export function updateArgv(): void {
  // No-op in web environment
}

export function printError(msg: string): void {
  console.error(`ERROR: ${msg}`);
}
