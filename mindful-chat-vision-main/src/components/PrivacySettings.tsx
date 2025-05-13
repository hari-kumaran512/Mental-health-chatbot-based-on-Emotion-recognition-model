
import React, { useState } from 'react';
import { Check, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const PrivacySettings: React.FC = () => {
  const [localProcessing, setLocalProcessing] = useState(true);
  const [storeHistory, setStoreHistory] = useState(false);
  const [shareAnonymousData, setShareAnonymousData] = useState(false);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-4 w-4" /> 
          Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Local Processing</div>
              <div className="text-sm text-muted-foreground">
                Process all data on your device
              </div>
            </div>
            <Switch 
              checked={localProcessing} 
              onCheckedChange={setLocalProcessing} 
              aria-label="Toggle local processing"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Store Conversation History</div>
              <div className="text-sm text-muted-foreground">
                Save chats for future reference
              </div>
            </div>
            <Switch 
              checked={storeHistory} 
              onCheckedChange={setStoreHistory} 
              aria-label="Toggle store history"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Anonymous Data</div>
              <div className="text-sm text-muted-foreground">
                Help improve the model with anonymous usage data
              </div>
            </div>
            <Switch 
              checked={shareAnonymousData} 
              onCheckedChange={setShareAnonymousData} 
              aria-label="Toggle anonymous data sharing"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" className="gap-1">
            <Check className="h-3.5 w-3.5" />
            <span>All Settings Saved</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
