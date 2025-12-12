import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

export default function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-[#1db954] text-black px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[100] animate-slide-up font-bold min-w-[300px] justify-center">
      <FaCheckCircle className="text-xl" />
      <span>{message}</span>
    </div>
  );
}