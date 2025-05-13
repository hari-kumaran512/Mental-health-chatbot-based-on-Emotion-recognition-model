import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { sendMessageToRasa, checkRasaStatus } from '@/services/rasaService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: Array<{
    title: string;
    payload: string;
  }>;
  image?: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm your mindful AI assistant. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const sessionId = useRef(`user-${Date.now().toString()}`);
  
  useEffect(() => {
    // Check RASA server status when component mounts
    const checkConnection = async () => {
      const status = await checkRasaStatus();
      setIsConnected(status);
      
      if (!status) {
        toast({
          title: "Connection Issue",
          description: "Could not connect to the RASA server. Using fallback responses.",
          variant: "destructive",
        });
      }
    };
    
    checkConnection();
  }, [toast]);
  
  useEffect(() => {
    // Improved scrolling logic to ensure messages are visible
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    // Use multiple timeouts with different delays to ensure scrolling happens
    // This helps catch any potential race conditions with DOM updates
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 0);
    
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 100);
    
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }, 300);
  };
  
  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;
    
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      if (isConnected) {
        // Send message to RASA
        const rasaResponses = await sendMessageToRasa({
          message: inputMessage,
          sender: sessionId.current
        });
        
        // Process RASA responses
        if (rasaResponses && rasaResponses.length > 0) {
          const botResponses: Message[] = rasaResponses.map((response, index) => ({
            id: `${Date.now()}-${index}`,
            text: response.text || "",
            image: response.image,
            buttons: response.buttons,
            sender: 'bot',
            timestamp: new Date()
          }));
          
          setMessages(prev => [...prev, ...botResponses]);
        } else {
          // Fallback if RASA returns empty response
          handleFallbackResponse();
        }
      } else {
        // Use fallback responses if not connected to RASA
        handleFallbackResponse();
      }
    } catch (error) {
      console.error('Error processing message:', error);
      handleFallbackResponse();
    } finally {
      setIsLoading(false);
      // Force scroll again after responses are loaded
      setTimeout(scrollToBottom, 200);
    }
  };
  
  const handleFallbackResponse = () => {
    // Simulate bot response with fallback messages
    const botResponses = [
      "I understand. Tell me more about how you're feeling?",
      "That's interesting. How long have you felt this way?",
      "I'm here to listen. Would you like to explore these feelings together?",
      "Thank you for sharing that with me. How does this affect your day-to-day life?",
      "I notice you might be feeling a bit down. Would talking about it help?"
    ];
    
    const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
    
    const botReply: Message = {
      id: Date.now().toString(),
      text: randomResponse,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botReply]);
    // Force scroll again after adding this message
    setTimeout(scrollToBottom, 100);
  };
  
  const handleButtonClick = async (payload: string) => {
    // Add the button selection as a user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: payload,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    
    try {
      if (isConnected) {
        // Send button payload to RASA
        const rasaResponses = await sendMessageToRasa({
          message: payload,
          sender: sessionId.current
        });
        
        if (rasaResponses && rasaResponses.length > 0) {
          const botResponses: Message[] = rasaResponses.map((response, index) => ({
            id: `${Date.now()}-${index}`,
            text: response.text || "",
            image: response.image,
            buttons: response.buttons,
            sender: 'bot',
            timestamp: new Date()
          }));
          
          setMessages(prev => [...prev, ...botResponses]);
        } else {
          handleFallbackResponse();
        }
      } else {
        handleFallbackResponse();
      }
    } catch (error) {
      console.error('Error processing button click:', error);
      handleFallbackResponse();
    } finally {
      setIsLoading(false);
      // Force scroll again after responses are loaded
      setTimeout(scrollToBottom, 200);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea to fit content without changing page layout
    if (textareaRef.current) {
      // Reset height to calculate new scroll height
      textareaRef.current.style.height = 'auto';
      
      // Set new height based on scroll height (with max height limit)
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };
  
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, we would initialize speech recognition here
    if (!isRecording) {
      toast({
        title: "Voice Recording",
        description: "Voice input is not yet implemented with RASA integration",
      });
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate input area height based on textarea
  const getInputAreaHeight = () => {
    return textareaRef.current?.offsetHeight 
      ? textareaRef.current.offsetHeight + 90 // Add padding, margins and footer text height
      : 140; // Default fallback height
  };
  
  return (
    <Card className="flex flex-col h-full">
      {/* Use a fixed position layout */}
      <CardContent className="flex flex-col h-[calc(100vh-100px)] p-0 relative">
        {/* Fixed header */}
        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Conversation</h2>
          <div className="flex items-center gap-2">
            {isConnected === false && (
              <div className="flex items-center text-destructive text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Offline Mode
              </div>
            )}
            {isConnected === true && (
              <div className="flex items-center text-green-600 text-xs">
                <div className="h-2 w-2 rounded-full bg-green-600 mr-1"></div>
                RASA Connected
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={scrollToBottom} 
              className="text-xs"
            >
              Scroll to Bottom
            </Button>
          </div>
        </div>
        
        {/* Messages container with fixed height and scrollbar */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-scroll p-4 min-h-0 messages-container pb-24"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(155, 155, 155, 0.7) transparent',
            height: `calc(100% - ${getInputAreaHeight()}px)`,  // Dynamic height calculation
            border: '1px solid transparent', // Add invisible border to ensure scrollbar appears
          }}
        >
          {messages.map(message => (
            <div key={message.id} className={`chat-message ${message.sender} mb-4`}>
              <div className={`p-3 rounded-lg ${
                message.sender === 'user' ? 
                'bg-primary/10 ml-auto max-w-[80%] text-right' : 
                'bg-muted/30 mr-auto max-w-[80%]'
              }`}>
                <p>{message.text}</p>
                
                {message.image && (
                  <div className="mt-2">
                    <img 
                      src={message.image} 
                      alt="Bot response image" 
                      className="max-w-full rounded-md" 
                    />
                  </div>
                )}
                
                {message.buttons && message.buttons.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.buttons.map((btn, idx) => (
                      <Button 
                        key={idx} 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => handleButtonClick(btn.payload)}
                      >
                        {btn.title}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              <div className={`text-xs text-muted-foreground mt-1 ${
                message.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex space-x-2 p-3 max-w-[50%] rounded-lg bg-muted/30">
              <div className="h-2 w-2 rounded-full bg-current animate-bounce"></div>
              <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-.15s]"></div>
              <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:-.3s]"></div>
            </div>
          )}
          {/* This spacer helps ensure we can scroll to see the last message */}
          <div className="h-20" ref={messagesEndRef} />
        </div>
        
        {/* Fixed input area positioned at bottom */}
        <div className="p-4 border-t bg-background absolute bottom-0 left-0 right-0 w-full">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="min-h-[60px] max-h-[150px] flex-grow overflow-hidden"
              style={{ 
                resize: 'none',
                height: '60px', // Start with default height
                overflowY: 'auto' // Allow internal scrolling for very long messages
              }}
              disabled={isLoading}
            />
            <div className="flex flex-col justify-end gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className={isRecording ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : ''}
                onClick={toggleRecording}
                disabled={isLoading}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button 
                variant="default" 
                size="icon"
                className="bg-mindful-teal hover:bg-mindful-teal/80"  
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === '' || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-center text-muted-foreground mt-2">
            {isConnected === false 
              ? "Using offline mode. RASA server not connected." 
              : "Your privacy is important. Messages are processed through your RASA server."}
          </div>
        </div>
      </CardContent>

      {/* Replace styled-jsx with standard style tag */}
      <style>{`
        /* Webkit browsers like Chrome/Safari */
        .messages-container::-webkit-scrollbar {
          width: 12px;
          background-color: transparent;
        }
        
        .messages-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 8px;
        }
        
        .messages-container::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.7);
          border-radius: 8px;
          border: 2px solid rgba(0, 0, 0, 0.05);
        }
        
        .messages-container::-webkit-scrollbar-thumb:hover {
          background-color: rgba(155, 155, 155, 0.9);
        }
        
        /* Firefox */
        .messages-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 155, 155, 0.7) rgba(0, 0, 0, 0.05);
        }

        /* Textarea scrollbar styling */
        textarea::-webkit-scrollbar {
          width: 8px;
          background-color: transparent;
        }
        
        textarea::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 8px;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background-color: rgba(155, 155, 155, 0.5);
          border-radius: 8px;
          border: 2px solid rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </Card>
  );
};

export default ChatInterface;