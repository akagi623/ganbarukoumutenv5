import * as React from 'react';
import { GameState, Project, ModalConfig } from '../types';
import { ALL_PROJECTS, AUTOMATED_CONSTRUCTION_MACHINE_NAME, POWERED_SUIT_NAME } from '../constants';
import { formatFunds } from '../utils';
import ProjectAssignmentModalContent from './ProjectAssignmentModalContent';

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

interface ProjectListModalContentProps {
    gameState: GameState;
    onShowModal: (config: Omit<ModalConfig, 'isOpen' | 'onClose'>) => void;
}

const ProjectListModalContent = ({ gameState, onShowModal }: ProjectListModalContentProps) => {
    const hasAutomatedMachine = gameState.equipment.includes(AUTOMATED_CONSTRUCTION_MACHINE_NAME);
    const hasPoweredSuit = gameState.equipment.includes(POWERED_SUIT_NAME);

    const getEffectiveMinEmployees = (project: Project): number => {
        if (hasAutomatedMachine) {
            return Math.max(1, Math.round(project.required_employees_min / 4));
        }
        return project.required_employees_min;
    };

    const availableProjects = React.useMemo(() => {
        const filtered = ALL_PROJECTS.filter(p =>
            gameState.reputation >= p.required_reputation &&
            p.required_equipment.every(req => gameState.equipment.includes(req)) &&
            !gameState.ongoing_projects.some(op => op.project_data.id === p.id)
        );
        const shuffled = shuffleArray(filtered);
        return shuffled.slice(0, 5 + Math.floor(gameState.reputation));
    }, [gameState]);

    const handleSelectProject = (project: Project) => {
        onShowModal({
            title: `案件受注: ${project.name}`,
            content: <ProjectAssignmentModalContent gameState={gameState} project={project} onShowModal={onShowModal} />,
            buttons: [
                { text: "戻る", className: "bg-gray-500 hover:bg-gray-600", action: () => {
                     onShowModal({ 
                        title: "新規案件を探す",
                        content: <ProjectListModalContent gameState={gameState} onShowModal={onShowModal} />,
                        showCloseButton: true,
                    });
                }}
            ]
        });
    };

    if (availableProjects.length === 0) {
        return <p>現在、条件に合う仕事の依頼が見つかりませんでした…。評判を上げるか、設備投資が必要かもしれません。</p>;
    }

    return (
        <div className="space-y-3 text-left">
            <p className="text-gray-600 mb-3">社長、こんなお仕事の依頼が来ています。</p>
            {availableProjects.map(p => {
                const effectiveMin = getEffectiveMinEmployees(p);
                const displayedWorkload = hasPoweredSuit ? Math.ceil(p.total_workload / 2) : p.total_workload;
                const workloadChangedBySuit = hasPoweredSuit && p.total_workload !== displayedWorkload && p.total_workload > 0;

                return (
                    <div key={p.id} className="bg-gray-100 p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <h4 className="font-mochiy text-gray-800 text-lg">{p.name}</h4>
                        <p className="text-sm italic text-gray-600 my-2">「{p.description}」</p>
                        <p className="text-sm text-gray-600">報酬: {formatFunds(p.reward)} / 作業量: {displayedWorkload}人週 {workloadChangedBySuit && <span className="text-xs text-blue-500">(スーツ装備時)</span>}</p>
                        <p className="text-sm text-gray-600">
                            要求スキル: {p.required_skill} / 必要人数: {effectiveMin}名以上
                            {hasAutomatedMachine && p.required_employees_min !== effectiveMin && 
                                <span className="text-xs text-blue-500"> (通常 {p.required_employees_min}名)</span>
                            }
                        </p>
                        <button onClick={() => handleSelectProject(p)} className="mt-2 text-sm text-white bg-cyan-500 hover:bg-cyan-700 py-1 px-3 rounded shadow hover:shadow-lg transition-all">受注検討</button>
                    </div>
                );
            })}
        </div>
    );
};

export default ProjectListModalContent;