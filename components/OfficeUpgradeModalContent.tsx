import * as React from 'react';
import { GameState, ModalConfig, Office, UpgradeOfficeEventDetail } from '../types';
import { ALL_OFFICES_FOR_UPGRADE } from '../constants';
import { formatFunds } from '../utils';
import ActionButton from './ActionButton';

interface OfficeUpgradeModalContentProps {
    gameState: GameState;
    onShowModal: (config: Omit<ModalConfig, 'isOpen' | 'onClose'>) => void;
}

const OfficeUpgradeModalContent = ({ gameState, onShowModal }: OfficeUpgradeModalContentProps) => {
    const currentOffice = gameState.office;

    const availableUpgrades = React.useMemo(() => {
        return ALL_OFFICES_FOR_UPGRADE.filter(office =>
            office.employee_capacity > currentOffice.employee_capacity
        );
    }, [currentOffice]);

    const handleSelectUpgrade = (newOffice: Office) => {
        if (gameState.funds < newOffice.rent_monthly) {
            onShowModal({
                title: "資金不足",
                content: `新しい事務所「${newOffice.name}」の家賃 (${formatFunds(newOffice.rent_monthly)}) を初月に支払うには資金が不足しています。`,
                showCloseButton: true,
            });
            return;
        }
        const eventDetail: UpgradeOfficeEventDetail = newOffice;
        window.dispatchEvent(new CustomEvent<UpgradeOfficeEventDetail>('upgrade-office', { detail: eventDetail }));
    };

    if (availableUpgrades.length === 0) {
        return <p className="text-gray-600">現在、これ以上大きな事務所へのアップグレードはありません。</p>;
    }

    return (
        <div className="space-y-4 text-left">
            <p className="text-gray-700 mb-3">現在の事務所: <strong>{currentOffice.name}</strong> (家賃: {formatFunds(currentOffice.rent_monthly)}/月, 最大 {currentOffice.employee_capacity}名)</p>
            <p className="text-gray-600">どの事務所に移転しますか？ 新しい家賃は次の月から適用されます。</p>
            <div className="space-y-3">
                {availableUpgrades.map(office => {
                    const rentIncrease = office.rent_monthly - currentOffice.rent_monthly;
                    const capacityIncrease = office.employee_capacity - currentOffice.employee_capacity;
                    const canAfford = gameState.funds >= office.rent_monthly;

                    return (
                        <div key={office.name} className={`p-3 border rounded-lg ${canAfford ? 'bg-gray-50 hover:bg-gray-100' : 'bg-red-50'}`}>
                            <h4 className="font-mochiy text-gray-800 text-lg">{office.name}</h4>
                            <p className="text-sm text-gray-600">
                                家賃: {formatFunds(office.rent_monthly)}/月
                                <span className={rentIncrease >= 0 ? 'text-red-500' : 'text-green-500'}>
                                    &nbsp;({rentIncrease >= 0 ? '+' : ''}{formatFunds(rentIncrease)})
                                </span>
                            </p>
                            <p className="text-sm text-gray-600">
                                最大従業員数: {office.employee_capacity}名
                                <span className="text-green-500">
                                    &nbsp;(+{capacityIncrease}名)
                                </span>
                            </p>
                            <ActionButton
                                onClick={() => handleSelectUpgrade(office)}
                                className={`mt-2 text-sm py-1 px-3 ${!canAfford ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}
                                disabled={!canAfford}
                                title={!canAfford ? `資金が不足しています (${formatFunds(gameState.funds)} / ${formatFunds(office.rent_monthly)}必要)` : `移転費用はかかりませんが、翌月から新しい家賃が適用されます。`}
                            >
                                この事務所に移転
                            </ActionButton>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OfficeUpgradeModalContent;