import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface EmotionData {
  label: string;
  value: number;
  color: string;
}

interface EmotionAPIData {
  timestamp: number;
  emotion?: string;
  confidence?: number;
  detection_status?: string;
  last_updated: string;
}

const EmotionInsights: React.FC = () => {
  // Default emotion data
  const [emotions, setEmotions] = useState<EmotionData[]>([
    { label: 'Happy', value: 0, color: 'bg-yellow-400' },
    { label: 'Neutral', value: 0, color: 'bg-gray-400' },
    { label: 'Sad', value: 0, color: 'bg-blue-400' },
    { label: 'Angry', value: 0, color: 'bg-red-400' },
    { label: 'Surprised', value: 0, color: 'bg-purple-400' },
    { label: 'Fear', value: 0, color: 'bg-indigo-400' },
    { label: 'Disgust', value: 0, color: 'bg-green-400' },
  ]);
  
  // Keep track of detection status
  const [detectionStatus, setDetectionStatus] = useState<string | null>(null);
  
  // Function to update emotion values
  const updateEmotionValues = (emotion: string, confidence: number) => {
    setEmotions(prev => {
      // Create a new array with decayed values (all emotions decrease)
      const updatedEmotions = prev.map(item => ({
        ...item,
        value: Math.max(0, item.value * 0.9)  // Decay existing values
      }));
      
      // Find the detected emotion and update its value
      const detectedEmotion = updatedEmotions.find(
        e => e.label.toLowerCase() === emotion.toLowerCase()
      );
      
      if (detectedEmotion) {
        detectedEmotion.value = Math.round(confidence * 100);
      }
      
      return updatedEmotions;
    });
  };
  
  // Fetch emotion data from the API
  useEffect(() => {
    const fetchEmotionData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/emotion-data');
        if (response.ok) {
          const data: EmotionAPIData = await response.json();
          
          if (data.detection_status) {
            // No face detected
            setDetectionStatus(data.detection_status);
          } else if (data.emotion && data.confidence) {
            // Face detected with emotion
            setDetectionStatus(null);
            updateEmotionValues(data.emotion, data.confidence);
          }
        }
      } catch (error) {
        console.error('Error fetching emotion data:', error);
      }
    };
    
    // Fetch data immediately
    fetchEmotionData();
    
    // Set up interval to fetch data regularly
    const intervalId = setInterval(fetchEmotionData, 500);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Sort emotions by value for display
  const sortedEmotions = [...emotions].sort((a, b) => b.value - a.value);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          Emotion Insights 
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Live</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground mb-4">
          {detectionStatus ? 
            "Waiting for face detection..." : 
            "Real-time analysis of detected emotions"}
        </div>
        
        <div className="space-y-4">
          {sortedEmotions.map((emotion) => (
            <div key={emotion.label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{emotion.label}</span>
                <span className="font-medium">{emotion.value}%</span>
              </div>
              <Progress value={emotion.value} className={`h-2 ${emotion.color}`} />
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-3 bg-muted/50 rounded-md flex items-start text-xs gap-2">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            This visualization shows what emotions our AI model is detecting in your facial expressions.
            For transparency, we show exactly what the system "sees".
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionInsights;