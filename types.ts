
export enum ResourceCategory {
  EMPIRE = 'EMPIRE',
  MAINTENANCE = 'MAINTENANCE',
  TRAITOR_TAX = 'TRAITOR_TAX'
}

export interface ResourceLeak {
  id: string;
  name: string;
  amount: number;
  category: ResourceCategory;
  sealed: boolean;
  dateCreated: number;
}

export interface WarChestState {
  totalLiquid: number;
  fortifiedAssets: number;
  strategicInfluence: number;
}

export interface TimeBlock {
  id: string;
  type: 'MISSION' | 'RECOVERY' | 'CONQUEST' | 'LEAK';
  label: string;
  startTime: string;
  durationHours: number;
}

export interface DailyRitual {
  date: string;
  morningInvocation: boolean;
  eveningAudit: boolean;
  leaksSealedToday: string[];
}
