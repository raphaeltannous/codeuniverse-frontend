export interface DashboardStats {
  totalUsers: number;
  totalUsersRegisteredLast7d: number;

  totalProblems: number;
  easyProblems: number;
  mediumProblems: number;
  hardProblems: number;

  totalSubmissions: number;
  submissionsLast24h: number;
  submissionsLast7d: number;
  submissionsLast30d: number;

  totalAdmins: number;
  pendingSubmissions: number;

  acceptedSubmissions: number;
  acceptanceRate: number;
}

export interface ActivityLog {
  id: string;
  type: 'submission' | 'user_registration';
  username: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ProblemDifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface DailySubmissions {
  date: string;
  submissions: number;
  accepted: number;
}
