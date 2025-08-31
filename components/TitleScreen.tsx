
import * as React from 'react';
import ActionButton from './ActionButton';
import VolumeControl from './BgmControl';
import { SaveSlot } from '../types';
import SaveSlotList from './SaveSlotList';

interface TitleScreenProps {
  saveSlots: SaveSlot[];
  onStartNewGame: () => void;
  onLoadGame: (slotIndex: number) => void;
  onDeleteGame: (slotIndex: number) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

const TitleScreen = ({ saveSlots, onStartNewGame, onLoadGame, onDeleteGame, volume, onVolumeChange }: TitleScreenProps) => {
  const hasSaveData = React.useMemo(() => saveSlots.some(s => s.exists), [saveSlots]);

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <main className="flex-grow flex flex-col items-center justify-center pt-8">
        <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-8 px-4">
          
          <div className="text-center w-full flex flex-col items-center">
            <img 
              src="/assets_start/start(4).jpg" 
              alt="がんばる工務店メインイメージ" 
              className="w-full max-w-md rounded-lg shadow-xl mb-6"
            />
            <h1 className="text-5xl md:text-6xl font-bold mb-2 font-mochiy text-blue-500" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
              がんばる工務店
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold mb-8 font-mochiy text-gray-700" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
              奮闘記
            </h2>
          </div>
          
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-2xl border">
                <h3 className="font-mochiy text-2xl text-center text-gray-800 mb-4">メニュー</h3>
                <div className="space-y-4">
                  <ActionButton onClick={onStartNewGame} className="bg-green-500 hover:bg-green-600">
                    はじめから
                  </ActionButton>
                   {hasSaveData && (
                    <div className="pt-4 border-t">
                      <h3 className="font-mochiy text-xl text-center text-gray-700 mb-3">つづきから</h3>
                      <SaveSlotList
                        slots={saveSlots}
                        onSelectSlot={onLoadGame}
                        onDeleteSlot={onDeleteGame}
                        actionType="load"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
                    <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
                </div>
            </div>
          </div>

        </div>
      </main>
      <footer className="text-center text-xs text-gray-500 py-4 shrink-0">
        Copyright © 2025 Yuta Akagi All Rights Reserved.
      </footer>
    </div>
  );
};

export default TitleScreen;