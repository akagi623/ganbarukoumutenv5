import * as React from 'react';
import { GameState, ModalConfig, EquipmentItem, BuyEquipmentEventDetail } from '../types';
import { GHOST_EQUIPMENT } from '../constants';
import { formatFunds } from '../utils';

interface GhostEquipmentModalContentProps {
    gameState: GameState;
    onShowModal: (config: Omit<ModalConfig, 'isOpen' | 'onClose'>) => void;
}

const GhostEquipmentModalContent = ({ gameState, onShowModal }: GhostEquipmentModalContentProps) => {
    const buyableEquipment = React.useMemo(() => GHOST_EQUIPMENT.filter(eq => !gameState.equipment.includes(eq.name)), [gameState.equipment]);

    const handleBuy = (item: EquipmentItem) => {
        if (gameState.funds < item.cost) {
            onShowModal({ title: "資金不足", content: `「${item.name}」の購入資金が足りません。`, showCloseButton: true });
            return;
        }
        const eventDetail: BuyEquipmentEventDetail = item;
        window.dispatchEvent(new CustomEvent<BuyEquipmentEventDetail>('buy-equipment', { detail: eventDetail }));
    };

    return (
        <div className="space-y-3 text-left">
            <p className="text-gray-600 mb-3">「フフフ…よく来たね。ここでは表には出回らない“幻の一品”を扱ってるのさ。…もっとも、あんたに支払えるだけの“覚悟”があるなら、だがね。」</p>
            {buyableEquipment.length > 0 ? buyableEquipment.map(item => (
                <button key={item.name} onClick={() => handleBuy(item)} disabled={gameState.funds < item.cost}
                    className="w-full text-left p-3 rounded-md border border-purple-300 bg-purple-50 disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-purple-100 hover:shadow-sm transition-all">
                    <strong className="text-purple-800">{item.name}</strong> <span className="text-sm text-purple-600">(費用: {formatFunds(item.cost)})</span>
                </button>
            )) : <p className="text-sm text-gray-500">「今日のところは売り切れだ。また“縁”があったら、寄ってくれ。」</p>}
        </div>
    );
};

export default GhostEquipmentModalContent;