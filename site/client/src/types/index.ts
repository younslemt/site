export type Role = 'admin' | 'client';

export interface User {
  id: string;
  uid?: string; // Firebase Auth UID
  name: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface Organization {
  id: string;
  userId?: string; // Owner/Creator Auth UID
  name: string;
  type: string;
  employeeCount: number;
  vatNumber: string;
}

export type SprintStatus = 'Pas commencé' | 'En Cours' | 'Terminé';

export interface Sprint {
  id: string;
  name: string;
  organizationId: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
}

export interface Task {
  id: string;
  sprintId: string;
  title: string;
  isCompleted: boolean;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  fileUrl: string;
}

export interface Diagnostic {
  id: string;
  organizationId: string;
  title: string;
  date: string;
  globalScore: number;
  comment: string;
  scores: {
    esg: number;
    credit: number;
    cybersecurity: number;
    aml: number;
    digitalisation: number;
  };
}
