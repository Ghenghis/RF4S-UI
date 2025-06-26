
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BarChart3, TrendingUp, Fish, Target, Clock, Award } from 'lucide-react';

const SmartAnalyticsPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Success Rate Analytics */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">87%</div>
            <p className="text-xs text-gray-400">Last 24 hours</p>
            <div className="mt-2 text-xs text-gray-300">
              +12% from yesterday
            </div>
          </CardContent>
        </Card>

        {/* Fish Per Hour */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Fish className="h-4 w-4 text-blue-400" />
              Fish/Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">24.3</div>
            <p className="text-xs text-gray-400">Average rate</p>
            <div className="mt-2 text-xs text-gray-300">
              Peak: 31.7 at 6PM
            </div>
          </CardContent>
        </Card>

        {/* Best Technique */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" />
              Best Technique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-purple-400">Bottom</div>
            <p className="text-xs text-gray-400">92% success rate</p>
            <div className="mt-2 text-xs text-gray-300">
              Used 67% of time
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-pink-400" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
            <Clock className="h-4 w-4 text-yellow-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Optimal Fishing Time</p>
              <p className="text-xs text-gray-300">Best results between 5-7 PM based on your history</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
            <Target className="h-4 w-4 text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Technique Suggestion</p>
              <p className="text-xs text-gray-300">Try feeder fishing - 23% higher success in current conditions</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
            <Award className="h-4 w-4 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-white">Achievement Unlocked</p>
              <p className="text-xs text-gray-300">100 fish caught with spin technique!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Analysis */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Fishing Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Bottom Fishing</span>
                <span className="text-white">67%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Spin Fishing</span>
                <span className="text-white">23%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Float Fishing</span>
                <span className="text-white">10%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartAnalyticsPanel;
