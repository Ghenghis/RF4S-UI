
/**
 * Timer controller for tracking session time and intervals.
 */

export class Timer {
  private startTime: Date;
  private lastTeaTime: Date;
  private lastAlcoholTime: Date;
  private lastCastTime: Date;
  private lastLureChangeTime: Date;
  private lastSpodCastTime: Date;
  private totalCastTime: number = 0;

  constructor() {
    this.startTime = new Date();
    this.lastTeaTime = new Date(0);
    this.lastAlcoholTime = new Date(0);
    this.lastCastTime = new Date();
    this.lastLureChangeTime = new Date(0);
    this.lastSpodCastTime = new Date(0);
  }

  getRunningTime(): number {
    return (Date.now() - this.startTime.getTime()) / 1000;
  }

  getRunningTimeStr(): string {
    const totalSeconds = Math.floor(this.getRunningTime());
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getStartDateTime(): string {
    return this.startTime.toLocaleString();
  }

  getCurDateTime(): string {
    return new Date().toLocaleString();
  }

  isTeaDrinkable(): boolean {
    return (Date.now() - this.lastTeaTime.getTime()) > 300000; // 5 minutes
  }

  isAlcoholDrinkable(): boolean {
    return (Date.now() - this.lastAlcoholTime.getTime()) > 600000; // 10 minutes
  }

  isLureChangeable(): boolean {
    return (Date.now() - this.lastLureChangeTime.getTime()) > 1800000; // 30 minutes
  }

  isSpodRodCastable(): boolean {
    return (Date.now() - this.lastSpodCastTime.getTime()) > 900000; // 15 minutes
  }

  isScriptPausable(): boolean {
    return Math.random() < 0.1; // 10% chance
  }

  updateCastTime(): void {
    this.lastCastTime = new Date();
  }

  addCastTime(): void {
    this.totalCastTime += (Date.now() - this.lastCastTime.getTime()) / 1000;
  }

  updateTeaTime(): void {
    this.lastTeaTime = new Date();
  }

  updateAlcoholTime(): void {
    this.lastAlcoholTime = new Date();
  }

  updateLureChangeTime(): void {
    this.lastLureChangeTime = new Date();
  }

  updateSpodCastTime(): void {
    this.lastSpodCastTime = new Date();
  }
}
