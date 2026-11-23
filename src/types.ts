export type DealStage = 'prospecção' | 'proposta_sent' | 'closed_won';

export interface Account {
  id: string;
  name: string;
  industry: string;
  website: string;
  email?: string;
  phone?: string;
  location?: string;
  size?: string; // e.g. Micro, Small, Medium, Enterprise
  revenue?: string; // e.g. Deal size or annual revenue range
  status?: string; // e.g. Prospect, Lead, Active Customer, Partner, Inactive
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  accountId: string;
  title: string;
  date: string;
  summary: string;
  attendees: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  accountId: string;
  title: string;
  value: number;
  status: DealStage;
  archived: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  accountId?: string;
  dealId?: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  accountId?: string;
  dealId?: string;
  title: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'Pendente' | 'Paga';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  accountId?: string;
  dealId?: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
