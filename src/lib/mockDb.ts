import { User } from 'firebase/auth';

// Simple mock DB using localStorage to allow "saving" without Firestore
export const mockDb = {
  save: (collection: string, data: any) => {
    const existing = JSON.parse(localStorage.getItem(collection) || '[]');
    const newItem = { 
      ...data, 
      id: Math.random().toString(36).substring(2, 11),
      criadoEm: new Date().toISOString()
    };
    localStorage.setItem(collection, JSON.stringify([...existing, newItem]));
    return newItem;
  },
  
  update: (collection: string, id: string, data: any) => {
    const existing = JSON.parse(localStorage.getItem(collection) || '[]');
    const index = existing.findIndex((item: any) => item.id === id);
    if (index !== -1) {
      existing[index] = { ...existing[index], ...data, atualizadoEm: new Date().toISOString() };
      localStorage.setItem(collection, JSON.stringify(existing));
      return existing[index];
    }
    return null;
  },
  
  delete: (collection: string, id: string) => {
    const existing = JSON.parse(localStorage.getItem(collection) || '[]');
    const filtered = existing.filter((item: any) => item.id !== id);
    localStorage.setItem(collection, JSON.stringify(filtered));
  },
  
  getAll: (collection: string) => {
    return JSON.parse(localStorage.getItem(collection) || '[]');
  },
  
  getOne: (collection: string, id: string) => {
    const existing = JSON.parse(localStorage.getItem(collection) || '[]');
    return existing.find((item: any) => item.id === id) || null;
  },

  query: (collection: string, field: string, operator: string, value: any) => {
    const existing = JSON.parse(localStorage.getItem(collection) || '[]');
    return existing.filter((item: any) => {
      if (operator === '==') return item[field] === value;
      if (operator === '>=') return item[field] >= value;
      return true;
    });
  }
};
