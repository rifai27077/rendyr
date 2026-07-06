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

    then(onfulfilled: any) {
      let data: any = [];

      // Load initial mock records
      if (tableName === 'categories') {
        data = getMockData('categories', [
          { id: 'cat-ff', name: 'Free Fire', slug: 'free-fire', description: 'Akun Free Fire sultan, bundle langka, dan skin senjata maksimal.' },
          { id: 'cat-ml', name: 'Mobile Legends', slug: 'mobile-legends', description: 'Koleksi akun Mobile Legends premium dan aman.' },
        ]);
      } else if (tableName === 'products') {
        data = getMockData('products', [
          {
            id: 'ff-1',
            name: 'Akun FF Sultan Evo Gun Max V1',
            game_name: 'Free Fire',
            slug: 'akun-ff-sultan-evo-gun-max-v1',
            price: 1500000,
            thumbnail: '/free-fire-logo.png',
            gallery: ['/ff-ss-1.png', '/ff-ss-2.png'],
            description: 'Akun Free Fire Sultan spesifikasi dewa. Memiliki Evo Gun skin terlengkap (AK-Blue Flame Draco Max, M1014-Green Flame Draco Max, MP40-Predatory Cobra Max). Bundle langka Cobra dan bundle Old Season lengkap. Akun login FB, aman 100% no minus.',
            rank: 'Grandmaster',
            skin: 'Evo Gun Max (AK, MP40, M1014)',
            hero: 'Karakter Lengkap (Alok, Chrono max)',
            status: 'ready',
            created_at: new Date().toISOString(),
            category_id: 'cat-ff',
            views: 104,
            whatsapp_clicks: 12
          }
        ]);
      } else if (tableName === 'banners') {
        data = getMockData('banners', [
          { id: 'b-1', title: 'Test Banner Free Fire', image_url: '/free_fire_cover_1782248101427.png', link_url: '/catalog', order_num: 1, is_active: true },
          { id: 'b-2', title: 'Rendy R JB Banner', image_url: '/banner-rendy.png', link_url: '/catalog', order_num: 2, is_active: true }
        ]);
      } else if (tableName === 'faqs') {
        data = getMockData('faqs', [
          { id: 'f-1', question: 'Apakah transaksi di sini aman?', answer: 'Sangat aman. Kami menggunakan rekening bersama internal dan memverifikasi data penjual sebelum diserahkan.', order_num: 1 },
          { id: 'f-2', question: 'Bagaimana metode pembayarannya?', answer: 'Kami mendukung transfer bank lokal, e-wallet utama (Dana, OVO, GoPay), serta sistem QRIS otomatis.', order_num: 2 }
        ]);
      } else if (tableName === 'testimonials') {
        data = getMockData('testimonials', [
          { id: 't-1', name: 'RIZZXITERS SAJA', avatar_url: '', rating: 5, review: 'Beli akun FF di sini bener-bener rekomen banget! Proses cepat cuma 5 menit langsung dapet data login lengkap.', game_name: 'Free Fire', created_at: new Date().toISOString() }
        ]);
      } else if (tableName === 'settings') {
        data = getMockData('settings', [
          { key: 'whatsapp_number', value: '628123456789' },
          { key: 'site_name', value: 'Rendy R JB' },
          { key: 'site_title', value: 'Rendy R JB | Jual Beli Akun Game Premium & Terpercaya' },
          { key: 'site_tagline', value: 'Marketplace Jual Beli Akun Game Aman dan Terpercaya' },
          { key: 'site_description', value: 'Rendy R JB adalah tempat terpercaya untuk jual beli akun game Mobile Legends, Free Fire, Valorant dengan harga murah, proses cepat, dan jaminan keamanan 100%.' }
        ]);
      } else if (tableName === 'analytics_daily') {
        data = getMockData('analytics_daily', [
          { date: new Date().toISOString().split('T')[0], page_views: 120, whatsapp_clicks: 15 }
        ]);
      }

      // Apply key/column filters if any
      if (this._filterColumn && this._filterValue !== undefined) {
        data = data.filter((row: any) => {
          return row[this._filterColumn] === this._filterValue || row.key === this._filterValue;
        });
      }

      // Convert to single object resolver if requested (.single() or .maybeSingle())
      let resolvedData = data;
      if (this._isSingle) {
        resolvedData = data.length > 0 ? data[0] : null;
      }

      return Promise.resolve(onfulfilled({ 
        data: resolvedData, 
        error: null, 
        count: Array.isArray(resolvedData) ? resolvedData.length : (resolvedData ? 1 : 0) 
      }));
    }
  };

  const methods = ['select', 'insert', 'update', 'delete', 'order', 'limit', 'eq', 'neq', 'gt', 'lt', 'like', 'ilike', 'or', 'and', 'single', 'maybeSingle', 'csv'];
  
  methods.forEach(method => {
    chain[method] = function(...args: any[]) {
      if (method === 'single' || method === 'maybeSingle') {
        chain._isSingle = true;
      } else if (method === 'insert') {
        const rows = args[0];
        const tableData = getMockStore(tableName);
        const newRows = (Array.isArray(rows) ? rows : [rows]).map(row => ({
          id: row.id || 'mock-id-' + Math.random().toString(36).substring(2, 9),
          created_at: new Date().toISOString(),
          ...row
        }));
        tableData.push(...newRows);
        setMockStore(tableName, tableData);
      } else if (method === 'update') {
        chain._updateValues = args[0];
      } else if (method === 'delete') {
        chain._isDelete = true;
      } else if (method === 'eq') {
        const [column, value] = args;
        chain._filterColumn = column;
        chain._filterValue = value;

        // Apply mutations immediately if filters match
        if (chain._updateValues) {
          const tableData = getMockStore(tableName);
          const updated = tableData.map((row: any) => {
            if (row[column] === value || row.key === value) {
              return { ...row, ...chain._updateValues };
            }
            return row;
          });
          setMockStore(tableName, updated);
        } else if (chain._isDelete) {
          const tableData = getMockStore(tableName);
          const filtered = tableData.filter((row: any) => {
            return row[column] !== value && row.key !== value;
          });
          setMockStore(tableName, filtered);
        }
      }
      return chain;
    };
  });

  return chain;
}

const uploadedFilesMap = new Map<string, string>();

const mockStorage = {
  from(bucketName: string) {
    return {
      async upload(filePath: string, file: File, options?: any) {
        if (typeof window !== 'undefined') {
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('filePath', filePath);

            const res = await fetch('/api/mock-upload', {
              method: 'POST',
              body: formData
            });

            if (!res.ok) throw new Error('Local upload failed');
            const data = await res.json();
            
            // Store path to memory map
            uploadedFilesMap.set(filePath, data.publicUrl);
          } catch (e) {
            console.error('Local mock upload failed:', e);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 200));
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
