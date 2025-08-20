import { create } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';

export interface Entry {
  date: string;
  score: number | null;
  went_out_level: number | null;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

export interface EntryDetail {
  entry: {
    date: string;
    raw_text: string;
    meals: {
      breakfast: boolean;
      lunch: boolean;
      dinner: boolean;
    };
  };
  evaluation: {
    summary: string;
    score: number;
    tags: string[];
    places: string[];
    went_out_level: number;
  } | null;
}

export interface Evaluation {
  id: string;
  entry_id: string;
  summary: string;
  score: number;
  tags: string[];
  places: string[];
  went_out_level: number;
  created_at: string;
}

interface AppState {
  entries: Entry[];
  currentMonth: Dayjs;
  selectedDate: string | null;
  entryDetail: EntryDetail | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;

  // Actions
  setCurrentMonth: (month: Dayjs) => void;
  setSelectedDate: (date: string | null) => void;
  fetchEntries: (month: string) => Promise<void>;
  fetchEntryDetail: (date: string) => Promise<void>;
  saveEntry: (date: string, text: string, meals: { breakfast: boolean; lunch: boolean; dinner: boolean }) => Promise<void>;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

const API_BASE_URL = '/api';

export const useAppStore = create<AppState>((set, get) => ({
  entries: [],
  currentMonth: dayjs(),
  selectedDate: null,
  entryDetail: null,
  isLoading: false,
  error: null,
  successMessage: null,
  allEvaluations: null,

  setCurrentMonth: (month) => set({ currentMonth: month }),
  
  setSelectedDate: (date) => set({ selectedDate: date }),

  fetchEntries: async (month: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/entries?month=${month}`, {
        headers: {
          'x-user-id': '00000000-0000-0000-0000-000000000000'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      
      const entries = await response.json();
      set({ entries, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  fetchEntryDetail: async (date: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${date}`, {
        headers: {
          'x-user-id': '00000000-0000-0000-0000-000000000000'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          set({ entryDetail: null, isLoading: false });
          return;
        }
        throw new Error('Failed to fetch entry detail');
      }
      const entryDetail = await response.json();
      set({ entryDetail, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  saveEntry: async (date: string, text: string, meals: { breakfast: boolean; lunch: boolean; dinner: boolean }) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': '00000000-0000-0000-0000-000000000000'
        },
        body: JSON.stringify({
          date,
          raw_text: text,
          meals
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save entry');
      }
      
      // Refresh entries for current month
      const currentMonth = get().currentMonth;
      await get().fetchEntries(currentMonth.format('YYYY-MM'));
      
      set({ isLoading: false, successMessage: '記録を保存しました' });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
  
  clearSuccessMessage: () => set({ successMessage: null })
}));
