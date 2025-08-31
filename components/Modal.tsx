import * as React from 'react';
import { ModalConfig } from '../types';

interface ModalProps {
  config: ModalConfig;
  onClose: () => void; // Default close provided by App
}

const Modal = ({ config, onClose }: ModalProps) => {
    if (!config.isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            effectiveOnClose();
        }
    };

    const effectiveOnClose = config.onClose || onClose;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={handleOverlayClick}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto text-center transform transition-all animate-slide-in-up-fade">
                <h2 className="text-2xl font-bold mb-4 font-mochiy text-blue-500">{config.title}</h2>
                <div className="text-gray-700 mb-6 whitespace-pre-wrap max-h-[60vh] overflow-y-auto p-2">{config.content}</div>
                <div className="space-y-3">
                    {config.buttons?.map((btn, index) => (
                        <button key={index} onClick={() => { btn.action(); effectiveOnClose(); }}
                            className={`w-full font-mochiy py-2.5 px-5 rounded-lg transition-all duration-300 ease-in-out active:scale-95 ${btn.className || 'bg-gray-500 text-white hover:bg-gray-700'}`}>
                            {btn.text}
                        </button>
                    ))}
                </div>
                {config.showCloseButton && (!config.buttons || config.buttons.length === 0) && (
                    <button onClick={effectiveOnClose}
                        className="w-full font-mochiy py-2.5 px-5 rounded-lg transition-all duration-300 ease-in-out bg-blue-500 text-white hover:bg-blue-700 mt-4 active:scale-95">
                        OK
                    </button>
                )}
            </div>
        </div>
    );
};

export default Modal;