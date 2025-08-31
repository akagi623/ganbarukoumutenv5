import * as React from 'react';
import { GameState, Project, ModalConfig, AcceptProjectEventDetail, Employee } from '../types';
import ActionButton from './ActionButton';
import { POWERED_SUIT_NAME, AUTOMATED_CONSTRUCTION_MACHINE_NAME } from '../constants';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ProjectAssignmentModalContentProps {
    gameState: GameState;
    project: Project;
    onShowModal: (config: Omit<ModalConfig, 'isOpen' | 'onClose'>) => void;
}

const ProjectAssignmentModalContent = ({ gameState, project, onShowModal }: ProjectAssignmentModalContentProps) => {
    const [selectedEmployeeIds, setSelectedEmployeeIds] = React.useState<string[]>([]);
    const availableEmployees = React.useMemo(() => gameState.employees.filter(e => !e.is_busy && !e.is_on_leave), [gameState.employees]);
    
    const hasAutomatedMachine = gameState.equipment.includes(AUTOMATED_CONSTRUCTION_MACHINE_NAME);
    const effectiveMinEmployees = React.useMemo(() => {
        if (hasAutomatedMachine) {
            return Math.max(1, Math.round(project.required_employees_min / 4));
        }
        return project.required_employees_min;
    }, [project.required_employees_min, hasAutomatedMachine]);

    const toggleEmployee = (id: string) => {
        setSelectedEmployeeIds(prev => prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]);
    };

    const assignedTeamSkill = React.useMemo(() => {
        if (selectedEmployeeIds.length === 0) return 0;
        const totalSkill = selectedEmployeeIds.reduce((sum, id) => {
            const emp = gameState.employees.find(e => e.id === id);
            return sum + (emp?.skill_point || 0);
        }, 0);
        return totalSkill / selectedEmployeeIds.length;
    }, [selectedEmployeeIds, gameState.employees]);
    
    const isSkillSufficient = assignedTeamSkill >= project.required_skill;

    const estimatedWeeks = React.useMemo(() => {
        if (selectedEmployeeIds.length === 0) return Infinity;
        const hasPoweredSuit = gameState.equipment.includes(POWERED_SUIT_NAME);
        const workPowerPerWeek = selectedEmployeeIds.length * (hasPoweredSuit ? 2 : 1);
        if (workPowerPerWeek === 0) return Infinity;
        const rawWeeks = project.total_workload / workPowerPerWeek;
        return Math.max(1, Math.ceil(rawWeeks));
    }, [selectedEmployeeIds, project.total_workload, gameState.equipment]);

    const handleConfirm = () => {
        if (selectedEmployeeIds.length < effectiveMinEmployees) {
            onShowModal({ title: "人員不足", content: `この案件には最低${effectiveMinEmployees}名必要です。`, showCloseButton: true });
            return;
        }
        if (assignedTeamSkill < project.required_skill) {
            onShowModal({ title: "技術不足", content: `このチームの平均スキル(${assignedTeamSkill.toFixed(0)})では、要求スキル(${project.required_skill})に満たないため、受注できません。\n(要求スキル: ${project.required_skill}, チームスキル: ${assignedTeamSkill.toFixed(0)})`, showCloseButton: true });
            return;
        }
        const eventDetail: AcceptProjectEventDetail = { project, selectedEmployeeIds };
        window.dispatchEvent(new CustomEvent<AcceptProjectEventDetail>('accept-project', { detail: eventDetail }));
    };

    const handleAutoAssignMin = () => {
        const sortedEmployees: Employee[] = [...availableEmployees].sort((a, b) => b.skill_point - a.skill_point);
        const selected: string[] = sortedEmployees.slice(0, effectiveMinEmployees).map(emp => emp.id);
        setSelectedEmployeeIds(selected);
    };

    const handleAutoAssignMax = () => {
        const sortedAvailableEmployees = [...availableEmployees].sort((a, b) => b.skill_point - a.skill_point);
        
        if (sortedAvailableEmployees.length === 0) {
            setSelectedEmployeeIds([]);
            return;
        }

        const hasPoweredSuit = gameState.equipment.includes(POWERED_SUIT_NAME);
        let currentSelectionIds: string[] = [];

        for (const emp of sortedAvailableEmployees) {
            currentSelectionIds.push(emp.id);

            if (currentSelectionIds.length >= effectiveMinEmployees) {
                const workPowerPerWeek = currentSelectionIds.length * (hasPoweredSuit ? 2 : 1);
                if (workPowerPerWeek === 0) continue; 

                const rawWeeks = project.total_workload / workPowerPerWeek;
                const currentEstimatedWeeks = Math.max(1, Math.ceil(rawWeeks));

                if (currentEstimatedWeeks <= 1) {
                    setSelectedEmployeeIds([...currentSelectionIds]);
                    return;
                }
            }
        }
        
        if (currentSelectionIds.length < effectiveMinEmployees) {
             const finalSelection = sortedAvailableEmployees.slice(0, Math.min(effectiveMinEmployees, sortedAvailableEmployees.length)).map(e => e.id);
             setSelectedEmployeeIds(finalSelection);
        } else {
             setSelectedEmployeeIds([...currentSelectionIds]); 
        }
    };


    return (
        <div className="space-y-4 text-left">
            <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
                <h4 className="font-bold text-gray-800">自動割り振り</h4>
                <div className="grid grid-cols-2 gap-2">
                    <ActionButton
                        onClick={handleAutoAssignMin}
                        className="bg-purple-500 hover:bg-purple-700 text-sm py-2"
                        disabled={availableEmployees.length < effectiveMinEmployees}
                        title={availableEmployees.length < effectiveMinEmployees ? `アサイン可能な従業員が最低人数(${effectiveMinEmployees}名)に足りません` : `スキルが高い従業員を最低人数(${effectiveMinEmployees}名)アサインします`}
                    >
                        最低人数で
                    </ActionButton>
                     <ActionButton
                        onClick={handleAutoAssignMax}
                        className="bg-cyan-500 hover:bg-cyan-700 text-sm py-2"
                        disabled={availableEmployees.length === 0}
                        title="手の空いている従業員からスキル順に、工期が1週間となるか全員割り当てるまでアサインします"
                    >
                        工期最短で
                    </ActionButton>
                </div>
            </div>

            <div>
                <p className="text-gray-600">最低人数: {effectiveMinEmployees}名 / 要求スキル: {project.required_skill}</p>
                {hasAutomatedMachine && project.required_employees_min !== effectiveMinEmployees &&
                    <p className="text-xs text-blue-500">(全自動建機により、通常 {project.required_employees_min}名から軽減されています)</p>
                }
                <p className="text-gray-600 mt-2">または、手動で選択 ({availableEmployees.length}名):</p>
                <div className="max-h-48 overflow-y-auto my-2 border p-2 rounded-md bg-gray-50">
                    {availableEmployees.length > 0 ? availableEmployees.map(emp => (
                        <div key={emp.id} className="flex items-center p-1.5 hover:bg-gray-100 rounded cursor-pointer" onClick={() => toggleEmployee(emp.id)}>
                            <input type="checkbox" id={`assign_${emp.id}`} checked={selectedEmployeeIds.includes(emp.id)} onChange={() => {}} className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500"/>
                            <label htmlFor={`assign_${emp.id}`} className="ml-2 text-sm text-gray-700">{emp.name} (スキル: {emp.skill_point})</label>
                        </div>
                    )) : <p className="text-sm text-gray-500">現在、手の空いている従業員がいません。</p>}
                </div>
            </div>
            <div>
                <h4 className="font-bold text-gray-800">チーム状況</h4>
                <p className="text-sm text-gray-600">選択人数: {selectedEmployeeIds.length}名</p>
                <p className={`text-sm transition-colors ${isSkillSufficient && selectedEmployeeIds.length > 0 ? 'text-green-600 font-semibold' : 'text-gray-600'}`}>
                    チーム平均スキル: {assignedTeamSkill.toFixed(0)}
                    {isSkillSufficient && selectedEmployeeIds.length > 0 && <CheckCircleIcon className="h-5 w-5 inline-block ml-1 text-green-500" />}
                </p>
                <p className="text-sm text-gray-600">予想完了期間: {isFinite(estimatedWeeks) ? `${estimatedWeeks}週間` : " (人を選んでください)"}</p>
            </div>
             <ActionButton onClick={handleConfirm} disabled={selectedEmployeeIds.length === 0}>この内容で案件開始</ActionButton>
        </div>
    );
};

export default ProjectAssignmentModalContent;