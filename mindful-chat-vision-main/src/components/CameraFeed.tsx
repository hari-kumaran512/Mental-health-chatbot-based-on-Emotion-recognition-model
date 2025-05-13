import React, { useState, useRef } from 'react';
import { Camera, CameraOff, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CameraFeedProps {
  expanded: boolean;
  onToggleExpand: () => void;
  onEmotionDetected?: (emotion: string, confidence: number) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ 
  expanded, 
  onToggleExpand,
  onEmotionDetected 
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const streamUrl = "http://127.0.0.1:5000/video_feed";
  
  const toggleCamera = async () => {
    if (cameraActive) {
      setCameraActive(false);
      return;
    }
    
    try {
      setCameraActive(true);
      setPermissionDenied(false);
    } catch (err) {
      console.error('Error starting camera:', err);
      setPermissionDenied(true);
    }
  };
  
  return (
    <Card className={`camera-container transition-all duration-300 ${expanded ? 'h-[70vh]' : 'h-[350px]'}`}>
      <CardContent className="p-0 h-full relative">
        {!cameraActive ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-mindful-gray dark:bg-slate-800">
            {permissionDenied ? (
              <div className="text-center p-4">
                <CameraOff className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <h3 className="text-lg font-medium text-red-500">Camera access denied</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please allow camera access in your browser settings to use this feature.
                </p>
              </div>
            ) : (
              <div className="text-center p-4">
                <Camera className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse-subtle" />
                <p className="mb-6 text-muted-foreground">
                  Enable camera to start emotion detection
                </p>
                <Button onClick={toggleCamera} variant="default" className="bg-mindful-teal hover:bg-mindful-teal/80">
                  Start Camera
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full w-full relative">
            {/* Use iframe with stream URL */}
            <iframe 
              ref={iframeRef}
              src={streamUrl}
              className="absolute top-0 left-0 w-full h-full border-0"
              title="Emotion Detection Feed"
              sandbox="allow-same-origin"
            ></iframe>
          </div>
        )}
        
        <div className="absolute bottom-4 right-4 flex gap-2">
          {cameraActive && (
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-background/50 backdrop-blur-sm hover:bg-background/70" 
              onClick={toggleCamera}
            >
              <CameraOff className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-background/50 backdrop-blur-sm hover:bg-background/70" 
            onClick={onToggleExpand}
          >
            {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraFeed;