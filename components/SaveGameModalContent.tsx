
import * as React from 'react';
import { SaveSlot, ModalConfig, SaveGameEventDetail } from '../types';
import SaveSlotList from './SaveSlotList';

interface SaveGameModalContentProps {
    saveSlots: SaveSlot[];
    onShowModal: (config: Omit<ModalConfig, 'isOpen' | 'onClose'>) => void;
}

const SaveGameModalContent = ({ saveSlots, onShowModal }: SaveGameModalContentProps) => {

    const handleSelectSlot = (slotIndex: number) => {
        const selectedSlot = saveSlots[slotIndex];

        const performSave = () => {
            const eventDetail: SaveGameEventDetail = { slotIndex };
            window.dispatchEvent(new CustomEvent('save-game-to-slot', { detail: eventDetail }));
        };

        if (selectedSlot.exists) {
            onShowModal({
                title: "上書き保存の確認",
                content: `スロット ${slotIndex + 1} には既にデータがあります。上書きしてもよろしいですか？`,
                buttons: [
                    {
                        text: "はい、上書きします",
                        className: "bg-red-500 hover:bg-red-700 text-white",
                        action: performSave,
                    },
                    {
                        text: "いいえ",
                        className: "bg-gray-500 hover:bg-gray-700 text-white",
                        action: () => {
                             // Re-open the save modal
                             onShowModal({
                                title: "ゲームをセーブする",
                                content: <SaveGameModalContent saveSlots={saveSlots} onShowModal={onShowModal} />,
                                showCloseButton: true,
                            });
                        },
                    }
                ]
            });
        } else {
            performSave();
        }
    };

    return (
        <div>
            <p className="text-left text-gray-600 mb-4">どのスロットにセーブしますか？</p>
            <SaveSlotList
                slots={saveSlots}
                onSelectSlot={handleSelectSlot}
                actionType="save"
            />
        </div>
    );
};

export default SaveGameModalContent;
