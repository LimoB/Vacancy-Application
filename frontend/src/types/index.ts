// --- ENUMS & LITERALS ---
export type UserRole = 'admin' | 'user' | 'employer' | 'seeker';
export type UserType = 'seeker' | 'employer' | 'admin';

export type ApplicationStatus = 
  | 'Pending' | 'Accepted' | 'Rejected' 
  | 'pending' | 'accepted' | 'rejected';

// --- INTERFACES ---

export interface User {
  id: number;
  username: string;
  email: string;
  user_role: UserRole;
  user_type: UserType;
  about?: string;
  location?: string;
  date_created: string; 
  last_active: string;  
  applications?: Application[]; 
  profile_picture?: string; 
}

export interface Job {
  id: number;
  /** The FK to the User who created the job (consistent with backend) */
  employer_id: number; 
  /** Optional backup for older records or specific joins */
  user_id?: number; 
  company: string;
  job_title: string;
  job_description: string;
  salary: string;
  date_created: string;
  /** Included to support the "Applicant Count" logic */
  applications?: Application[];
}

export interface Application {
  id: number;
  status: ApplicationStatus;
  user_id: number;
  job_id: number;
  application_date: string;
  /** Nested data enabled by your serialize_rules in Flask */
  job?: Job;  
  user?: User; 
}