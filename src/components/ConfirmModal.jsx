import React from 'react';

export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-[80] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#282828] w-full max-w-sm rounded-xl p-6 shadow-2xl relative animate-scale-up border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button 
            onClick={onCancel}
            className="text-white font-bold px-4 py-2 rounded hover:bg-white/10 transition"
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm}
            className="bg-red-600 text-white font-bold px-6 py-2 rounded-full hover:scale-105 active:scale-95 transition"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}