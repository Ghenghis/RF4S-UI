
import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'fishing' | 'session' | 'configuration' | 'milestone';
  requirement: {
    type: 'count' | 'time' | 'consecutive' | 'condition';
    target: number | string;
    current: number;
  };
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward: {
    type: 'title' | 'badge' | 'feature';
    value: string;
  };
}

interface AchievementProgress {
  achievementId: string;
  progress: number;
  maxProgress: number;
  lastUpdated: Date;
}

class AchievementServiceImpl {
  private achievements: Map<string, Achievement> = new Map();
  private playerProgress: Map<string, AchievementProgress> = new Map();
  private unlockedAchievements: Set<string> = new Set();

  initialize(): void {
    console.log('Achievement Service initialized');
    this.initializeAchievements();
    this.loadProgress();
    this.setupEventListeners();
  }

  private initializeAchievements(): void {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first-fish',
        name: 'First Catch',
        description: 'Catch your first fish',
        category: 'fishing',
        requirement: { type: 'count', target: 1, current: 0 },
        unlocked: false,
        rarity: 'common',
        reward: { type: 'title', value: 'Novice Angler' }
      },
      {
        id: 'century-club',
        name: 'Century Club',
        description: 'Catch 100 fish',
        category: 'fishing',
        requirement: { type: 'count', target: 100, current: 0 },
        unlocked: false,
        rarity: 'rare',
        reward: { type: 'badge', value: 'Century Badge' }
      },
      {
        id: 'marathon-session',
        name: 'Marathon Fisher',
        description: 'Fish for 6 hours straight',
        category: 'session',
        requirement: { type: 'time', target: 21600, current: 0 }, // 6 hours
        unlocked: false,
        rarity: 'epic',
        reward: { type: 'title', value: 'Endurance Fisher' }
      },
      {
        id: 'perfect-streak',
        name: 'Perfect Streak',
        description: 'Catch 20 fish in a row without losing one',
        category: 'fishing',
        requirement: { type: 'consecutive', target: 20, current: 0 },
        unlocked: false,
        rarity: 'legendary',
        reward: { type: 'feature', value: 'Lucky Cast Mode' }
      },
      {
        id: 'automation-master',
        name: 'Automation Master',
        description: 'Successfully run automation for 24 hours',
        category: 'session',
        requirement: { type: 'time', target: 86400, current: 0 }, // 24 hours
        unlocked: false,
        rarity: 'epic',
        reward: { type: 'title', value: 'Bot Master' }
      },
      {
        id: 'config-expert',
        name: 'Configuration Expert',
        description: 'Create and save 10 different fishing profiles',
        category: 'configuration',
        requirement: { type: 'count', target: 10, current: 0 },
        unlocked: false,
        rarity: 'rare',
        reward: { type: 'feature', value: 'Advanced Tuning Panel' }
      }
    ];

    defaultAchievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
      this.playerProgress.set(achievement.id, {
        achievementId: achievement.id,
        progress: 0,
        maxProgress: typeof achievement.requirement.target === 'number' ? achievement.requirement.target : 1,
        lastUpdated: new Date()
      });
    });
  }

  private setupEventListeners(): void {
    // Fish caught tracking
    EventManager.subscribe('fishing.fish_caught', (data: any) => {
      this.updateProgress('first-fish', 1);
      this.updateProgress('century-club', 1);
      this.updateConsecutiveProgress('perfect-streak', 1);
    });

    // Session time tracking
    EventManager.subscribe('session.time_updated', (data: any) => {
      this.updateProgress('marathon-session', data.sessionTime);
      this.updateProgress('automation-master', data.automationTime || 0);
    });

    // Configuration tracking
    EventManager.subscribe('profile.created', () => {
      this.updateProgress('config-expert', 1);
    });

    // Fish lost tracking
    EventManager.subscribe('fishing.fish_lost', () => {
      this.resetConsecutiveProgress('perfect-streak');
    });
  }

  private updateProgress(achievementId: string, increment: number): void {
    const achievement = this.achievements.get(achievementId);
    const progress = this.playerProgress.get(achievementId);

    if (!achievement || !progress || achievement.unlocked) return;

    progress.progress += increment;
    progress.lastUpdated = new Date();

    // Update achievement current value
    achievement.requirement.current = progress.progress;

    // Check if achievement is unlocked
    if (progress.progress >= progress.maxProgress) {
      this.unlockAchievement(achievementId);
    }

    this.saveProgress();
  }

  private updateConsecutiveProgress(achievementId: string, increment: number): void {
    const progress = this.playerProgress.get(achievementId);
    if (!progress) return;

    progress.progress += increment;
    this.updateProgress(achievementId, 0); // Check unlock without double increment
  }

  private resetConsecutiveProgress(achievementId: string): void {
    const progress = this.playerProgress.get(achievementId);
    if (progress) {
      progress.progress = 0;
      progress.lastUpdated = new Date();
    }
  }

  private unlockAchievement(achievementId: string): void {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    this.unlockedAchievements.add(achievementId);

    console.log(`Achievement unlocked: ${achievement.name}`);

    EventManager.emit('achievement.unlocked', {
      achievement,
      timestamp: new Date()
    }, 'AchievementService');

    // Apply reward
    this.applyAchievementReward(achievement);
    this.saveProgress();
  }

  private applyAchievementReward(achievement: Achievement): void {
    switch (achievement.reward.type) {
      case 'title':
        EventManager.emit('player.title_earned', {
          title: achievement.reward.value
        }, 'AchievementService');
        break;
      case 'feature':
        EventManager.emit('feature.unlocked', {
          feature: achievement.reward.value
        }, 'AchievementService');
        break;
      case 'badge':
        EventManager.emit('player.badge_earned', {
          badge: achievement.reward.value
        }, 'AchievementService');
        break;
    }
  }

  getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  getUnlockedAchievements(): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.unlocked);
  }

  getProgressForAchievement(achievementId: string): AchievementProgress | undefined {
    return this.playerProgress.get(achievementId);
  }

  getAchievementStats(): {
    total: number;
    unlocked: number;
    commonUnlocked: number;
    rareUnlocked: number;
    epicUnlocked: number;
    legendaryUnlocked: number;
  } {
    const achievements = Array.from(this.achievements.values());
    const unlocked = achievements.filter(a => a.unlocked);

    return {
      total: achievements.length,
      unlocked: unlocked.length,
      commonUnlocked: unlocked.filter(a => a.rarity === 'common').length,
      rareUnlocked: unlocked.filter(a => a.rarity === 'rare').length,
      epicUnlocked: unlocked.filter(a => a.rarity === 'epic').length,
      legendaryUnlocked: unlocked.filter(a => a.rarity === 'legendary').length
    };
  }

  private saveProgress(): void {
    try {
      const progressData = {
        achievements: Array.from(this.achievements.entries()),
        progress: Array.from(this.playerProgress.entries()),
        unlocked: Array.from(this.unlockedAchievements)
      };
      localStorage.setItem('rf4s-achievements', JSON.stringify(progressData));
    } catch (error) {
      console.error('Failed to save achievement progress:', error);
    }
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('rf4s-achievements');
      if (saved) {
        const data = JSON.parse(saved);
        
        // Load achievements with progress
        if (data.achievements) {
          data.achievements.forEach(([id, achievement]: [string, Achievement]) => {
            this.achievements.set(id, achievement);
          });
        }

        // Load progress
        if (data.progress) {
          data.progress.forEach(([id, progress]: [string, AchievementProgress]) => {
            this.playerProgress.set(id, progress);
          });
        }

        // Load unlocked set
        if (data.unlocked) {
          this.unlockedAchievements = new Set(data.unlocked);
        }
      }
    } catch (error) {
      console.error('Failed to load achievement progress:', error);
    }
  }
}

export const AchievementService = new AchievementServiceImpl();
