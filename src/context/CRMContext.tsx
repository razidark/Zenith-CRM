import { createContext } from 'react';
import type { Account, Contact, Deal, Task, Invoice, Expense, Meeting } from '../types';

export interface CRMContextType {
  accounts: Account[];
  contacts: Contact[];
  deals: Deal[];
  tasks: Task[];
  invoices: Invoice[];
  expenses: Expense[];
  meetings: Meeting[];
  addAccount: (account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAccount: (id: string, data: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteAccount: (id: string) => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (id: string, data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteContact: (id: string) => void;
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDealStatus: (id: string, status: Deal['status']) => void;
  archiveDeal: (id: string) => void;
  restoreDeal: (id: string) => void;
  deleteDeal: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, data: Omit<Task, 'id' | 'completed' | 'completedAt' | 'createdAt' | 'updatedAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInvoice: (id: string, data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  toggleInvoiceStatus: (id: string) => void;
  deleteInvoice: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteExpense: (id: string) => void;
  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteMeeting: (id: string) => void;
  loadDemoData: () => void;
  clearData: () => void;
}

export const CRMContext = createContext<CRMContextType | undefined>(undefined);
