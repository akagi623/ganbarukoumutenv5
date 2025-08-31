
import * as React from 'react';
import { SaveSlot } from '../types';
import { formatFunds } from '../utils';
import { TrashIcon } from './icons/TrashIcon';

interface SaveSlotListProps {
    slots: SaveSlot[];
    onSelectSlot: (slotIndex: number) => void;
    onDeleteSlot?: (slotIndex: number) => void;
    actionType: 'load' | 'save';
}

const SaveSlotList = ({ slots, onSelectSlot, onDeleteSlot, actionType }: SaveSlotListProps) => {

    const handleSelect = (slot: SaveSlot) => {
        onSelectSlot(slot.slotIndex);
    };

    const handleDelete = (e: React.MouseEvent, slotIndex: number) => {
        e.stopPropagation(); // Prevent triggering onSelectSlot
        if (onDeleteSlot) {
            onDeleteSlot(slotIndex);
        }
    };

    return (
        <div className="space-y-3">
            {slots.map((slot) => {
                const gs = slot.gameState;
                const buttonBaseClass = "w-full text-left p-3 rounded-lg border transition-all duration-150 ease-in-out flex justify-between items-center";
                const buttonHoverClass = actionType === 'load' 
                    ? "hover:bg-green-50 hover:border-green-300 hover:shadow-md"
                    : "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md";

                return (
                    <button
                        key={slot.slotIndex}
                        onClick={() => handleSelect(slot)}
                        className={`${buttonBaseClass} ${gs ? `${buttonHoverClass} bg-white border-gray-200` : 'bg-gray-100 border-gray-200 border-dashed'}`}
                        aria-label={gs ? `${actionType === 'load' ? 'ロード' : 'セーブ'}: ${gs.company_name}` : `空のスロット ${slot.slotIndex + 1}`}
                    >
                        {gs ? (
                            <div className="flex-grow">
                                <p className="font-bold text-gray-800">{`スロット ${slot.slotIndex + 1}: ${gs.company_name}`}</p>
                                <p className="text-sm text-gray-600">{`${gs.current_year}年${gs.current_month}月${gs.current_week}週 | ${formatFunds(gs.funds)}`}</p>
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">{`スロット ${slot.slotIndex + 1}: (空のデータ)`}</p>
                        )}
                        
                        {gs && onDeleteSlot && (
                            <div 
                                onClick={(e) => handleDelete(e, slot.slotIndex)}
                                className="p-2 rounded-full hover:bg-red-100 ml-2 flex-shrink-0"
                                role="button"
                                aria-label={`スロット ${slot.slotIndex + 1} のデータを削除`}
                                title="データを削除"
                            >
                                <TrashIcon className="h-5 w-5 text-red-500" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default SaveSlotList;
