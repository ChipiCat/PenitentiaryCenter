import type { LucideIcon } from 'lucide-react';

export interface SystemStat {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: LucideIcon;
  color: string;
}

export interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  action: () => void;
}

export interface ReportFilters {
  crimeType: string | null;
  processStatus: string | null;
  gender: string | null;
  minAge: number | string;
  maxAge: number | string;
  startDate: string;
  endDate: string;
}

export interface SelectOption {
  value: string;
  label: string;
}