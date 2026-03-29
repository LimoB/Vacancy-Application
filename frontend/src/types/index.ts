// Matches the logic in your SQLAlchemy models
export type UserRole = 'admin' | 'user';
export type UserType = 'seeker' | 'employer';
export type ApplicationStatus = 'Pending' | 'Accepted' | 'Rejected';

export interface User {
  id: number;
  username: string;
  email: string;
  user_role: UserRole;
  user_type: UserType;
  about?: string;
  location?: string;
  date_created: string; // From func.now()
  last_active: string;  // From onupdate=func.now()
  // serialize_rules allows seeing applications from the user side
  applications?: Application[]; 
  profile_picture?: string; // Add this line!
}

export interface Job {
    employer_id: number;
  id: number;
  company: string;
  job_title: string;
  job_description: string;
  salary: string;
  date_created: string;
  // serialize_rules allows seeing who applied from the job side
  applications?: Application[];
}

export interface Application {
  id: number;
  status: ApplicationStatus;
  user_id: number;
  job_id: number;
  application_date: string;
  // Nested data enabled by your serialize_rules
  job?: Job;  
  user?: User; 
}