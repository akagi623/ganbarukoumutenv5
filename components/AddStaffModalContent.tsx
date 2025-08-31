
import * as React from 'react';
import { GameState, OngoingProject, AddStaffEventDetail } from '../types';
import ActionButton from './ActionButton';

interface AddStaffModalContentProps {
    gameState: GameState;
    ongoingProject: OngoingProject;
}

const AddStaffModalContent = ({ gameState, ongoingProject }: AddStaffModalContentProps) => {
    const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<string[]>([]);
    const availableEmployees = React.useMemo(() => 
        gameState.employees.filter(e => !e.is_busy && !e.is_on_leave), 
        [gameState.employees]
    );

    const toggleEmployee = (id: string) => {
        setSelectedEmployeeIds(prev => prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]);
    };

    const handleConfirm = () => {
        if (selectedEmployeeIds.length > 0) {
            const eventDetail: AddStaffEventDetail = { projectId: ongoingProject.id, employeeIdsToAdd: selectedEmployeeIds };
            window.dispatchEvent(new CustomEvent<AddStaffEventDetail>('add-staff-to-project', { detail: eventDetail }));
        }
    };

    return (
        <div className="space-y-4 text-left">
            <p className="text-gray-600">プロジェクト「{ongoingProject.project_data.name}」に追加する従業員を選択してください。</p>
            <p className="text-sm text-gray-500">現在アサインされている従業員: {ongoingProject.assigned_employee_ids.length}名</p>
            
            <div className="max-h-48 overflow-y-auto my-2 border p-2 rounded-md bg-gray-50">
                {availableEmployees.length > 0 ? availableEmployees.map(emp => (
                    <div key={emp.id} className="flex items-center p-1.5 hover:bg-gray-100 rounded cursor-pointer" onClick={() => toggleEmployee(emp.id)}>
                        <input type="checkbox" id={`add_staff_${emp.id}`} checked={selectedEmployeeIds.includes(emp.id)} onChange={() => {}} className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500"/>
                        <label htmlFor={`add_staff_${emp.id}`} className="ml-2 text-sm text-gray-700">{emp.name} (スキル: {emp.skill_point})</label>
                    </div>
                )) : <p className="text-sm text-gray-500">追加できる従業員がいません。</p>}
            </div>

            <p>選択人数: {selectedEmployeeIds.length}名</p>
            <ActionButton onClick={handleConfirm} disabled={selectedEmployeeIds.length === 0}>
                従業員を追加
            </ActionButton>
        </div>
    );
};

export default AddStaffModalContent;
