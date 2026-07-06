'use client';

import { useEffect } from 'react';

export default function MockDbSync() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncMockStore = async () => {
      try {
        const keys = Object.keys(localStorage);
        const mockKeys = keys.filter((k) => k.startsWith('mock_db_'));
        
        for (const key of mockKeys) {
          const tableName = key.replace('mock_db_', '');
          const rawData = localStorage.getItem(key);
          if (rawData) {
            const data = JSON.parse(rawData);
            
            // Sync to server global memory
            await fetch('/api/mock-db', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tableName, data })
            });
          }
        }
      } catch (err) {
        console.warn('Mock DB sync error:', err);
      }
    };

    syncMockStore();
  }, []);

  return null;
}
