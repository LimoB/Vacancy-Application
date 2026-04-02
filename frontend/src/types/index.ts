// --- ENUMS & LITERALS ---
export type UserRole = 'admin' | 'user';
export type UserType = 'seeker' | 'employer';
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
  cv_url?: string | null; 
  date_created: string; 
  last_active?: string;  
}

export interface Job {
  user_id: number;
  id: number;
  employer_id: number; // Matches the ForeignKey
  company: string;
  job_title: string;
  job_description: string;
  salary: string;
  date_created: string;
  
  /** * CRITICAL: Because of your Flask backref='employer', 
   * the nested user data will likely come back under the key 'employer'
   */
  employer?: User; 
  
  /** Optional fallback if you use different serialization rules elsewhere */
  user?: User;
  applications?: Application[];
}

export interface Application {
  id: number;
  status: ApplicationStatus;
  employer_message?: string | null;
  
  user_id: number;
  job_id: number;
  application_date: string;
  updated_at?: string | null;

  /** Nested data from SerializerMixin */
  job?: Job;  
  user?: User; // The Seeker who applied
}