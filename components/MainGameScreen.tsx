
import * as React from 'react';
import { GameState, ModalConfig, Employee, OngoingProject } from '../types';
import { WEEKS_IN_MONTH } from '../constants';
import { formatFunds, getReputationStars } from '../utils';
import ActionButton from './ActionButton';
import InfoPanel from './InfoPanel';
import ProjectListModalContent from './ProjectListModalContent';
import RecruitmentModalContent from './RecruitmentModalContent';
import TrainingModalContent from './TrainingModalContent';
import EquipmentModalContent from './EquipmentModalContent';
import GhostEquipmentModalContent from './GhostEquipmentModalContent';
import WelfareModalContent from './WelfareModalContent';
import OfficeUpgradeModalContent from './OfficeUpgradeModalContent';
import AddStaffModalContent from './AddStaffModalContent';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';
import { AcademicCapIcon } from './icons/AcademicCapIcon';
import { WrenchScrewdriverIcon } from './icons/WrenchScrewdriverIcon';
import { HeartIcon } from './icons/HeartIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { SaveIcon } from './icons/SaveIcon';


interface MainGameScreenProps {
  gameState: GameState;
  onAdvanceTime: (weeks: number) => void;
  onShowModal: (config: Omit<ModalConfig, 'isOpen' | 'onClose'>) => void;
  onSaveRequest: () => void;
  showGhostShop: boolean;
  onOpenGhostShop: () => void; // To hide button after opening
  onShowEmployeeDetails: (employee: Employee) => void;
  isAdvancingTime: boolean;
}

const MainGameScreen = ({ gameState, onAdvanceTime, onShowModal, onSaveRequest, showGhostShop, onOpenGhostShop, onShowEmployeeDetails, isAdvancingTime }: MainGameScreenProps) => {
    const { company_name, president_name, current_year, current_month, current_week, funds, reputation, employees, office, ongoing_projects, event_history, welfare } = gameState;
    const prevFunds = React.useRef(funds);
    const [highlightClass, setHighlightClass] = React.useState('');
  
    React.useEffect(() => {
      if (prevFunds.current !== funds) {
        if (funds > prevFunds.current) {
          setHighlightClass('bg-orange-200');
        } else {
          setHighlightClass('bg-red-200');
        }
        
        const timer = setTimeout(() => {
          setHighlightClass('');
        }, 700); // highlight duration
  
        prevFunds.current = funds;
        return () => clearTimeout(timer);
      }
    }, [funds]);

    const handleFindJob = () => {
        onShowModal({
            title: "新規案件を探す",
            content: <ProjectListModalContent gameState={gameState} onShowModal={onShowModal} />,
            showCloseButton: true,
        });
    };

    const handleRecruit = () => {
        onShowModal({
            title: "従業員を募集する",
            content: <RecruitmentModalContent gameState={gameState} onShowModal={onShowModal} />,
            showCloseButton: true,
        });
    };

    const handleTraining = () => {
        onShowModal({
            title: "従業員研修",
            content: <TrainingModalContent gameState={gameState} onShowModal={onShowModal} />,
            showCloseButton: true,
        });
    };

    const handleInvestEquipment = () => {
        onShowModal({
            title: "設備投資",
            content: <EquipmentModalContent gameState={gameState} onShowModal={onShowModal} />,
            showCloseButton: true
        });
    };
    
    const handleOpenGhostShopInternal = () => {
         onShowModal({
            title: "幻の建材店",
            content: <GhostEquipmentModalContent gameState={gameState} onShowModal={onShowModal} />,
            showCloseButton: true
        });
        onOpenGhostShop(); 
    };

    const handleChangeWelfare = () => {
        onShowModal({
            title: "待遇の変更",
            content: <WelfareModalContent gameState={gameState} onShowModal={onShowModal} />, // onShowModal not really used by Welfare, but good for consistency
            showCloseButton: true
        });
    };

    const handleUpgradeOffice = () => {
        onShowModal({
            title: "事務所を拡張・移転する",
            content: <OfficeUpgradeModalContent gameState={gameState} onShowModal={onShowModal} />,
            showCloseButton: true,
        });
    };
    
    const handleAddStaff = (project: OngoingProject) => {
        onShowModal({
            title: `人員追加: ${project.project_data.name}`,
            content: <AddStaffModalContent gameState={gameState} ongoingProject={project} />,
            buttons: [
                { text: "戻る", className: "bg-gray-500 hover:bg-gray-600", action: () => {} }
            ],
        });
    };

    return (
        <div className="space-y-4">
             {isAdvancingTime && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center">
                    <div className="text-white text-2xl font-mochiy animate-pulse">週をまたいでいます...</div>
                </div>
            )}

            <header className="text-center mb-4">
                <h1 className="text-3xl font-bold font-mochiy text-blue-500" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                    がんばる工務店
                </h1>
                <h2 className="text-xl font-bold font-mochiy text-gray-700 -mt-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                    奮闘記
                </h2>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoPanel title="会社情報">
                    <p><strong>会社名:</strong> {company_name}</p>
                    <p><strong>社長:</strong> {president_name}</p>
                    <p><strong>年月週:</strong> {current_year}年 {current_month}月 第{current_week}週</p>
                    <p><strong>事務所:</strong> {office.name} (家賃: {formatFunds(office.rent_monthly)}/月)</p>
                    <p><strong>従業員数:</strong> {employees.length} / {office.employee_capacity}名</p>
                </InfoPanel>
                <InfoPanel title="経営状況">
                    <p><strong>資金:</strong> <span className={`font-bold text-2xl lg:text-3xl text-orange-400 rounded-md px-2 transition-all duration-300 ${highlightClass}`}>{formatFunds(funds)}</span></p>
                    <p><strong>評判:</strong> <span className="text-yellow-400 font-semibold">{getReputationStars(reputation)}</span> ({reputation.toFixed(1)}/5)</p>
                    <p><strong>待遇:</strong> 賞与: {welfare.bonus_rate.toFixed(1)}ヶ月 / 年間休日: {welfare.annual_holidays}日</p>
                </InfoPanel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <InfoPanel title={`従業員 (${employees.length}名)`} className="max-h-80 overflow-y-auto">
                    {employees.length > 0 ? employees.map(emp => (
                        <div 
                            key={emp.id} 
                            onClick={() => onShowEmployeeDetails(emp)}
                            className={`p-2.5 rounded-md text-sm mb-2 border cursor-pointer hover:shadow-md transition-shadow ${emp.is_on_leave ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : emp.is_busy ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}
                            role="button"
                            tabIndex={0}
                            aria-label={`従業員 ${emp.name} の詳細を表示`}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onShowEmployeeDetails(emp); }}
                        >
                            <div className="font-bold">{emp.name} ({emp.role})</div>
                            <div className={emp.is_on_leave ? 'text-red-600' : emp.is_busy ? 'text-yellow-600' : 'text-green-600'}>スキル: {emp.skill_point} | 体力: {emp.stamina}/{emp.max_stamina} | やる気: {emp.motivation}/{emp.max_motivation}</div>
                            <div className={`text-xs mt-0.5 ${emp.is_on_leave ? 'text-red-500' : emp.is_busy ? 'text-yellow-500' : 'text-green-500'}`}>{emp.is_on_leave ? `休職中 (あと${emp.leave_duration_weeks}週)` : emp.is_busy ? `仕事中 (${emp.assigned_project_id === 'training' ? '研修中' : `P-${emp.assigned_project_id?.slice(-7)}`})` : "待機中"}</div>
                        </div>
                    )) : (
                        <div className="text-center p-4">
                            <p className="text-gray-500 mb-4">現在、従業員はいません。</p>
                            <button 
                                onClick={handleRecruit} 
                                disabled={employees.length >= office.employee_capacity}
                                className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-4 py-2 border border-dashed border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                <UserPlusIcon className="h-5 w-5" />
                                <span>従業員を募集する</span>
                            </button>
                        </div>
                    )}
                </InfoPanel>
                <InfoPanel title={`進行中プロジェクト (${ongoing_projects.length}件)`} className="max-h-80 overflow-y-auto">
                    {ongoing_projects.length > 0 ? ongoing_projects.map(op => (
                        <div key={op.id} className="bg-indigo-50 p-2.5 rounded-md mb-2 border border-indigo-200">
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <strong className="text-indigo-800">{op.project_data.name} (P-{op.id.slice(-7)})</strong>
                                </div>
                                <button onClick={() => handleAddStaff(op)} disabled={employees.filter(e=>!e.is_busy && !e.is_on_leave).length === 0} className="ml-2 flex-shrink-0 text-xs text-white bg-sky-500 hover:bg-sky-700 py-1 px-2 rounded shadow hover:shadow-lg transition-all disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    <UserGroupIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1.5">
                                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${Math.max(0, (op.project_data.total_workload - op.remaining_workload) / op.project_data.total_workload) * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-indigo-700 mt-1">残り作業量: {op.remaining_workload.toFixed(1)}人週 / 担当: {op.assigned_employee_ids.map(id => gameState.employees.find(e=>e.id===id)?.name.split(' ')[0] || 'N/A').join(', ') || <span className="text-red-500">担当者不在</span>}</p>
                        </div>
                    )) : (
                         <div className="text-center p-4">
                            <p className="text-gray-500 mb-4">進行中のプロジェクトはありません。</p>
                            <button 
                                onClick={handleFindJob} 
                                className="flex items-center justify-center gap-2 w-full max-w-xs mx-auto px-4 py-2 border border-dashed border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-colors"
                            >
                                <BriefcaseIcon className="h-5 w-5" />
                                <span>仕事を探す</span>
                            </button>
                        </div>
                    )}
                </InfoPanel>
            </div>

            <InfoPanel title="アクション">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <ActionButton onClick={handleFindJob} className="bg-green-500 hover:bg-green-600">
                        <BriefcaseIcon className="h-5 w-5" />
                        <span>仕事を探す</span>
                    </ActionButton>
                    <ActionButton
                        onClick={handleRecruit}
                        disabled={employees.length >= office.employee_capacity}
                        title={employees.length >= office.employee_capacity ? `事務所が満員です (${employees.length}/${office.employee_capacity}名)`: "新しい従業員を募集します"}
                        className={employees.length >= office.employee_capacity ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        <span>従業員を募集</span>
                    </ActionButton>
                    <ActionButton onClick={handleTraining} className="bg-orange-400 hover:bg-orange-500">
                        <AcademicCapIcon className="h-5 w-5" />
                        <span>従業員を研修</span>
                    </ActionButton>
                    <ActionButton onClick={handleInvestEquipment} className="bg-yellow-500 hover:bg-yellow-600">
                        <WrenchScrewdriverIcon className="h-5 w-5" />
                        <span>設備投資</span>
                    </ActionButton>
                    <ActionButton onClick={handleChangeWelfare} className="bg-pink-500 hover:bg-pink-600">
                        <HeartIcon className="h-5 w-5" />
                        <span>待遇の変更</span>
                    </ActionButton>
                    <ActionButton onClick={handleUpgradeOffice} className="bg-teal-500 hover:bg-teal-600">
                        <BuildingOfficeIcon className="h-5 w-5" />
                        <span>事務所を拡張</span>
                    </ActionButton>
                     {showGhostShop && <ActionButton onClick={handleOpenGhostShopInternal} className="bg-purple-600 hover:bg-purple-800 animate-pulse">幻の建材店</ActionButton>}
                    <ActionButton onClick={onSaveRequest} className="bg-indigo-500 hover:bg-indigo-600">
                        <SaveIcon className="h-5 w-5" />
                        <span>セーブ</span>
                    </ActionButton>
                </div>
            </InfoPanel>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <ActionButton onClick={() => onAdvanceTime(1)} className="bg-sky-500 hover:bg-sky-600">1週間進める</ActionButton>
                <ActionButton onClick={() => onAdvanceTime(WEEKS_IN_MONTH - gameState.current_week + 1)} className="bg-rose-500 hover:bg-rose-600">次の月まで進める</ActionButton>
            </div>

            <InfoPanel title="イベント履歴" className="max-h-60 overflow-y-auto">
                 {event_history.length > 0 ? event_history.map((event, index) => <p key={index} className={`py-1 text-sm border-b border-gray-100 last:border-b-0 text-gray-600`}>{event}</p>) : <p className="text-gray-400">まだ何も起きていません...</p>}
            </InfoPanel>
        </div>
    );
};

export default MainGameScreen;
