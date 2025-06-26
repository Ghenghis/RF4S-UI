
/**
 * Result tracking for RF4S automation sessions.
 */

export interface Timer {
  getRunningTime(): number;
  getRunningTimeStr(): string;
  getStartDateTime(): string;
  getCurDateTime(): string;
}

export class RF4SResult {
  tea: number = 0;
  carrot: number = 0;
  alcohol: number = 0;
  coffee: number = 0;
  bait: number = 0;
  kept: number = 0;
  total: number = 0;
  green: number = 0;
  yellow: number = 0;
  blue: number = 0;
  purple: number = 0;
  pink: number = 0;

  asDict(msg: string, timer?: Timer): Record<string, string | number> {
    const keptRatio = this.total > 0 ? `${Math.round((this.kept / this.total) * 100)}%` : "0%";
    const biteRate = timer ? `${Math.round(this.total / (timer.getRunningTime() / 3600))}/hr` : "0/hr";

    return {
      "Stop reason": msg,
      "Start time": timer?.getStartDateTime() || "N/A",
      "End time": timer?.getCurDateTime() || "N/A",
      "Running time": timer?.getRunningTimeStr() || "00:00:00",
      "Bite rate": biteRate,
      "Total fish": this.total,
      "Kept fish": this.kept,
      "Kept ratio": keptRatio,
      "Green tag fish": this.green,
      "Yellow tag fish": this.yellow,
      "Blue tag fish": this.blue,
      "Purple tag fish": this.purple,
      "Pink tag fish": this.pink,
      "Tea consumed": this.tea,
      "Carrot consumed": this.carrot,
      "Alcohol consumed": this.alcohol,
      "Coffee consumed": this.coffee,
      "Bait harvested": this.bait,
    };
  }
}

export class CraftResult {
  success: number = 0;
  fail: number = 0;
  material: number = 0;

  asDict(): Record<string, number> {
    return {
      "Successful crafts": this.success,
      "Failed crafts": this.fail,
      "Materials used": this.material,
    };
  }
}

export class HarvestResult {
  tea: number = 0;
  carrot: number = 0;
  bait: number = 0;

  asDict(): Record<string, number> {
    return {
      "Tea consumed": this.tea,
      "Carrot consumed": this.carrot,
      "Bait harvested": this.bait,
    };
  }
}
