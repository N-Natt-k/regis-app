export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN'
}

export enum GradeLevel {
  M1 = 'ม.1',
  M2 = 'ม.2',
  M3 = 'ม.3',
  M4 = 'ม.4',
  M5 = 'ม.5',
  M6 = 'ม.6'
}

export interface StudentData {
  id?: string; // Firestore ID
  studentId: string;
  prefix: string;
  firstName: string;
  lastName: string;
  grade: GradeLevel;
  room: string;
  phone: string;
  role: UserRole;
  
  // Application Statuses
  isCoreLeader: boolean; // สมัครนักเรียนแกนนำแล้วหรือยัง
  isCommittee: boolean; // สมัครกรรมการแล้วหรือยัง
  
  coreLeaderAppliedDate?: string;
  committeeAppliedDate?: string;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  role: UserRole;
}

export interface SystemConfig {
  id?: string;
  key: string; // e.g., 'core_leader', 'committee'
  isOpen: boolean;
  openDate?: string; // ISO String
  closeDate?: string; // ISO String
  quotaPerRoom?: number; // For core leaders
  allowedGrades?: GradeLevel[]; // For committee
  externalLink?: string; // For 1 Classroom 1 Project
}

export interface Announcement {
  id?: string;
  category: 'CORE' | 'COMMITTEE' | 'PROJECT';
  title: string;
  link?: string;
  content?: string;
  date: string;
}

export const ROOM_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
export const GRADE_OPTIONS = Object.values(GradeLevel);