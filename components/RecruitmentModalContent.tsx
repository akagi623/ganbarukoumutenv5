import * as React from 'react';
import { GameState, ModalConfig, RecruitEmployeesEventDetail } from '../types';
import { BASE_VALUES } from '../constants';
import { formatFunds } from '../utils';

interface RecruitmentModalContentProps {
    gameState: GameState;
    onShowModal: (config: Omit<ModalConfig, 'isOpen' | 'onClose'>) => void;
}

const RecruitmentModalContent = ({ gameState, onShowModal }: RecruitmentModalContentProps) => {
    const isPaidDisabled = gameState.funds < BASE_VALUES.HIRE_COST_PAID;

    const handleRecruit = (isPaid: boolean) => {
        if (isPaid && isPaidDisabled) {
             onShowModal({
                title: "資金不足",
                content: `有料募集には ${formatFunds(BASE_VALUES.HIRE_COST_PAID)} が必要ですが、資金が足りません。`,
                showCloseButton: true,
            });
            return;
        }
        const eventDetail: RecruitEmployeesEventDetail = { isPaid };
        window.dispatchEvent(new CustomEvent<RecruitEmployeesEventDetail>('recruit-employees', { detail: eventDetail }));
    };

    return (
        <div className="space-y-4 text-left">
            <p className="text-gray-600">どの方法で募集しますか？会社の評判や待遇が良いほど、応募者が現れやすくなります。</p>
            
            <div 
                onClick={() => handleRecruit(false)}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 hover:shadow-md transition-all cursor-pointer group"
            >
                <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">無料媒体で探す</h4>
                <p className="text-sm text-gray-600 mt-1">費用はかかりませんが、応募者が現れる確率は低く、未経験者がほとんどです。</p>
                <div className="text-right mt-2">
                    <span className="font-mochiy py-2 px-4 rounded-lg bg-gray-500 text-white text-sm shadow-sm group-hover:bg-gray-600 transition-colors">選択する</span>
                </div>
            </div>
            
            <div 
                onClick={() => handleRecruit(true)}
                className={`p-4 border rounded-lg bg-yellow-50 transition-all group ${isPaidDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-yellow-100 hover:shadow-md'}`}
                title={isPaidDisabled ? "資金が足りません" : ""}
            >
                <h4 className={`font-bold text-gray-800 text-lg ${!isPaidDisabled && 'group-hover:text-yellow-800'} transition-colors`}>有料媒体で探す</h4>
                <p className="text-sm text-gray-600 mt-1">費用がかかりますが、応募者が現れる確率が高く、経験者の応募も期待できます。<span className="text-blue-600 font-bold">稀に特別なキャラが現れることも…？</span></p>
                <p className="text-sm font-semibold text-red-500 mt-2">費用: {formatFunds(BASE_VALUES.HIRE_COST_PAID)}</p>
                <div className="text-right mt-2">
                    <span className={`font-mochiy py-2 px-4 rounded-lg text-white text-sm shadow-sm ${isPaidDisabled ? 'bg-gray-400' : 'bg-yellow-500 group-hover:bg-yellow-600'} transition-colors`}>選択する</span>
                </div>
            </div>
        </div>
    );
};

export default RecruitmentModalContent;