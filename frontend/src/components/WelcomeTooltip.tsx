import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Home, X } from 'lucide-react';

export function WelcomeTooltip() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('hasSeenWelcomeTooltip');
    if (!hasSeenTooltip) {
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('hasSeenWelcomeTooltip', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl text-gray-900 mb-2">Welcome! 👋</h3>
          <p className="text-gray-600">
            You can return to the home page at any time:
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white">1</span>
            </div>
            <div>
              <p className="text-sm text-gray-900">Click on the logo</p>
              <p className="text-xs text-gray-500">Top left</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white">2</span>
            </div>
            <div>
              <p className="text-sm text-gray-900">"Home" button</p>
              <p className="text-xs text-gray-500">In the navigation bar</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white">3</span>
            </div>
            <div>
              <p className="text-sm text-gray-900">Keyboard shortcut</p>
              <p className="text-xs text-gray-500">
                Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">ESC</kbd>
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleClose}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Got it!
        </Button>
      </Card>
    </div>
  );
}
