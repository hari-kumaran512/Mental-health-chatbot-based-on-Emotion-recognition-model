
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-mindful-teal to-mindful-blue flex items-center justify-center">
          <span className="text-white text-xs font-bold">MCV</span>
        </div>
        <h1 className="text-xl font-bold">Mindful Chat Vision</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
