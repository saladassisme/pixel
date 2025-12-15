import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 right-4 z-[100] animate-slide-in pointer-events-none">
      <div className={`
        border-4 border-black shadow-pixel p-4 flex items-center gap-4 min-w-[200px]
        ${type === 'success' ? 'bg-green-400 text-black' : 'bg-red-400 text-black'}
      `}>
        <div className="bg-white rounded-full p-1 border-2 border-black shrink-0">
          {type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <span className="font-bold text-lg font-pixel">{message}</span>
      </div>
    </div>
  );
};

export default Toast;