import * as React from 'react';
import { GameState, Welfare, UpdateWelfareEventDetail, ModalConfig } from '../types';
import ActionButton from './ActionButton';

interface WelfareModalContentProps {
    gameState: GameState;
    // onShowModal is not used here but kept for consistency if needed later
    onShowModal: (config: Omit<ModalConfig, 'isOpen' | 'onClose'>) => void; 
}

const WelfareModalContent = ({ gameState }: WelfareModalContentProps) => {
    const [bonus, setBonus] = React.useState(gameState.welfare.bonus_rate);
    const [holidays, setHolidays] = React.useState(gameState.welfare.annual_holidays);

    const handleConfirm = () => {
        const eventDetail: UpdateWelfareEventDetail = { bonus_rate: bonus, annual_holidays: holidays };
        window.dispatchEvent(new CustomEvent<UpdateWelfareEventDetail>('update-welfare', { detail: eventDetail }));
    };

    return (
        <div className="space-y-4 text-left">
            <div>
                <label htmlFor="bonus_rate" className="block font-medium text-gray-700">賞与 (給与ヶ月分)</label>
                <input type="number" id="bonus_rate" value={bonus} onChange={e => setBonus(parseFloat(e.target.value))} min="0" max="6" step="0.1" className="w-full border border-gray-300 p-2 rounded mt-1 focus:ring-blue-500 focus:border-blue-500 text-gray-900"/>
                <p className="text-xs text-gray-500 mt-1">6月と12月に支払われます。高いほどモチベーションが下がりにくくなります。</p>
            </div>
            <div>
                <label htmlFor="annual_holidays" className="block font-medium text-gray-700">年間休日 (日)</label>
                <input type="range" id="annual_holidays" value={holidays} onChange={e => setHolidays(parseInt(e.target.value))} min="85" max="140" className="w-full mt-1 accent-blue-600"/>
                <div className="text-center font-bold text-gray-700">{holidays} 日</div>
                <p className="text-xs text-gray-500 mt-1">少ないほど仕事は早く進みますが、社員の体力とやる気の消耗が激しくなります。</p>
            </div>
            <ActionButton onClick={handleConfirm}>この内容で決定</ActionButton>
        </div>
    );
};

export default WelfareModalContent;