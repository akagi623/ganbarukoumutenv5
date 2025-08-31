
import * as React from 'react';

export enum DifficultyLevel {
  EASY = "easy",
  NORMAL = "normal",
  HARD = "hard",
  VERY_HARD = "very_hard",
}

export interface Office {
  name: string;
  rent_monthly: number;
  employee_capacity: number;
}

export interface EquipmentItem {
  name:string;
  cost: number;
}

export interface Project {
  id: string;
  name: string;
  reward: number;
  total_workload: number;
  required_skill: number;
  required_employees_min: number;
  required_equipment: string[];
  description: string;
  reputation_gain: number;
  required_reputation: number;
}

export interface EmployeeCandidateBase {
  baseName?: string; // For generating names
  fullName?: string; // For special characters
  role: string;
  salary_monthly: number;
  skill_point: number;
  stamina: number; // Initial stamina
  motivation: number; // Initial motivation
  description?: string; // Short introduction for the candidate
  imagePath?: string; // Path to the character's image
}

export interface Employee extends EmployeeCandidateBase {
  id: string;
  name: string; // Final generated or full name
  max_stamina: number;
  max_motivation: number;
  is_busy: boolean;
  assigned_project_id: string | null;
  is_on_leave: boolean;
  leave_duration_weeks: number;
}

export interface Welfare {
  bonus_rate: number;
  annual_holidays: number;
}

export interface OngoingProject {
  id: string; // Unique ID for the ongoing instance
  project_data: Project;
  assigned_employee_ids: string[];
  remaining_workload: number;
  start_week: number;
  weeks_passed: number;
}

export interface GameBalanceEmployeeParams {
  stamina_loss_rate: number;
  motivation_loss_rate: number;
  stamina_gain_rate: number;
  motivation_gain_rate: number;
}

export interface GameBalance {
  initial_funds_multiplier: number;
  project_success_rate_modifier: number;
  recruitment_success_modifier: number;
  employee_parameter_change_rate: GameBalanceEmployeeParams;
}

export interface GameState {
  company_name: string;
  president_name: string;
  selected_difficulty_key: DifficultyLevel;
  current_year: number;
  current_month: number;
  current_week: number;
  total_weeks_elapsed: number;
  funds: number;
  reputation: number;
  employees: Employee[];
  office: Office;
  equipment: string[]; // Names of owned equipment
  welfare: Welfare;
  ongoing_projects: OngoingProject[];
  event_history: string[];
  is_goal_achieved: boolean; // Not fully used in original, but good to keep
  next_employee_id: number;
  game_balance: GameBalance;
}

export interface SaveSlot {
    slotIndex: number;
    gameState: GameState | null;
    exists: boolean;
}

export interface ModalButton {
  text: string;
  className?: string;
  action: () => void;
}

export interface ModalConfig {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  buttons?: ModalButton[];
  showCloseButton?: boolean;
  onClose?: () => void; // Optional specific close for this modal instance
}

// Event detail types
export interface AcceptProjectEventDetail {
  project: Project;
  selectedEmployeeIds: string[];
}

export interface RecruitEmployeesEventDetail {
  isPaid: boolean;
}

export interface TrainEmployeesEventDetail {
  employeeIds: string[];
  cost: number;
}

export interface BuyEquipmentEventDetail extends EquipmentItem {}

export interface UpdateWelfareEventDetail extends Welfare {}

export interface UpgradeOfficeEventDetail extends Office {}

export interface AddStaffEventDetail {
  projectId: string;
  employeeIdsToAdd: string[];
}

export interface SaveGameEventDetail {
    slotIndex: number;
}
