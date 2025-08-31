

import * as React from 'react';
import { 
    GameState, ModalConfig, DifficultyLevel, Employee, OngoingProject, SaveSlot,
    AcceptProjectEventDetail, RecruitEmployeesEventDetail, TrainEmployeesEventDetail, 
    BuyEquipmentEventDetail, UpdateWelfareEventDetail, UpgradeOfficeEventDetail, EmployeeCandidateBase,
    AddStaffEventDetail, SaveGameEventDetail
} from './types';
import { 
    BASE_SAVE_KEY, WEEKS_IN_MONTH, MONTHS_IN_YEAR, BASE_VALUES, DIFFICULTY_SETTINGS, INITIAL_OFFICES_BY_DIFFICULTY, 
    RECRUIT_CANDIDATES, FIRST_NAMES,
    POWERED_SUIT_NAME,
    AUTOMATED_CONSTRUCTION_MACHINE_NAME, GAME_CLEAR_FUNDS,
    GHOST_SHOP_APPEARANCE_CHANCE_NORMAL, GHOST_SHOP_APPEARANCE_CHANCE_POST_CLEAR,
    ALL_IMAGE_ASSETS, MAX_SAVE_SLOTS
} from './constants';
import { formatFunds } from './utils';
import { loadSaveSlots, saveGameToSlot, deleteSaveSlot, getSaveSlotKey } from './utils/save';
import { 
    initAudioSystem, playButtonClickSound, playReportSound, 
    playBgm, stopBgm, setVolume as setAudioVolume,
    playRecruitSuccessSound, playRecruitFailSound
} from './utils/audio';

import SetupScreen from './components/SetupScreen';
import MainGameScreen from './components/MainGameScreen';
import GameOverScreen from './components/GameOverScreen';
import Modal from './components/Modal';
import TitleScreen from './components/TitleScreen';
import LoadingScreen from './components/LoadingScreen';
import VolumeControl from './components/BgmControl';
import SaveGameModalContent from './components/SaveGameModalContent';

interface CompletedProjectInfo {
    name: string;
    reward: number;
    reputationChange: number;
    success: boolean;
}

interface SkillGainInfo {
    employeeName: string;
    skillGainAmount: number;
    newSkillLevel: number;
}

const App = () => {
    const [gameState, setGameState] = React.useState<GameState | null>(null);
    const [currentScreen, setCurrentScreen] = React.useState<'title' | 'setup' | 'main' | 'gameOver'>('title');
    const [gameOverReason, setGameOverReason] = React.useState<string>('');
    const [saveSlots, setSaveSlots] = React.useState<SaveSlot[]>([]);
    const [modalConfig, setModalConfig] = React.useState<ModalConfig>({ isOpen: false, title: '', content: '' });
    const [showGhostShop, setShowGhostShop] = React.useState<boolean>(false);
    const [hasShownGameClearModal, setHasShownGameClearModal] = React.useState(false);
    const [isAdvancingTime, setIsAdvancingTime] = React.useState(false);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [loadingProgress, setLoadingProgress] = React.useState(0);
    const [volume, setVolume] = React.useState(0.5);
    const audioInitialized = React.useRef(false);
    const gameStateRef = React.useRef<GameState | null>(gameState);
    React.useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);


    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
    };

    const closeModal = React.useCallback(() => setModalConfig(prev => ({ ...prev, isOpen: false })), []);

    const showModal = React.useCallback((config: Omit<ModalConfig, 'isOpen'>) => {
        setModalConfig({
            ...config,
            isOpen: true,
            onClose: config.onClose ?? closeModal,
        });
    }, [closeModal]);

    const showTutorialIfNeeded = React.useCallback(() => {
        const gs = gameStateRef.current;
        if (!gs) return;
    
        const tutorialShown = localStorage.getItem('ganbaru-koumuten-tutorial-shown-v1');
        if (!tutorialShown) {
            const tutorialContent = (
                <div className="text-left space-y-3">
                    <p>ようこそ、{gs.president_name}社長！このゲームの目的と基本的な流れを説明します。</p>
                    <div>
                        <h4 className="font-bold text-blue-600">🎯 ゲームの目的</h4>
                        <p>会社の総資金を<strong className="text-orange-500">1億円</strong>にすることです！達成後も経営を続けることができます。</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-600">📜 基本的な流れ</h4>
                        <ol className="list-decimal list-inside space-y-1 pl-2">
                            <li><strong>「仕事を探す」</strong>で案件を受注します。</li>
                            <li>従業員をアサインしてプロジェクトを開始します。</li>
                            <li><strong>「週を進める」</strong>で時間を進め、プロジェクトを完了させて報酬を得ます。</li>
                            <li>利益で<strong>「従業員募集」「設備投資」「待遇改善」</strong>などを行い、会社を成長させましょう。</li>
                        </ol>
                    </div>
                    <div>
                        <h4 className="font-bold text-red-600">⚠️ ゲームオーバー条件</h4>
                        <p>資金が大幅なマイナスになるか、従業員が誰もいなくなり再起不能になると倒産（ゲームオーバー）です。</p>
                        <p>従業員の<strong className="text-red-500">体力</strong>と<strong className="text-yellow-500">やる気</strong>の管理が重要です！</p>
                    </div>
                    <p className="mt-4 font-semibold">それでは、がんばる工務店の経営、頑張ってください！</p>
                </div>
            );
            showModal({
                title: "ようこそ！ゲームの進め方ガイド",
                content: tutorialContent,
                showCloseButton: true,
                onClose: () => {
                    localStorage.setItem('ganbaru-koumuten-tutorial-shown-v1', 'true');
                    closeModal();
                }
            });
        }
    }, [showModal, closeModal]);

    const updateGameState = React.useCallback((updater: (prevState: GameState | null) => GameState | null) => {
        setGameState(updater);
    }, []);
    
    const addHistory = React.useCallback((message: string, isMajor: boolean = false) => {
        updateGameState(prev => {
            if (!prev) return null;
            const newHistory = [`${prev.current_year}年${prev.current_month}月第${prev.current_week}週: ${message}`, ...prev.event_history];
            if (newHistory.length > 100) newHistory.splice(100);

            if (isMajor) {
                if (!(prev.is_goal_achieved && hasShownGameClearModal)) {
                    setTimeout(() => showModal({ title: "重要イベント", content: message, showCloseButton: true }), 50);
                }
            }
            return { ...prev, event_history: newHistory };
        });
    }, [updateGameState, showModal, hasShownGameClearModal]);


    const initializeGame = React.useCallback((companyName: string, presidentName: string, difficultyKey: DifficultyLevel) => {
        localStorage.removeItem('ganbaru-koumuten-tutorial-shown-v1');
        
        const difficulty = DIFFICULTY_SETTINGS[difficultyKey];
        const initialFunds = 10000000 * difficulty.balance.initial_funds_multiplier;
        const initialOffice = INITIAL_OFFICES_BY_DIFFICULTY[difficultyKey];

        const newGameStateBase: GameState = {
            company_name: companyName,
            president_name: presidentName,
            selected_difficulty_key: difficultyKey,
            current_year: BASE_VALUES.INITIAL_YEAR,
            current_month: BASE_VALUES.INITIAL_MONTH,
            current_week: BASE_VALUES.INITIAL_WEEK,
            total_weeks_elapsed: 0,
            funds: initialFunds,
            reputation: 1,
            employees: [],
            office: initialOffice,
            equipment: [],
            welfare: { bonus_rate: 1.0, annual_holidays: 105 },
            ongoing_projects: [],
            event_history: [],
            is_goal_achieved: false,
            next_employee_id: 1,
            game_balance: difficulty.balance,
        };

        const startupMessage = `${newGameStateBase.current_year}年${newGameStateBase.current_month}月第${newGameStateBase.current_week}週: 「${companyName}」設立！ ${presidentName}社長、経営手腕が試されます！`;
        const finalGameState = {...newGameStateBase, event_history: [startupMessage]};

        setGameState(finalGameState);
        setCurrentScreen('main');
        setShowGhostShop(false);
        setHasShownGameClearModal(false);
        showModal({
            title: "会社設立！",
            content: `「${companyName}」設立！ ${presidentName}社長、経営手腕が試されます！\n事務所: ${initialOffice.name}\n最大従業員数: ${initialOffice.employee_capacity}名`,
            showCloseButton: true,
            onClose: () => {
                closeModal();
                setTimeout(showTutorialIfNeeded, 100);
            }
        });

    }, [showModal, closeModal, showTutorialIfNeeded]);

    const advanceTime = React.useCallback((weeks: number) => {
        const resultsForThisAdvanceCall = {
            completed: [] as CompletedProjectInfo[],
            skills: [] as SkillGainInfo[],
        };
        let newGameOverReason = '';
        let newCurrentScreen = currentScreen;
    
        const calculateNewState = (currentState: GameState | null): GameState | null => {
            if (!currentState) return null;
    
            let workingState: GameState = JSON.parse(JSON.stringify(currentState));
    
            for (let i = 0; i < weeks; i++) {
                const completedProjectsThisTick: CompletedProjectInfo[] = [];
                const skillGainsThisTick: SkillGainInfo[] = [];
    
                workingState.total_weeks_elapsed++;
                workingState.current_week++;
                let isNewMonth = false;
                if (workingState.current_week > WEEKS_IN_MONTH) {
                    workingState.current_week = 1;
                    workingState.current_month++;
                    isNewMonth = true;
                    if (workingState.current_month > MONTHS_IN_YEAR) {
                        workingState.current_month = 1;
                        workingState.current_year++;
                    }
                }
    
                const logThisTick = (msg: string) => {
                    const newHistoryEntry = `${workingState.current_year}年${workingState.current_month}月第${workingState.current_week}週: ${msg}`;
                    workingState.event_history.unshift(newHistoryEntry);
                    if (workingState.event_history.length > 100) workingState.event_history.splice(100);
                };
    
                let tempOngoingProjects: OngoingProject[] = [];
                const holidayModifier = 1 + (105 - workingState.welfare.annual_holidays) / 50;
                const hasPoweredSuit = workingState.equipment.includes(POWERED_SUIT_NAME);
    
                for (const op of workingState.ongoing_projects) {
                    let currentOp = {...op};
                    if (currentOp.assigned_employee_ids.length === 0 && currentOp.remaining_workload > 0) {
                        if(currentOp.weeks_passed % 4 === 0) {
                           logThisTick(`プロジェクト「${currentOp.project_data.name}」は担当者不在のため進捗がありません。`);
                        }
                        currentOp = {...currentOp, weeks_passed: (currentOp.weeks_passed || 0) + 1};
                        tempOngoingProjects.push(currentOp);
                        continue;
                    }

                    const workPowerFactor = hasPoweredSuit ? 2 : 1;
                    const workDone = currentOp.assigned_employee_ids.length * holidayModifier * workPowerFactor;
                    currentOp.remaining_workload -= workDone;
                    currentOp.weeks_passed = (currentOp.weeks_passed || 0) + 1;

                    if (currentOp.remaining_workload <= 0) {
                        const team = workingState.employees.filter(e => currentOp.assigned_employee_ids.includes(e.id));
                        if (team.length === 0 && currentOp.project_data.total_workload > 0) {
                            const failureMessage = `❌ プロジェクト「${currentOp.project_data.name}」は完了直前に担当者がいなくなり、失敗となりました。`;
                            logThisTick(failureMessage);
                            const reputationLoss = Math.min(1.5, currentOp.project_data.reputation_gain);
                            const floor = workingState.reputation >= 1 ? 1 : 0;
                            workingState.reputation = Math.max(floor, workingState.reputation - reputationLoss);
                            completedProjectsThisTick.push({
                               name: currentOp.project_data.name, reward: 0, reputationChange: -reputationLoss, success: false,
                            });
                            continue; 
                        }
                        const avgMotivation = team.reduce((s, e) => s + e.motivation, 0) / team.length || 0;
                        const avgSkill = team.reduce((s, e) => s + e.skill_point, 0) / team.length || 0;
                        let successChance = 50 + (avgMotivation - 50) + (avgSkill - currentOp.project_data.required_skill) * 2 + workingState.game_balance.project_success_rate_modifier;
                        successChance = Math.max(5, Math.min(98, successChance));

                        if (Math.random() * 100 < successChance) {
                            workingState.funds += currentOp.project_data.reward;
                            const reputationGain = currentOp.project_data.reputation_gain;
                            workingState.reputation = Math.min(5, workingState.reputation + reputationGain);
                            logThisTick(`🎉 プロジェクト「${currentOp.project_data.name}」成功！報酬 ${formatFunds(currentOp.project_data.reward)}獲得。評判が${reputationGain.toFixed(1)}上昇！`);
                            completedProjectsThisTick.push({
                                name: currentOp.project_data.name, reward: currentOp.project_data.reward, reputationChange: reputationGain, success: true,
                            });
                        } else {
                            const reputationLoss = Math.min(1.0, currentOp.project_data.reputation_gain * 0.5);
                            const floor = workingState.reputation >= 1 ? 1 : 0;
                            workingState.reputation = Math.max(floor, workingState.reputation - reputationLoss);
                            logThisTick(`❌ プロジェクト「${currentOp.project_data.name}」失敗…。報酬は得られず、評判が${reputationLoss.toFixed(1)}低下。`);
                            completedProjectsThisTick.push({
                                name: currentOp.project_data.name, reward: 0, reputationChange: -reputationLoss, success: false,
                            });
                        }

                        team.forEach(empInTeam => {
                            const employeeInArray = workingState.employees.find(e => e.id === empInTeam.id);
                            if (employeeInArray) {
                                employeeInArray.is_busy = false;
                                employeeInArray.assigned_project_id = null;
                                const skillGainAmount = Math.ceil(currentOp.project_data.required_skill / 10) + 1; // Skill gain
                                employeeInArray.skill_point = Math.min(100, employeeInArray.skill_point + skillGainAmount);
                                logThisTick(`${employeeInArray.name}のスキルが${skillGainAmount}上がった！(現スキル: ${employeeInArray.skill_point})`);
                                skillGainsThisTick.push({
                                    employeeName: employeeInArray.name, skillGainAmount: skillGainAmount, newSkillLevel: employeeInArray.skill_point
                                });
                            }
                        });
                    } else {
                        tempOngoingProjects.push(currentOp);
                    }
                }
                workingState.ongoing_projects = tempOngoingProjects;
    
                const paramRates = workingState.game_balance.employee_parameter_change_rate;
                const hasAutomatedMachine = workingState.equipment.includes(AUTOMATED_CONSTRUCTION_MACHINE_NAME);
                const staminaLossMultiplier = hasAutomatedMachine ? 0.5 : 1.0;
                const motivationLossMultiplier = hasAutomatedMachine ? 0.5 : 1.0;
                let employeesAfterProcessing: Employee[] = [];

                for (const emp of workingState.employees) {
                    let currentEmp = {...emp};
                    let employeeLogMessage = '';

                    if (currentEmp.assigned_project_id === 'training') {
                        currentEmp.is_busy = false;
                        currentEmp.assigned_project_id = null;
                        employeeLogMessage = `${currentEmp.name}の研修が完了した。`;
                    }

                    if (currentEmp.is_on_leave) {
                        currentEmp.leave_duration_weeks--;
                        if (currentEmp.leave_duration_weeks <= 0) {
                            currentEmp.is_on_leave = false;
                            currentEmp.stamina = Math.floor(currentEmp.max_stamina / 2);
                            currentEmp.motivation = Math.floor(currentEmp.max_motivation / 2);
                            employeeLogMessage = `${currentEmp.name}が休職から復帰した。`;
                        }
                    } else if (currentEmp.is_busy && currentEmp.assigned_project_id !== 'training') {
                        currentEmp.stamina = Math.max(0, currentEmp.stamina - Math.round(10 * holidayModifier * paramRates.stamina_loss_rate * staminaLossMultiplier));
                        currentEmp.motivation = Math.max(0, currentEmp.motivation - Math.round(6 * holidayModifier * paramRates.motivation_loss_rate * motivationLossMultiplier));
                    } else if (!currentEmp.is_busy) { // Not busy and not on leave
                        currentEmp.stamina = Math.min(currentEmp.max_stamina, currentEmp.stamina + Math.round(10 * paramRates.stamina_gain_rate));
                        currentEmp.motivation = Math.min(currentEmp.max_motivation, currentEmp.motivation + Math.round(5 * paramRates.motivation_gain_rate));
                    }

                    if (employeeLogMessage) logThisTick(employeeLogMessage);

                    if (!currentEmp.is_on_leave && currentEmp.stamina <= 0) {
                        currentEmp.is_on_leave = true;
                        currentEmp.leave_duration_weeks = Math.floor(Math.random() * 4) + 12;
                        currentEmp.is_busy = false;
                        const projectIdBeforeLeave = currentEmp.assigned_project_id;
                        currentEmp.assigned_project_id = null;
                        
                        workingState.ongoing_projects = workingState.ongoing_projects.map(op => {
                            if (op.id === projectIdBeforeLeave && op.assigned_employee_ids.includes(currentEmp.id)){
                                return {...op, assigned_employee_ids: op.assigned_employee_ids.filter(id => id !== currentEmp.id)}
                            }
                            return op;
                        });
                        const originalProjectName = currentState.ongoing_projects.find(p=>p.id===projectIdBeforeLeave)?.project_data.name || '';
                        const majorEventMsg = `⚠️ ${currentEmp.name}は体力の限界で倒れ、${currentEmp.leave_duration_weeks}週間の休職に入った... ${originalProjectName ? `プロジェクト「${originalProjectName}」から離脱。` : ''}`;
                        logThisTick(majorEventMsg);
                        if (!(workingState.is_goal_achieved && hasShownGameClearModal)) {
                           setTimeout(() => showModal({ title: "重要イベント", content: majorEventMsg, showCloseButton: true }), 0);
                        }
                        employeesAfterProcessing.push(currentEmp);
                    } else if (!currentEmp.is_on_leave && currentEmp.motivation <= 0 && Math.random() < 0.1) {
                         const projectIdBeforeQuitting = currentEmp.assigned_project_id;
                         const originalProjectName = currentState.ongoing_projects.find(p=>p.id===projectIdBeforeQuitting)?.project_data.name || '';
                         const quitMsg = `🚨 ${currentEmp.name}はモチベーションの低下により退職してしまった... ${originalProjectName ? `プロジェクト「${originalProjectName}」から離脱。` : ''}`;
                         logThisTick(quitMsg);
                         if (!(workingState.is_goal_achieved && hasShownGameClearModal)) {
                            setTimeout(() => showModal({ title: "重要イベント", content: quitMsg, showCloseButton: true }), 0);
                         }
                         workingState.ongoing_projects = workingState.ongoing_projects.map(op => {
                             if (op.id === projectIdBeforeQuitting && op.assigned_employee_ids.includes(currentEmp.id)){
                                  return {...op, assigned_employee_ids: op.assigned_employee_ids.filter(id => id !== currentEmp.id)}
                             }
                             return op;
                         });
                    } else {
                        employeesAfterProcessing.push(currentEmp);
                    }
                }
                workingState.employees = employeesAfterProcessing;

                if (isNewMonth) {
                    const totalSalaries = workingState.employees.reduce((sum, e) => sum + e.salary_monthly, 0);
                    workingState.funds -= totalSalaries;
                    logThisTick(`給与支払い: ${formatFunds(totalSalaries)}`);

                    workingState.funds -= workingState.office.rent_monthly;
                    logThisTick(`家賃支払い: ${formatFunds(workingState.office.rent_monthly)} (${workingState.office.name})`);

                    if (workingState.current_month === 6 || workingState.current_month === 12) {
                        const totalBonus = workingState.employees.reduce((sum, e) => sum + e.salary_monthly * workingState.welfare.bonus_rate, 0);
                        if (totalBonus > 0) {
                            workingState.funds -= totalBonus;
                            workingState.employees.forEach(e => e.motivation = Math.min(e.max_motivation, e.motivation + Math.round(20 * workingState.welfare.bonus_rate) + 30 ));
                            const bonusMsg = `💰 賞与支払い: ${formatFunds(totalBonus)}。従業員のやる気が大幅にアップ！`;
                            logThisTick(bonusMsg);
                            if (!(workingState.is_goal_achieved && hasShownGameClearModal)) {
                               setTimeout(() => showModal({ title: "賞与イベント", content: bonusMsg, showCloseButton: true }), 0);
                            }
                        } else {
                            logThisTick("賞与の支払いなし (賞与率0または対象者なし)");
                        }
                    }
                }
                
                const shopChance = workingState.is_goal_achieved ? GHOST_SHOP_APPEARANCE_CHANCE_POST_CLEAR : GHOST_SHOP_APPEARANCE_CHANCE_NORMAL;
                if (Math.random() < shopChance && !showGhostShop) {
                    setShowGhostShop(true);
                    const ghostShopMsg = "なにやら街の外れに「幻の建材店」が現れたとの噂が…";
                    logThisTick(ghostShopMsg);
                    if (!(workingState.is_goal_achieved && hasShownGameClearModal)) {
                       setTimeout(() => showModal({ title: "特別なお店", content: ghostShopMsg, showCloseButton: true }), 0);
                    }
                }

                if (workingState.funds >= GAME_CLEAR_FUNDS && !workingState.is_goal_achieved) {
                    workingState.is_goal_achieved = true;
                }
                
                resultsForThisAdvanceCall.completed.push(...completedProjectsThisTick);
                resultsForThisAdvanceCall.skills.push(...skillGainsThisTick);

                if (workingState.funds < -3000000 * (workingState.game_balance.initial_funds_multiplier > 1 ? workingState.game_balance.initial_funds_multiplier : 1) ) {
                    newGameOverReason = "資金が底をつき、会社は倒産しました...";
                    newCurrentScreen = 'gameOver';
                    return workingState;
                }
                if (workingState.employees.length === 0 && workingState.funds < 50000 && workingState.total_weeks_elapsed > 10) {
                    newGameOverReason = "従業員がおらず、資金も尽きかけて再起不能となりました...";
                    newCurrentScreen = 'gameOver';
                    return workingState;
                }
            }
            return workingState;
        };
    
        const finalCalculatedState = calculateNewState(gameState);
    
        if (newGameOverReason) {
            setGameOverReason(newGameOverReason);
        }
        if (newCurrentScreen !== currentScreen) {
            setCurrentScreen(newCurrentScreen);
            if (newCurrentScreen === 'gameOver' && finalCalculatedState) {
                setGameState(finalCalculatedState);
            }
        } else if (finalCalculatedState) {
            setGameState(finalCalculatedState);
        }
    
        if (!newGameOverReason && (resultsForThisAdvanceCall.completed.length > 0 || resultsForThisAdvanceCall.skills.length > 0)) {
            setTimeout(() => {
                const latestGs = gameStateRef.current;
                if (!latestGs) return;

                const isGameClearPending = latestGs.is_goal_achieved && !hasShownGameClearModal;
                if (isGameClearPending) {
                    return;
                }

                const modalContentNode = (
                    <div className="space-y-4 text-left text-sm">
                        {resultsForThisAdvanceCall.completed.length > 0 && (
                            <div>
                                <h3 className="font-bold text-base mb-2">完了したプロジェクト:</h3>
                                <div className="space-y-3">
                                    {resultsForThisAdvanceCall.completed.map((p, i) => (
                                        <div key={`proj-${i}`} className="p-2 bg-gray-50 rounded-md border">
                                            <p className="font-semibold">{`「${p.name}」: ${p.success ? '成功🎉' : '失敗❌'}`}</p>
                                            {p.success && <p className="text-green-600">{`  報酬: +${formatFunds(p.reward)}`}</p>}
                                            <p className={p.reputationChange >= 0 ? 'text-blue-500' : 'text-red-500'}>
                                                {`  評判変動: ${p.reputationChange >= 0 ? '+' : ''}${p.reputationChange.toFixed(1)}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {resultsForThisAdvanceCall.skills.length > 0 && (
                            <div>
                                <h3 className="font-bold text-base mb-2 mt-4">スキルアップした従業員:</h3>
                                <div className="space-y-1">
                                    {resultsForThisAdvanceCall.skills.map((sg, i) => (
                                        <p key={`skill-${i}`}>
                                            {sg.employeeName}: スキル
                                            <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mx-1 px-2 py-0.5 rounded-full">
                                                +{sg.skillGainAmount}
                                            </span>
                                            → 新スキル {sg.newSkillLevel}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

                const reportTitle = `業務報告 (${latestGs.current_year}年${latestGs.current_month}月第${latestGs.current_week}週})`;
                
                playReportSound();
                showModal({
                    title: reportTitle,
                    content: modalContentNode,
                    showCloseButton: true,
                });
            }, 50);
        }
    }, [gameState, currentScreen, showModal, hasShownGameClearModal, showGhostShop]);

    const handleAdvanceTime = React.useCallback((weeks: number) => {
        setIsAdvancingTime(true);
        setTimeout(() => {
            advanceTime(weeks);
            setIsAdvancingTime(false);
        }, 100);
    }, [advanceTime]);

    const handleSaveRequest = React.useCallback(() => {
        const currentSaveSlots = loadSaveSlots();
        showModal({
            title: "ゲームをセーブする",
            content: <SaveGameModalContent saveSlots={currentSaveSlots} onShowModal={showModal} />,
            showCloseButton: true,
        });
    }, [showModal]);
    
    const handleLoadGame = React.useCallback((slotIndex: number) => {
        const key = getSaveSlotKey(slotIndex);
        const savedData = localStorage.getItem(key);
        if (savedData) {
            try {
                const loadedState = JSON.parse(savedData) as GameState;
                if (!loadedState.company_name || !loadedState.game_balance) { 
                    throw new Error("セーブデータが壊れています。");
                }
                setGameState(loadedState);
                setCurrentScreen('main');
                setShowGhostShop(false); 
                setHasShownGameClearModal(loadedState.is_goal_achieved);
                
                const loadMessage = `${loadedState.current_year}年${loadedState.current_month}月第${loadedState.current_week}週: スロット${slotIndex + 1}からデータをロードしました。`;
                setGameState(ls => ls ? {...ls, event_history: [loadMessage, ...loadedState.event_history].slice(0, 100)} : null);

                showModal({
                    title: "ロード完了",
                    content: `スロット${slotIndex + 1}からゲームをロードしました。`,
                    showCloseButton: true,
                    onClose: () => {
                        closeModal();
                        setTimeout(showTutorialIfNeeded, 100);
                    }
                });
            } catch (error) {
                console.error("Failed to load game:", error);
                deleteSaveSlot(slotIndex); // Corrupted data, so remove it
                setSaveSlots(loadSaveSlots()); // Refresh slots
                showModal({ title: "ロード失敗", content: "セーブデータの読み込みに失敗しました。データを削除します。", showCloseButton: true });
            }
        }
    }, [showModal, closeModal, showTutorialIfNeeded]); 
    
    const handleDeleteGame = React.useCallback((slotIndex: number) => {
        showModal({
            title: "データ削除の確認",
            content: `本当にスロット${slotIndex + 1}のセーブデータを削除しますか？この操作は元に戻せません。`,
            buttons: [
                {
                    text: "はい、削除します",
                    className: "bg-red-600 hover:bg-red-700 text-white",
                    action: () => {
                        deleteSaveSlot(slotIndex);
                        setSaveSlots(loadSaveSlots()); // Refresh the state
                        showModal({title: "削除完了", content: `スロット${slotIndex + 1}のデータを削除しました。`, showCloseButton: true});
                    }
                },
                {
                    text: "キャンセル",
                    className: "bg-gray-500 hover:bg-gray-600 text-white",
                    action: () => {}
                }
            ]
        });
    }, [showModal]);

    const handleRestart = () => {
        // Only clearing one key is not enough anymore
        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
            localStorage.removeItem(getSaveSlotKey(i));
        }
        setGameState(null);
        setCurrentScreen('title');
        setGameOverReason('');
        setShowGhostShop(false);
        setHasShownGameClearModal(false);
        setSaveSlots(loadSaveSlots()); // Refresh to show empty slots
    };

    const getEmployeeStatusText = (employee: Employee): string => {
        if (employee.is_on_leave) return `休職中 (あと${employee.leave_duration_weeks}週)`;
        if (employee.assigned_project_id === 'training') return "研修中";
        if (employee.is_busy) {
            const projectId = employee.assigned_project_id;
            const displayProjectId = projectId ? `P-${projectId.slice(-7)}` : '不明なプロジェクト';
            return `仕事中 (${displayProjectId})`;
        }
        return "待機中";
    };

    const handleShowEmployeeDetails = React.useCallback((employee: Employee) => {
        const statusText = getEmployeeStatusText(employee);
        const descriptionContent = employee.description ? `${employee.description}` : "特にありません。";

        const content = (
            <div className="text-left space-y-2 text-sm">
                {employee.imagePath && (
                    <div className="mb-3 flex justify-center">
                        <img 
                            src={employee.imagePath} 
                            alt={`${employee.name}の画像`} 
                            className="w-32 h-32 object-cover rounded-lg shadow-md" 
                        />
                    </div>
                )}
                <p><strong>役割:</strong> {employee.role}</p>
                <p><strong>スキル:</strong> {employee.skill_point}</p>
                <p><strong>体力:</strong> {employee.stamina} / {employee.max_stamina}</p>
                <p><strong>やる気:</strong> {employee.motivation} / {employee.max_motivation}</p>
                <p><strong>状態:</strong> {statusText}</p>
                <p><strong>月給:</strong> {formatFunds(employee.salary_monthly)}</p>
                <div className="mt-3 pt-3 border-t">
                    <p className="font-semibold text-gray-700">紹介:</p>
                    <p className="text-gray-600 italic whitespace-pre-line">{descriptionContent}</p>
                </div>
            </div>
        );

        showModal({
            title: `${employee.name}さんの詳細`,
            content: content,
            showCloseButton: true,
        });
    }, [showModal]);

    React.useEffect(() => {
        const preloadAssets = async () => {
            const assets = ALL_IMAGE_ASSETS;
            const totalAssets = assets.length;
            if (totalAssets === 0) {
                setIsLoaded(true);
                return;
            }

            let loadedCount = 0;

            const updateProgress = () => {
                loadedCount++;
                const progress = (loadedCount / totalAssets) * 100;
                setLoadingProgress(progress);
            };

            assets.forEach(src => {
                const img = new Image();
                img.onload = updateProgress;
                img.onerror = updateProgress;
                img.src = src;
            });
        };

        preloadAssets();
    }, []);

    React.useEffect(() => {
        if (loadingProgress >= 100) {
            setTimeout(() => setIsLoaded(true), 500);
        }
    }, [loadingProgress]);

    React.useEffect(() => {
        const handleGlobalClick = (event: MouseEvent) => {
            if (!audioInitialized.current) {
                initAudioSystem();
                audioInitialized.current = true;
            }

            const target = event.target as HTMLElement;
            if (target.closest('button, [role="button"], a, input[type="radio"], input[type="checkbox"]')) {
                 if (target.closest('.no-sound')) return;
                 playButtonClickSound();
            }
        };
        document.addEventListener('click', handleGlobalClick);
        return () => {
            document.removeEventListener('click', handleGlobalClick);
        };
    }, []);

    React.useEffect(() => {
        if (currentScreen === 'main') {
            playBgm();
        } else {
            stopBgm();
        }
        return () => {
            stopBgm();
        };
    }, [currentScreen]);

    React.useEffect(() => {
        setAudioVolume(volume);
    }, [volume]);


    React.useEffect(() => {
        const handleAcceptProjectEvent = (event: Event) => {
            const e = event as CustomEvent<AcceptProjectEventDetail>;
            const { project, selectedEmployeeIds } = e.detail;
            updateGameState(prev => {
                if (!prev) return prev;
                const newOngoingProject: OngoingProject = {
                    id: `P-${Date.now()}-${Math.random().toString(36).substring(2,7)}`,
                    project_data: project,
                    assigned_employee_ids: selectedEmployeeIds,
                    remaining_workload: project.total_workload,
                    start_week: prev.total_weeks_elapsed,
                    weeks_passed: 0,
                };
                const newEmployees = prev.employees.map(emp =>
                    selectedEmployeeIds.includes(emp.id) ? { ...emp, is_busy: true, assigned_project_id: newOngoingProject.id } : emp
                );
                const teamNames = selectedEmployeeIds.map(id => prev.employees.find(emp=>emp.id===id)?.name.split(' ')[0] || '不明').join(', ');
                
                const message = `案件「${project.name}」を受注！担当: ${teamNames || '未定'}`;
                const newHistory = [`${prev.current_year}年${prev.current_month}月第${prev.current_week}週: ${message}`, ...prev.event_history];
                if (newHistory.length > 100) newHistory.splice(100);

                showModal({ title:"案件受注", content: `案件「${project.name}」を受注しました。担当: ${teamNames || '未定'}`, showCloseButton: true});
                return { ...prev, ongoing_projects: [...prev.ongoing_projects, newOngoingProject], employees: newEmployees, event_history: newHistory };
            });
        };
        
        const handleRecruitEvent = (event: Event) => {
             const e = event as CustomEvent<RecruitEmployeesEventDetail>;
             const { isPaid } = e.detail;
             
             let recruitmentAttemptCost = isPaid ? BASE_VALUES.HIRE_COST_PAID : 0;

             updateGameState(prevGS => {
                   if (!prevGS) return null;
                   let newHistory = [...prevGS.event_history];
                   const logToHistory = (msg: string) => {
                       newHistory.unshift(`${prevGS.current_year}年${prevGS.current_month}月第${prevGS.current_week}週: ${msg}`);
                       if (newHistory.length > 100) newHistory.splice(100);
                   };

                   if (prevGS.employees.length >= prevGS.office.employee_capacity) {
                       showModal({ title: "募集不可", content: `現在の事務所(${prevGS.office.name})は満員(${prevGS.employees.length}/${prevGS.office.employee_capacity}名)のため、新しい従業員を募集できません。事務所の拡張を検討してください。`, showCloseButton: true });
                       return prevGS;
                   }

                   if (isPaid && prevGS.funds < recruitmentAttemptCost) {
                       logToHistory("有料募集の費用が足りません。");
                       showModal({title:"資金不足", content:"有料募集の費用が足りません。", showCloseButton: true});
                       return {...prevGS, event_history: newHistory};
                   }
                   
                   const fundsAfterFee = prevGS.funds - recruitmentAttemptCost;
                   let successChance = (isPaid ? 70 : 15) + prevGS.game_balance.recruitment_success_modifier + (prevGS.reputation * 2) + (prevGS.welfare.bonus_rate * 5) + (prevGS.welfare.annual_holidays - 105) / 2;
                   successChance = Math.max(5, Math.min(98, successChance));

                   let candidateProto: EmployeeCandidateBase | undefined;
                   let isSpecial = false;
                   let modalTitle = "新しい応募者";

                   if (Math.random() * 100 < successChance) {
                       if (isPaid && Math.random() < 0.05) { 
                            const availableSpecial = RECRUIT_CANDIDATES.special.filter(s => 
                                s.fullName && !prevGS.employees.some(emp => emp.name === s.fullName)
                            );
                            if (availableSpecial.length > 0) {
                                candidateProto = availableSpecial[Math.floor(Math.random() * availableSpecial.length)];
                                isSpecial = true;
                                modalTitle = "！！！伝説の職人現る！！！";
                            }
                       }
                       
                       if (!candidateProto) {
                            const sourceCandList = isPaid ? RECRUIT_CANDIDATES.paid : RECRUIT_CANDIDATES.free;
                            const availableCandList = sourceCandList.filter(c => {
                                if (c.fullName) {
                                    return !prevGS.employees.some(emp => emp.name === c.fullName);
                                }
                                return true;
                            });

                            if (availableCandList.length > 0) {
                                candidateProto = availableCandList[Math.floor(Math.random() * availableCandList.length)];
                            }
                       }
                       
                       if (candidateProto) {
                           let finalName;
                           if (candidateProto.fullName) {
                               finalName = candidateProto.fullName;
                           } else { 
                               let potentialName;
                               let attempts = 0;
                               do {
                                   potentialName = `${candidateProto.baseName} ${FIRST_NAMES[Math.floor(Math.random()*FIRST_NAMES.length)]}`;
                                   attempts++;
                                   if (attempts > 50) { 
                                       potentialName = `${potentialName} ${prevGS.next_employee_id}`; 
                                       break; 
                                   }
                               } while (prevGS.employees.some(emp => emp.name === potentialName));
                               finalName = potentialName;
                           }

                           const newEmployee: Employee = {
                               id: `emp-${prevGS.next_employee_id}`,
                               name: finalName,
                               role: candidateProto.role,
                               salary_monthly: candidateProto.salary_monthly,
                               skill_point: candidateProto.skill_point,
                               stamina: candidateProto.stamina,
                               motivation: candidateProto.motivation,
                               max_stamina: candidateProto.stamina,
                               max_motivation: candidateProto.motivation,
                               is_busy: false, assigned_project_id: null, is_on_leave: false, leave_duration_weeks: 0,
                               description: candidateProto.description,
                               imagePath: candidateProto.imagePath
                           };

                           const handleConfirmHire = () => {
                               updateGameState(gs => {
                                   if (!gs) return null;
                                   let currentHistory = [...gs.event_history];
                                   const logHireHistory = (msg: string) => {
                                       currentHistory.unshift(`${gs.current_year}年${gs.current_month}月第${gs.current_week}週: ${msg}`);
                                       if (currentHistory.length > 100) currentHistory.splice(100);
                                   };

                                   if (gs.employees.length >= gs.office.employee_capacity) {
                                       showModal({ title: "採用不可", content: `事務所が満員(${gs.employees.length}/${gs.office.employee_capacity}名)のため、${newEmployee.name}を採用できません。`, showCloseButton: true });
                                       return gs;
                                   }
                                   logHireHistory(`${newEmployee.name}を採用しました！ 給与: ${formatFunds(newEmployee.salary_monthly)}/月`);
                                   showModal({title:"採用成功", content:`${newEmployee.name}を採用しました！\n給与: ${formatFunds(newEmployee.salary_monthly)}/月`, showCloseButton: true});
                                   return {...gs, employees: [...gs.employees, newEmployee], next_employee_id: gs.next_employee_id+1, event_history: currentHistory };
                               });
                           };
                           
                           const displayName = newEmployee.name;
                           const descriptionText = newEmployee.description ? `\n\n${newEmployee.description}\n` : "\n\n特にアピールポイントはありません。\n";
                           
                           const modalContentNode = (
                               <div className="text-left">
                                   {newEmployee.imagePath && (
                                       <div className="mb-3 flex justify-center">
                                           <img 
                                               src={newEmployee.imagePath} 
                                               alt={`${displayName}の画像`} 
                                               className="w-32 h-32 object-cover rounded-lg shadow-md"
                                           />
                                       </div>
                                   )}
                                   <p>{displayName}({newEmployee.role}、月給:{formatFunds(newEmployee.salary_monthly)})が応募してきました。</p>
                                   <p className="whitespace-pre-line text-sm italic text-gray-600 my-2">{descriptionText.trim()}</p>
                                   <p>現在の事務所: {prevGS.employees.length}/{prevGS.office.employee_capacity}名</p>
                                   <p>採用しますか？</p>
                               </div>
                           );
                           
                           playRecruitSuccessSound();
                           showModal({
                               title: modalTitle,
                               content: modalContentNode,
                               buttons: [
                                   { text: "採用する", className:"bg-green-500 hover:bg-green-700 text-white", action: handleConfirmHire },
                                   { text: "見送る", className:"bg-red-500 hover:bg-red-700 text-white", action: () => {
                                       updateGameState(gs => {
                                           if(!gs) return null;
                                           let historyForRejection = [...gs.event_history];
                                           historyForRejection.unshift(`${gs.current_year}年${gs.current_month}月第${gs.current_week}週: ${newEmployee.name}の採用を見送りました。`);
                                           if(historyForRejection.length > 100) historyForRejection.splice(100);
                                           showModal({title:"採用見送り", content:`${newEmployee.name}の採用を見送りました。`, showCloseButton: true});
                                           return {...gs, event_history: historyForRejection};
                                       });
                                   }}
                               ]
                           });
                           return {...prevGS, funds: fundsAfterFee, event_history: newHistory}; 
                       } else {
                            const noSuitableApplicantMessage = `募集はありましたが、${isPaid ? '有料媒体でも' : ''}今回は条件に合う新たな応募者を見つけられませんでした。`;
                            showModal({ title: "募集結果", content: `${noSuitableApplicantMessage}${isPaid ? `\n\n費用 ${formatFunds(recruitmentAttemptCost)} は支払い済みです。` : ''}`, showCloseButton: true });
                            logToHistory(noSuitableApplicantMessage);
                            return { ...prevGS, funds: fundsAfterFee, event_history: newHistory };
                       }
                   } else {
                       playRecruitFailSound();
                       const noApplicantMessage = `残念ながら、${isPaid ? '有料媒体を使っても' : ''}今週は応募者が現れませんでした。`;
                       const feeMessage = isPaid ? `\n\n費用 ${formatFunds(recruitmentAttemptCost)} は支払い済みです。` : '';
                       showModal({
                           title: "募集結果",
                           content: `${noApplicantMessage}${feeMessage}`,
                           showCloseButton: true
                       });
                       logToHistory(noApplicantMessage);
                       return { ...prevGS, funds: fundsAfterFee, event_history: newHistory };
                   }
             });
        };

        const handleTrainEvent = (event: Event) => {
            const e = event as CustomEvent<TrainEmployeesEventDetail>;
            const { employeeIds, cost } = e.detail;
            updateGameState(prev => {
                if (!prev) return prev;
                let newHistory = [...prev.event_history];
                const logToHistory = (msg: string) => {
                    newHistory.unshift(`${prev.current_year}年${prev.current_month}月第${prev.current_week}週: ${msg}`);
                    if (newHistory.length > 100) newHistory.splice(100);
                };

                if (prev.funds < cost) {
                    logToHistory("研修費用が足りません。");
                    showModal({title:"資金不足", content:"研修費用が足りません。", showCloseButton:true});
                    return {...prev, event_history: newHistory};
                }
                const newEmployees = prev.employees.map(emp => {
                    if (employeeIds.includes(emp.id)) {
                        return {
                            ...emp,
                            skill_point: Math.min(100, emp.skill_point + BASE_VALUES.TRAINING_SKILL_GAIN),
                            is_busy: true,
                            assigned_project_id: 'training'
                        };
                    }
                    return emp;
                });
                const traineeNames = employeeIds.map(id => prev.employees.find(emp=>emp.id===id)?.name).filter(Boolean).join(', ');
                logToHistory(`${traineeNames} が研修を開始しました。スキルアップが期待されます！費用: ${formatFunds(cost)}`);
                showModal({title:"研修開始", content:`${traineeNames} が研修を開始。\n費用: ${formatFunds(cost)}`, showCloseButton:true});
                return { ...prev, employees: newEmployees, funds: prev.funds - cost, event_history: newHistory };
            });
        };

        const handleBuyEquipmentEvent = (event: Event) => {
            const e = event as CustomEvent<BuyEquipmentEventDetail>;
            const item = e.detail;
            updateGameState(prev => {
                if (!prev) return prev;
                let newHistory = [...prev.event_history];
                const logToHistory = (msg: string) => {
                    newHistory.unshift(`${prev.current_year}年${prev.current_month}月第${prev.current_week}週: ${msg}`);
                    if (newHistory.length > 100) newHistory.splice(100);
                };
                if (prev.funds < item.cost) {
                    logToHistory(`設備「${item.name}」の購入資金が足りません。`);
                    showModal({title:"資金不足", content:`「${item.name}」の購入資金が足りません。`, showCloseButton:true});
                    return {...prev, event_history: newHistory};
                }
                logToHistory(`新しい設備「${item.name}」を購入しました！費用: ${formatFunds(item.cost)}`);
                showModal({title:"設備購入", content:`「${item.name}」を購入しました！\n費用: ${formatFunds(item.cost)}`, showCloseButton:true});
                return { ...prev, funds: prev.funds - item.cost, equipment: [...prev.equipment, item.name], event_history: newHistory };
            });
        };

        const handleUpdateWelfareEvent = (event: Event) => {
            const e = event as CustomEvent<UpdateWelfareEventDetail>;
            const newWelfare = e.detail;
            updateGameState(prev => {
                if (!prev) return prev;
                const message = `待遇を更新しました。賞与: ${newWelfare.bonus_rate.toFixed(1)}ヶ月, 年間休日: ${newWelfare.annual_holidays}日`;
                const newHistory = [`${prev.current_year}年${prev.current_month}月第${prev.current_week}週: ${message}`, ...prev.event_history];
                if (newHistory.length > 100) newHistory.splice(100);
                showModal({title:"待遇更新", content:`待遇を更新しました。\n賞与: ${newWelfare.bonus_rate.toFixed(1)}ヶ月\n年間休日: ${newWelfare.annual_holidays}日`, showCloseButton:true});
                return { ...prev, welfare: newWelfare, event_history: newHistory };
            });
        };

        const handleUpgradeOfficeEvent = (event: Event) => {
            const e = event as CustomEvent<UpgradeOfficeEventDetail>;
            const newOffice = e.detail;
            updateGameState(prev => {
                if (!prev) return prev;
                const message = `事務所を「${newOffice.name}」に移転しました！家賃: ${formatFunds(newOffice.rent_monthly)}/月, 最大従業員数: ${newOffice.employee_capacity}名。`;
                const newHistory = [`${prev.current_year}年${prev.current_month}月第${prev.current_week}週: ${message}`, ...prev.event_history];
                if (newHistory.length > 100) newHistory.splice(100);
                showModal({title:"事務所移転", content:`事務所を「${newOffice.name}」に移転しました！\n家賃: ${formatFunds(newOffice.rent_monthly)}/月\n最大従業員数: ${newOffice.employee_capacity}名`, showCloseButton:true});
                return { ...prev, office: newOffice, event_history: newHistory };
            });
        };
        
        const handleAddStaffToProjectEvent = (event: Event) => {
            const e = event as CustomEvent<AddStaffEventDetail>;
            const { projectId, employeeIdsToAdd } = e.detail;

            updateGameState(prev => {
                if (!prev) return prev;
                
                closeModal();

                const projectIndex = prev.ongoing_projects.findIndex(p => p.id === projectId);
                if (projectIndex === -1) return prev;

                const updatedProject = {
                    ...prev.ongoing_projects[projectIndex],
                    assigned_employee_ids: [
                        ...prev.ongoing_projects[projectIndex].assigned_employee_ids,
                        ...employeeIdsToAdd
                    ].filter((id, index, self) => self.indexOf(id) === index)
                };

                const updatedOngoingProjects = [...prev.ongoing_projects];
                updatedOngoingProjects[projectIndex] = updatedProject;

                const updatedEmployees = prev.employees.map(emp => 
                    employeeIdsToAdd.includes(emp.id) 
                    ? { ...emp, is_busy: true, assigned_project_id: projectId } 
                    : emp
                );
                
                const addedNames = employeeIdsToAdd.map(id => prev.employees.find(emp=>emp.id===id)?.name).filter(Boolean).join(', ');
                const message = `プロジェクト「${updatedProject.project_data.name}」に ${addedNames} を追加しました。`;
                const newHistory = [`${prev.current_year}年${prev.current_month}月第${prev.current_week}週: ${message}`, ...prev.event_history];
                if (newHistory.length > 100) newHistory.splice(100);

                setTimeout(() => showModal({ title: "人員追加完了", content: message, showCloseButton: true }), 50);

                return {
                    ...prev,
                    ongoing_projects: updatedOngoingProjects,
                    employees: updatedEmployees,
                    event_history: newHistory,
                };
            });
        };

        const handleSaveGameEvent = (event: Event) => {
            const e = event as CustomEvent<SaveGameEventDetail>;
            const { slotIndex } = e.detail;
            if (gameState) {
                saveGameToSlot(slotIndex, gameState);
                setSaveSlots(loadSaveSlots()); // Refresh slots state
                showModal({title: "セーブ完了", content: `スロット${slotIndex + 1}にゲームをセーブしました。`, showCloseButton: true});
            }
        };

        window.addEventListener('accept-project', handleAcceptProjectEvent);
        window.addEventListener('recruit-employees', handleRecruitEvent);
        window.addEventListener('train-employees', handleTrainEvent);
        window.addEventListener('buy-equipment', handleBuyEquipmentEvent);
        window.addEventListener('update-welfare', handleUpdateWelfareEvent);
        window.addEventListener('upgrade-office', handleUpgradeOfficeEvent);
        window.addEventListener('add-staff-to-project', handleAddStaffToProjectEvent);
        window.addEventListener('save-game-to-slot', handleSaveGameEvent);

        return () => {
            window.removeEventListener('accept-project', handleAcceptProjectEvent);
            window.removeEventListener('recruit-employees', handleRecruitEvent);
            window.removeEventListener('train-employees', handleTrainEvent);
            window.removeEventListener('buy-equipment', handleBuyEquipmentEvent);
            window.removeEventListener('update-welfare', handleUpdateWelfareEvent);
            window.removeEventListener('upgrade-office', handleUpgradeOfficeEvent);
            window.removeEventListener('add-staff-to-project', handleAddStaffToProjectEvent);
            window.removeEventListener('save-game-to-slot', handleSaveGameEvent);
        };
    }, [updateGameState, showModal, closeModal, gameState]); 

    React.useEffect(() => {
        setSaveSlots(loadSaveSlots());
    }, [currentScreen]);

    React.useEffect(() => {
        const currentGS = gameStateRef.current;
        if (currentGS && currentGS.is_goal_achieved && !hasShownGameClearModal) {
            const clearMessage = `🎉 祝！資金が1億円を突破！ゲームクリアです！ ${currentGS.president_name}社長、おめでとうございます！引き続き経営をお楽しみください。`;
            
            setGameState(prev => {
                 if (!prev) return null;
                 const newHistory = [`${prev.current_year}年${prev.current_month}月第${prev.current_week}週: ${clearMessage}`, ...prev.event_history];
                 if (newHistory.length > 100) newHistory.splice(100);
                 return { ...prev, event_history: newHistory };
            });

            showModal({
                title: "🎉 ゲームクリア！ 🎉",
                content: `おめでとうございます！\n貴社「${currentGS.company_name}」は、ついに総資金1億円を達成しました！\n\n${currentGS.president_name}社長の卓越した経営手腕の賜物です。\n\nこれからも「がんばる工務店 奮闘記」の世界を引き続きお楽しみください！`,
                buttons: [{ text: "続ける", action: () => {}, className: "bg-green-500 hover:bg-green-700 text-white" }],
                showCloseButton: false, 
                onClose: closeModal 
            });
            setHasShownGameClearModal(true);
        }
    }, [gameState, hasShownGameClearModal, showModal, closeModal]);


    const renderScreen = () => {
        switch (currentScreen) {
            case 'title':
                return <TitleScreen onStartNewGame={() => setCurrentScreen('setup')} onLoadGame={handleLoadGame} onDeleteGame={handleDeleteGame} saveSlots={saveSlots} volume={volume} onVolumeChange={handleVolumeChange} />;
            case 'setup':
                return <SetupScreen onStartGame={initializeGame} saveSlots={saveSlots} onLoadGame={handleLoadGame} onDeleteGame={handleDeleteGame} />;
            case 'main':
                if (!gameState) return <div className="text-center p-10 text-xl text-gray-600">ゲームデータを読み込み中...</div>;
                return <MainGameScreen 
                            gameState={gameState} 
                            onAdvanceTime={handleAdvanceTime} 
                            onShowModal={showModal} 
                            onSaveRequest={handleSaveRequest}
                            showGhostShop={showGhostShop} 
                            onOpenGhostShop={() => setShowGhostShop(false)} 
                            onShowEmployeeDetails={handleShowEmployeeDetails}
                            isAdvancingTime={isAdvancingTime}
                        />;
            case 'gameOver':
                const finalGameStateForGameOver = gameState || { 
                    company_name: "N/A", president_name: "N/A", selected_difficulty_key: DifficultyLevel.NORMAL,
                    current_year: 0, current_month: 0, current_week: 0, total_weeks_elapsed: 0, funds: 0, reputation: 0,
                    employees: [], office: INITIAL_OFFICES_BY_DIFFICULTY[DifficultyLevel.NORMAL], equipment: [],
                    welfare: { bonus_rate: 0, annual_holidays: 0 }, ongoing_projects: [],
                    event_history: ["ゲームオーバー"], is_goal_achieved: false, next_employee_id: 0,
                    game_balance: DIFFICULTY_SETTINGS[DifficultyLevel.NORMAL].balance
                };
                return <GameOverScreen finalGameState={finalGameStateForGameOver} reason={gameOverReason} onRestart={handleRestart} />;
            default:
                return <div>不明な画面です。</div>;
        }
    };
    
    if (!isLoaded) {
        return <LoadingScreen progress={loadingProgress} />;
    }

    return (
        <div className="max-w-6xl mx-auto my-5 p-5 bg-gray-50 rounded-xl shadow-2xl min-h-screen">
            {renderScreen()}
            <Modal config={modalConfig} onClose={closeModal} />

            {currentScreen !== 'title' && currentScreen !== 'gameOver' && isLoaded && (
                <VolumeControl
                    volume={volume}
                    onVolumeChange={handleVolumeChange}
                    className="fixed bottom-4 right-4 z-[60]"
                />
            )}
        </div>
    );
};

export default App;