import * as React from 'react';
import { GameState, ModalConfig, TrainEmployeesEventDetail } from '../types';
import { BASE_VALUES } from '../constants';
import { formatFunds } from '../utils';
import ActionButton from './ActionButton';

interface TrainingModalContentProps {
    gameState: GameState;
    onShowModal: (config: Omit<ModalConfig, 'isOpen' | 'onClose'>) => void;
}

const TrainingModalContent = ({ gameState, onShowModal }: TrainingModalContentProps) => {
    const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<string[]>([]);
    const availableEmployees = React.useMemo(() => gameState.employees.filter(e => !e.is_busy && !e.is_on_leave), [gameState.employees]);
    const totalCost = selectedEmployeeIds.length * BASE_VALUES.TRAINING_COST_PER_EMPLOYEE;

    const toggleEmployee = (id: string) => {
        setSelectedEmployeeIds(prev => prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]);
    };

    const handleConfirm = () => {
        if (totalCost > gameState.funds) {
            onShowModal({ title: "資金不足", content: "研修費用が足りません。", showCloseButton: true });
            return;
        }
        if (selectedEmployeeIds.length > 0) {
            const eventDetail: TrainEmployeesEventDetail = { employeeIds: selectedEmployeeIds, cost: totalCost };
            window.dispatchEvent(new CustomEvent<TrainEmployeesEventDetail>('train-employees', { detail: eventDetail }));
        }
    };

    return (
        <div className="space-y-4 text-left">
            <p className="text-sm text-gray-600">研修を受けさせる従業員を選んでください。(1人あたり費用: {formatFunds(BASE_VALUES.TRAINING_COST_PER_EMPLOYEE)}, スキル上昇: +{BASE_VALUES.TRAINING_SKILL_GAIN})</p>
            <p className="text-sm text-gray-600">研修期間は1週間です。</p>
            <div className="max-h-48 overflow-y-auto my-2 border p-2 rounded-md bg-gray-50">
                {availableEmployees.length > 0 ? availableEmployees.map(emp => (
                    <div key={emp.id} className="flex items-center p-1.5 hover:bg-gray-100 rounded cursor-pointer" onClick={() => toggleEmployee(emp.id)}>
                        <input type="checkbox" id={`train_${emp.id}`} checked={selectedEmployeeIds.includes(emp.id)} onChange={() => {}} className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500"/>
                        <label htmlFor={`train_${emp.id}`} className="ml-2 text-sm text-gray-700">{emp.name} (現スキル: {emp.skill_point})</label>
                    </div>
                )) : <p className="text-sm text-gray-500">研修可能な従業員がいません。</p>}
            </div>
            <div>
                <h4 className="font-bold text-gray-800">研修費用</h4>
                <p className="text-sm text-gray-600">選択人数: {selectedEmployeeIds.length}名</p>
                <p className="text-sm text-gray-600">合計費用: {formatFunds(totalCost)}</p>
            </div>
            <ActionButton onClick={handleConfirm} disabled={selectedEmployeeIds.length === 0 || totalCost > gameState.funds}>研修開始</ActionButton>
        </div>
    );
};

export default TrainingModalContent;