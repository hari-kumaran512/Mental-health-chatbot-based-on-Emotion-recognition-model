
import React, { useState } from 'react';
import Header from '@/components/Header';
import CameraFeed from '@/components/CameraFeed';
import ChatInterface from '@/components/ChatInterface';
import EmotionInsights from '@/components/EmotionInsights';
import PrivacySettings from '@/components/PrivacySettings';

const Index = () => {
  const [cameraExpanded, setCameraExpanded] = useState(false);
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <main className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4 p-4">
        {/* Left column - Camera */}
        <div className={`${cameraExpanded ? 'md:col-span-2 lg:col-span-8' : 'md:col-span-1 lg:col-span-4'} flex flex-col gap-4`}>
          <CameraFeed 
            expanded={cameraExpanded} 
            onToggleExpand={() => setCameraExpanded(!cameraExpanded)} 
          />
          
          {!cameraExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <EmotionInsights />
              <PrivacySettings />
            </div>
          )}
        </div>
        
        {/* Right column - Chat */}
        <div className={`${cameraExpanded ? 'md:col-span-1 lg:col-span-4' : 'md:col-span-2 lg:col-span-8'} flex flex-col gap-4`}>
          <ChatInterface />
        </div>
      </main>
    </div>
  );
};

export default Index;
