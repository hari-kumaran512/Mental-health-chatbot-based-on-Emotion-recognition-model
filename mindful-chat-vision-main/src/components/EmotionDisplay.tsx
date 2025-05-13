
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EmotionDisplayProps {
  emotion: string;
  confidenceLevel: number;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ emotion, confidenceLevel }) => {
  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'sad':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'angry':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'neutral':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300';
      case 'surprised':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😔';
      case 'angry':
        return '😠';
      case 'neutral':
        return '😐';
      case 'surprised':
        return '😲';
      default:
        return '😐';
    }
  };
  
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2">
      <Badge className={`${getEmotionColor(emotion)} px-3 py-1`}>
        <span className="mr-1">{getEmotionIcon(emotion)}</span>
        {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
      </Badge>
      
      <div className="bg-black/30 backdrop-blur-sm px-3 py-1 rounded-md text-xs text-white flex items-center gap-2">
        <div className="w-full h-1.5 bg-gray-300 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${confidenceLevel * 100}%` }}
          ></div>
        </div>
        <span>{Math.round(confidenceLevel * 100)}%</span>
      </div>
    </div>
  );
};

export default EmotionDisplay;
