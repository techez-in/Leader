import type { Lead } from './types';

export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Alex Johnson',
    contact: 'alex.j@example.com',
    source: 'LinkedIn',
    priority: 'High',
    status: 'New Lead',
    dateAdded: new Date('2024-05-10T10:00:00Z'),
    followUpDate: new Date('2024-05-20T10:00:00Z'),
    notes: 'Interested in enterprise plan. Follow up with pricing details.',
  },
  {
    id: 'lead-2',
    name: 'Maria Garcia',
    contact: 'maria.g@example.com',
    source: 'Website',
    priority: 'Medium',
    status: 'In Progress',
    dateAdded: new Date('2024-05-08T14:30:00Z'),
    followUpDate: new Date('2024-05-18T14:30:00Z'),
    notes: 'Sent initial proposal. Awaiting feedback.',
  },
  {
    id: 'lead-3',
    name: 'Sam Williams',
    contact: 'sam.w@example.com',
    source: 'Referral',
    priority: 'High',
    status: 'Converted',
    dateAdded: new Date('2024-04-20T09:00:00Z'),
    followUpDate: new Date('2024-04-30T09:00:00Z'),
    notes: 'Successfully closed the deal. Onboarded.',
  },
  {
    id: 'lead-4',
    name: 'Casey Brown',
    contact: 'casey.b@example.com',
    source: 'Instagram',
    priority: 'Low',
    status: 'Dropped',
    dateAdded: new Date('2024-04-15T11:00:00Z'),
    followUpDate: new Date('2024-04-25T11:00:00Z'),
    notes: 'Chose a competitor. No longer interested.',
  },
  {
    id: 'lead-5',
    name: 'Jordan Lee',
    contact: 'jordan.l@example.com',
    source: 'Website',
    priority: 'Medium',
    status: 'New Lead',
    dateAdded: new Date('2024-05-12T16:00:00Z'),
    followUpDate: new Date('2024-05-22T16:00:00Z'),
    notes: 'Downloaded a whitepaper on our services.',
  },
  {
    id: 'lead-6',
    name: 'Taylor Davis',
    contact: 'taylor.d@example.com',
    source: 'Other',
    priority: 'Low',
    status: 'In Progress',
    dateAdded: new Date('2024-05-01T12:00:00Z'),
    followUpDate: new Date('2024-05-15T12:00:00Z'),
    notes: 'Initial contact made. Needs more nurturing.',
  },
];
