
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { AchievementService } from '../../services/AchievementService';
import { Trophy, Star, Award, Target } from 'lucide-react';

const AchievementPanel: React.FC = () => {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    const loadAchievements = () => {
      const allAchievements = AchievementService.getAchievements();
      const achievementStats = AchievementService.getAchievementStats();
      
      setAchievements(allAchievements);
      setStats(achievementStats);
    };

    loadAchievements();
    
    // Refresh achievements every 5 seconds
    const interval = setInterval(loadAchievements, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Target className="w-3 h-3" />;
      case 'rare': return <Star className="w-3 h-3" />;
      case 'epic': return <Award className="w-3 h-3" />;
      case 'legendary': return <Trophy className="w-3 h-3" />;
      default: return <Target className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Achievement Stats */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-300">Overall Progress</span>
            <span className="text-blue-400">{stats.unlocked}/{stats.total}</span>
          </div>
          <Progress 
            value={(stats.unlocked / stats.total) * 100} 
            className="h-2"
          />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Common</span>
              <span className="text-gray-300">{stats.commonUnlocked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Rare</span>
              <span className="text-blue-300">{stats.rareUnlocked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-400">Epic</span>
              <span className="text-purple-300">{stats.epicUnlocked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-400">Legendary</span>
              <span className="text-yellow-300">{stats.legendaryUnlocked}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Buttons */}
      <div className="flex gap-1">
        {['all', 'unlocked', 'locked'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={`px-2 py-1 text-xs rounded ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievement List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredAchievements.map((achievement) => {
          const progress = AchievementService.getProgressForAchievement(achievement.id);
          const progressPercent = progress ? (progress.progress / progress.maxProgress) * 100 : 0;
          
          return (
            <Card 
              key={achievement.id} 
              className={`bg-gray-800 border-gray-700 ${
                achievement.unlocked ? 'border-l-4 border-l-green-500' : ''
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-medium ${
                        achievement.unlocked ? 'text-white' : 'text-gray-400'
                      }`}>
                        {achievement.name}
                      </h4>
                      <Badge variant="outline" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                        {getRarityIcon(achievement.rarity)}
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.unlocked && (
                    <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  )}
                </div>

                {!achievement.unlocked && progress && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-blue-400">
                        {progress.progress}/{progress.maxProgress}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-1" />
                  </div>
                )}

                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}

                <div className="text-xs text-blue-400 mt-1">
                  Reward: {achievement.reward.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementPanel;
