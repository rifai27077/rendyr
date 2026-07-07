import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if we are using dummy keys
export const isDummySupabase = !supabaseUrl || supabaseUrl.includes('dummy.supabase.co') || supabaseUrl.includes('placeholder');

// Real Supabase client instance
const realSupabase = createClient(
  isDummySupabase ? 'https://placeholder-url.supabase.co' : supabaseUrl, 
  isDummySupabase ? 'placeholder-key' : supabaseAnonKey
);

// --- MOCK LOCAL DATABASE SIMULATOR FOR DEMO MODE ---
const isClient = typeof window !== 'undefined';

function getMockStore(tableName: string): any[] {
  if (isClient) {
    const saved = localStorage.getItem(`mock_db_${tableName}`);
    if (saved) return JSON.parse(saved);
  } else {
    const globalStore = (globalThis as any)._mock_db || {};
    if (globalStore[tableName]) return globalStore[tableName];
  }
  return [];
}

function sebelumSesudah() {
  if (!isDummySupabase) {
    set
    getMockData('products', []);
  }
}

function setMockStore(tableName: string, data: any[]) {
  if (isClient) {
    localStorage.setItem(`mock_db_${tableName}`, JSON.stringify(data));
    // Fire-and-forget background synchronization to Node.js server memory
    fetch('/api/mock-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName, data })
    }).catch((err) => console.warn('Mock DB server sync failed:', err));
  } else {
    const globalStore = (globalThis as any)._mock_db || {};
    globalStore[tableName] = data;
    (globalThis as any)._mock_db = globalStore;
  }
}

function getMockData(tableName: string, defaultData: any[]): any[] {
  if (isClient) {
    const saved = localStorage.getItem(`mock_db_${tableName}`);
    if (saved === null) {
      setMockStore(tableName, defaultData);
      return defaultData;
    }
    return JSON.parse(saved);
  } else {
    const globalStore = (globalThis as any)._mock_db || {};
    if (globalStore[tableName] === undefined) {
      globalStore[tableName] = defaultData;
      (globalThis as any)._mock_db = globalStore;
      return defaultData;
    }
    return globalStore[tableName];
  }
}

function createMockQueryBuilder(tableName: string) {
  const chain: any = {
    _filterColumn: null,
    _filterValue: undefined,
    _isSingle: false,
    _isDelete: false,
    _updateValues: null,
    _insertValues: null,

    async then(onfulfilled: any) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      let data: any = null;
      let error: any = null;

      try {
        if (this._insertValues) {
          // INSERT
          const body = Array.isArray(this._insertValues) ? this._insertValues[0] : this._insertValues;
          const res = await fetch(`${baseUrl}/${tableName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!res.ok) throw new Error(`Insert failed: ${res.statusText}`);
          data = await res.json();
        } else if (this._isDelete) {
          // DELETE
          const res = await fetch(`${baseUrl}/${tableName}/${this._filterValue}`, {
            method: 'DELETE'
          });
          if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`);
          data = await res.json();
        } else if (this._updateValues) {
          // UPDATE
          if (tableName === 'settings') {
            const res = await fetch(`${baseUrl}/settings`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: this._filterValue, value: this._updateValues.value })
            });
            if (!res.ok) throw new Error(`Update settings failed: ${res.statusText}`);
            data = await res.json();
          } else {
            const res = await fetch(`${baseUrl}/${tableName}/${this._filterValue}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(this._updateValues)
            });
            if (!res.ok) throw new Error(`Update failed: ${res.statusText}`);
            data = await res.json();
          }
        } else {
          // SELECT
          if (tableName === 'settings' && this._filterColumn === 'key') {
            const res = await fetch(`${baseUrl}/settings/${this._filterValue}`);
            if (res.status === 404) {
              data = null;
            } else {
              data = await res.json();
            }
          } else if (this._filterColumn && (this._isSingle || this._filterColumn === 'slug' || this._filterColumn === 'id')) {
            const res = await fetch(`${baseUrl}/${tableName}/${this._filterValue}`);
            if (res.status === 404) {
              data = null;
            } else {
              data = await res.json();
            }
          } else {
            // Get all
            let url = `${baseUrl}/${tableName}`;
            if (tableName === 'analytics_daily') {
              url = `${baseUrl}/analytics`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Select all failed: ${res.statusText}`);
            data = await res.json();
          }
        }
      } catch (err: any) {
        console.error(`Laravel API error for table ${tableName}:`, err);
        error = err;
      }

      let resolvedData = data;
      if (this._isSingle && Array.isArray(data)) {
        resolvedData = data.length > 0 ? data[0] : null;
      }

      return onfulfilled({ 
        data: resolvedData, 
        error: error ? { message: error.message } : null, 
        count: Array.isArray(resolvedData) ? resolvedData.length : (resolvedData ? 1 : 0) 
      });
    }
  };

  const methods = ['select', 'insert', 'update', 'delete', 'order', 'limit', 'eq', 'neq', 'gt', 'lt', 'like', 'ilike', 'or', 'and', 'single', 'maybeSingle', 'csv'];
  
  methods.forEach(method => {
    chain[method] = function(...args: any[]) {
      if (method === 'single' || method === 'maybeSingle') {
        this._isSingle = true;
      } else if (method === 'insert') {
        this._insertValues = args[0];
      } else if (method === 'update') {
        this._updateValues = args[0];
      } else if (method === 'delete') {
        this._isDelete = true;
      } else if (method === 'eq') {
        const [column, value] = args;
        this._filterColumn = column;
        this._filterValue = value;
      }
      return this;
    };
  });

  return chain;
}

const uploadedFilesMap = new Map<string, string>();

const mockStorage = {
  from(bucketName: string) {
    return {
      async upload(filePath: string, file: File, options?: any) {
        let publicUrl = '/free-fire-logo.png';
        try {
          const formData = new FormData();
          formData.append('file', file);

          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
          const res = await fetch(`${baseUrl}/upload`, {
            method: 'POST',
            body: formData
          });

          if (!res.ok) throw new Error('Laravel upload failed');
          const data = await res.json();
          
          publicUrl = data.publicUrl;
          uploadedFilesMap.set(filePath, publicUrl);
        } catch (e) {
          console.error('Laravel upload failed:', e);
        }
        return { data: { path: filePath }, error: null };
      },
      getPublicUrl(filePath: string) {
        let saved = uploadedFilesMap.get(filePath);
        return { data: { publicUrl: saved || '/free-fire-logo.png' } };
      }
    };
  }
};

const mockSupabase = {
  auth: {
    async signInWithPassword({ email, password }: any) {
      return { 
        data: { 
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600
          }, 
          user: { id: 'mock-user-id', email: 'rendyr@jbrendyr.com' } 
        }, 
        error: null 
      };
    },
    async signUp() {
      return { data: { user: null }, error: null };
    },
    async signOut() {
      return { error: null };
    },
    async getSession() {
      return { data: { session: null }, error: null };
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } };
    }
  },
  from(tableName: string) {
    return createMockQueryBuilder(tableName);
  },
  rpc() {
    return { data: null, error: null };
  },
  storage: mockStorage
};

// Export active client wrapper
export const supabase = isDummySupabase ? (mockSupabase as any) : realSupabase;

export const supabaseAdmin = isDummySupabase ? (mockSupabase as any) : (
  typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : realSupabase
);
