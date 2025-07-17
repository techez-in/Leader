
export const LEAD_STATUSES = ['New Lead', 'In Progress', 'Converted', 'Dropped'] as const;
export const LEAD_PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const LEAD_SOURCES = ['Instagram', 'LinkedIn', 'Website', 'Referral', 'Other'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];

export interface Lead {
  id: string;
  name: string;
  contact: string;
  source: LeadSource;
  priority: LeadPriority;
  notes?: string;
  status: LeadStatus;
  dateAdded: Date;
  followUpDate: Date;
}
