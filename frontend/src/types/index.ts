// --- ENUMS & LITERALS ---
/**
 * user_role: 'admin' (can delete everything) or 'user' (standard)
 * user_type: 'seeker' (applies) or 'employer' (posts)
 */
export type UserRole = 'admin' | 'user';
export type UserType = 'seeker' | 'employer';

/** Consistent with backend Application.status defaults */
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | string;

// --- INTERFACES ---

export interface User {
  id: number;
  username: string;
  email: string;
  user_role: UserRole;
  user_type: UserType;
  about?: string;
  location?: string;
  profile_picture?: string;
  /** NEW: Linked to the cv_url column in the backend User model */
  cv_url?: string | null; 
  date_created: string; 
  last_active?: string;  
  applications?: Application[]; 
  jobs_posted?: Job[];
}

export interface Job {
  id: number;
  /** Matches the ForeignKey 'employer_id' in the backend Job model */
  employer_id: number; 
  company: string;
  job_title: string;
  job_description: string;
  salary: string;
  date_created: string;
  /** Used for 'stats' views or admin counters */
  applications?: Application[];
}

export interface Application {
  id: number;
  status: ApplicationStatus;
  /** NEW: Captured from the updated Flask model for employer feedback */
  employer_message?: string | null;
  
  user_id: number;
  job_id: number;
  application_date: string;
  /** Updated automatically via SQL Alchemy's onupdate=func.now() */
  updated_at?: string | null;

  /** Nested data enabled by SerializerMixin serialize_rules */
  job?: Job;  
  user?: User; 
}