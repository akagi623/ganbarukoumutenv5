
import * as React from 'react';
import { DifficultyLevel, SaveSlot } from '../types';
import { DIFFICULTY_SETTINGS } from '../constants';
import ActionButton from './ActionButton';
import SaveSlotList from './SaveSlotList';

interface SetupScreenProps {
  onStartGame: (companyName: string, presidentName:string, difficulty: DifficultyLevel) => void;
  saveSlots: SaveSlot[];
  onLoadGame: (slotIndex: number) => void;
  onDeleteGame: (slotIndex: number) => void;
}

const SetupScreen = ({ onStartGame, saveSlots, onLoadGame, onDeleteGame }: SetupScreenProps) => {
    const [companyName, setCompanyName] = React.useState('がんばる工務店');
    const [presidentName, setPresidentName] = React.useState('あなた');
    const [difficulty, setDifficulty] = React.useState<DifficultyLevel>(DifficultyLevel.NORMAL);
    const hasSaveData = React.useMemo(() => saveSlots.some(s => s.exists), [saveSlots]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStartGame(companyName, presidentName, difficulty);
    };

    return (
        <div className="flex flex-col gap-8 max-w-2xl mx-auto p-4">
             <div className="w-full bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-3xl font-bold text-center mb-8 font-mochiy text-blue-500">会社をはじめよう！</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="companyName" className="block text-lg font-medium text-gray-700">会社名:</label>
                        <input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label htmlFor="presidentName" className="block text-lg font-medium text-gray-700">社長の名前:</label>
                        <input type="text" id="presidentName" value={presidentName} onChange={(e) => setPresidentName(e.target.value)} className="mt-1 block w-full border border-gray-300 py-2 px-3 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-gray-700">難易度:</label>
                        <div className="mt-2 space-y-3">
                            {Object.values(DifficultyLevel).map(key => (
                                <div key={key} className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
                                    <input type="radio" name="difficulty" id={key} value={key} checked={difficulty === key} onChange={() => setDifficulty(key as DifficultyLevel)} className="form-radio h-5 w-5 text-blue-500 focus:ring-blue-500"/>
                                    <label htmlFor={key} className="ml-3 font-medium text-gray-800 text-base">{DIFFICULTY_SETTINGS[key as DifficultyLevel].label}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ActionButton type="submit" className="bg-blue-500 hover:bg-blue-600">ゲーム開始！</ActionButton>
                </form>
            </div>

            {hasSaveData && (
                <div className="w-full bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-3xl font-bold text-center mb-8 font-mochiy text-green-500">つづきから</h2>
                    <SaveSlotList
                        slots={saveSlots}
                        onSelectSlot={onLoadGame}
                        onDeleteSlot={onDeleteGame}
                        actionType="load"
                    />
                </div>
            )}
        </div>
    );
};

export default SetupScreen;