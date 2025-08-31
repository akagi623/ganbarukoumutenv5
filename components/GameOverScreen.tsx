import * as React from 'react';
import { GameState } from '../types';
import { formatFunds, getReputationStars } from '../utils';
import ActionButton from './ActionButton';

interface GameOverScreenProps {
  finalGameState: GameState;
  reason: string;
  onRestart: () => void;
}

const GameOverScreen = ({ finalGameState, reason, onRestart }: GameOverScreenProps) => (
    <div className="text-center p-8">
        <h2 className="text-5xl font-bold text-red-500 mb-6 font-mochiy">ゲームオーバー</h2>
        <p className="text-xl text-gray-700 mb-8">{reason}</p>
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-md mx-auto space-y-3 text-left mb-8 border border-gray-200">
            <p><strong>最終会社名:</strong> <span className="font-semibold">{finalGameState.company_name}</span></p>
            <p><strong>経営週数:</strong> <span className="font-semibold">{finalGameState.total_weeks_elapsed}</span>週</p>
            <p><strong>最終資金:</strong> <span className="font-semibold text-red-500">{formatFunds(finalGameState.funds)}</span></p>
            <p><strong>最終評判:</strong> <span className="text-yellow-400 font-semibold">{getReputationStars(finalGameState.reputation)} ({finalGameState.reputation.toFixed(1)}/5)</span></p>
        </div>
        <ActionButton onClick={onRestart} className="bg-blue-500 hover:bg-blue-600 text-xl py-3 px-8">もう一度挑戦する！</ActionButton>
    </div>
);

export default GameOverScreen;