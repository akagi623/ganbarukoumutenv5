import * as React from 'react';
import { GameState, ModalConfig, EquipmentItem, BuyEquipmentEventDetail } from '../types';
import { ALL_EQUIPMENT, GHOST_EQUIPMENT } from '../constants';
import { formatFunds } from '../utils';

interface EquipmentModalContentProps {
    gameState: GameState;
    onShowModal: (config: Omit<ModalConfig, 'isOpen' | 'onClose'>) => void;
}

const EquipmentModalContent = ({ gameState, onShowModal }: EquipmentModalContentProps) => {
    const buyableEquipment = React.useMemo(() => ALL_EQUIPMENT.filter(eq => 
        !GHOST_EQUIPMENT.some(ge => ge.name === eq.name) && 
        !gameState.equipment.includes(eq.name)
    ), [gameState.equipment]);

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
            <p className="text-gray-600 mb-3">どの設備に投資しますか？ (現在資金: {formatFunds(gameState.funds)})</p>
            {buyableEquipment.length > 0 ? buyableEquipment.map(item => (
                <button key={item.name} onClick={() => handleBuy(item)} disabled={gameState.funds < item.cost}
                    className="w-full text-left p-3 rounded-md border border-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow-sm transition-all">
                    <strong className="text-gray-800">{item.name}</strong> <span className="text-sm text-gray-600">(費用: {formatFunds(item.cost)})</span>
                </button>
            )) : <p className="text-sm text-gray-500">購入できる新しい設備は今のところありません。</p>}
        </div>
    );
};

export default EquipmentModalContent;