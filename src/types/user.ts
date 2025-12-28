export interface UserProfile {
  username: string;

  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  country: string | null;
  preferredLanguage: string | null;

  totalSubmissions: number;
  acceptedSubmissions: number;
  problemsSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;

  easyCount: number;
  mediumCount: number;
  hardCount: number;

  websiteUrl: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  xUrl: string | null;

  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdateRequest {
  username?: string;
  name?: string;
  bio?: string;
  country?: string;
  preferredLanguage?: string;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  xUrl?: string;
}
