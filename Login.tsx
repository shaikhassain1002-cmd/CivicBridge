export type UserRole = 'citizen' | 'official' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  contactInfo?: string;
  createdAt: string;
}

export type ComplaintStatus = 'Submitted' | 'Under Review' | 'Assigned' | 'In Progress' | 'Resolved';

export type ComplaintCategory = 'Road' | 'Water' | 'Electricity' | 'Sanitation' | 'Other';

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  category: ComplaintCategory;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: ComplaintStatus;
  remarks?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt?: string;
}

export const STATUS_STAGES: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved'
];

export const CATEGORIES: ComplaintCategory[] = [
  'Road',
  'Water',
  'Electricity',
  'Sanitation',
  'Other'
];
