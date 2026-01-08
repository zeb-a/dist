const base = (() => {
  // Always use the environment variable if set
  if (import.meta.env.VITE_BACKEND_URL) {
    const url = import.meta.env.VITE_BACKEND_URL;
    // Ensure /api is in the URL
    if (!url.includes('/api')) {
      return url.replace(/\/$/, '') + '/api';
    }
    return url;
  }
  
  if (import.meta.env.DEV) {
    // Dev mode: use relative path (proxied by Vite)
    return '/api';
  }
  
  // Production: use full URL to PocketBase
  return 'http://127.0.0.1:4002/api';
})();

function getToken() {
  return localStorage.getItem('class123_pb_token') || null;
}

async function pbRequest(path, opts = {}) {
  const url = `${base.replace(/\/$/, '')}${path}`;
  const headers = opts.headers || {};
  const token = getToken();
  if (token) headers['Authorization'] = token;
  opts.headers = { 'Content-Type': 'application/json', ...headers };
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `request-failed:${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export default {
  async ping() {
    try {
      return await pbRequest('/health');
    } catch {
      return { ok: false };
    }
  },
  
  async register({ email, password, name }) {
    try {
      const user = await pbRequest('/collections/users/records', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          passwordConfirm: password,
          name: name || email
        })
      });
      
      // Request email verification
      try {
        await pbRequest('/collections/users/request-verification', {
          method: 'POST',
          body: JSON.stringify({ email })
        });
      } catch (e) {
        console.log('Verification email failed to send:', e.message);
      }
      
      return { 
        user: { email: user.email, name: user.name, id: user.id },
        message: 'Account created! Please check your email to verify your account.'
      };
    } catch (err) {
      throw err;
    }
  },

  async login({ email, password }) {
    const auth = await pbRequest('/collections/users/auth-with-password', {
      method: 'POST',
      body: JSON.stringify({ identity: email, password })
    });
    
    // For now, allow login regardless of verification status
    // PocketBase uses 'verified' field, not 'emailVerified'
    // if (!auth.record?.verified) {
    //   const err = new Error('Email not verified');
    //   err.status = 403;
    //   err.body = { message: 'Please verify your email first.' };
    //   throw err;
    // }
    
    if (auth.token) {
      localStorage.setItem('class123_pb_token', auth.token);
    }
    return { user: { email: auth.record.email, name: auth.record.name, id: auth.record.id }, token: auth.token };
  },

  async forgotPassword(email) {
    return await pbRequest('/collections/users/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async verifyEmail(token) {
    return await pbRequest('/collections/users/confirm-verification', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },

  async updateProfile({ name, avatar, password, oldPassword }) {
    const token = getToken();
    if (!token) throw new Error('not_authenticated');
    
    const body = { name, avatar };
    if (password) {
      body.password = password;
      body.passwordConfirm = password;
      body.oldPassword = oldPassword;
    }
    
    // Get current user from token
    const me = await pbRequest('/collections/users/me');
    
    const updated = await pbRequest(`/collections/users/records/${me.id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
    
    return { user: { email: updated.email, name: updated.name, avatar: updated.avatar } };
  },

  async getBehaviors() {
    try {
      const res = await pbRequest('/collections/behaviors/records?perPage=500');
      const items = res.items || [];
      // Parse type field if it's a JSON string
      return items.map(b => ({
        ...b,
        type: typeof b.type === 'string' && b.type.startsWith('[') ? JSON.parse(b.type)[0] : b.type
      }));
    } catch (err) {
      console.error('[BEHAVIORS] Load error:', err.message);
      throw err;
    }
  },

  async saveBehaviors(arr) {
    try {
      // Get existing behaviors
      const existing = await pbRequest('/collections/behaviors/records?perPage=500');
      const existingMap = new Map((existing.items || []).map(b => [b.label, b]));
      
      // Update or create
      for (const behavior of arr) {
        const existingRecord = existingMap.get(behavior.label);
        if (existingRecord && existingRecord.id) {
          // Update existing
          try {
            await pbRequest(`/collections/behaviors/records/${existingRecord.id}`, {
              method: 'PATCH',
              body: JSON.stringify({
                label: behavior.label,
                pts: behavior.pts,
                type: behavior.type,
                icon: behavior.icon
              })
            });
            existingMap.delete(behavior.label);
          } catch (e) {
            console.error('[BEHAVIORS] Update error:', e.message);
          }
        } else {
          // Create new
          try {
            await pbRequest('/collections/behaviors/records', {
              method: 'POST',
              body: JSON.stringify({
                label: behavior.label,
                pts: behavior.pts,
                type: behavior.type,
                icon: behavior.icon
              })
            });
          } catch (e) {
            console.error('[BEHAVIORS] Create error:', e.message);
          }
        }
      }
      
      // Delete ones not in arr
      for (const [label, item] of existingMap) {
        if (!arr.find(b => b.label === label) && item.id) {
          try {
            await pbRequest(`/collections/behaviors/records/${item.id}`, { method: 'DELETE' });
          } catch (e) {
            console.error('[BEHAVIORS] Delete error:', e.message);
          }
        }
      }
      
      return arr;
    } catch (err) {
      console.error('[BEHAVIORS] Save error:', err.message);
      throw err;
    }
  },

  async getClasses(email) {
    try {
      const res = await pbRequest('/collections/classes/records?perPage=500');
      const classes = (res.items || []).filter(c => c.teacher === email);
      
      // Parse JSON fields if they're strings
      return classes.map(c => ({
        ...c,
        students: typeof c.students === 'string' ? JSON.parse(c.students || '[]') : (c.students || []),
        tasks: typeof c.tasks === 'string' ? JSON.parse(c.tasks || '[]') : (c.tasks || [])
      }));
    } catch (err) {
      console.error('[CLASSES] Load error:', err.message);
      throw err;
    }
  },

  async saveClasses(email, arr) {
    try {
      // Get existing classes for this teacher
      const existing = await pbRequest('/collections/classes/records?perPage=500');
      const userClasses = (existing.items || []).filter(c => c.teacher === email);
      const byId = new Map(userClasses.map(c => [c.id, c]));
      
      console.log('[API] Saving classes for', email, '- incoming:', arr.map(c => ({ name: c.name, id: c.id })));
      console.log('[API] Existing in DB:', userClasses.map(c => ({ name: c.name, id: c.id })));
      
      const processedIds = new Set();
      
      // Process each incoming class
      for (const cls of arr) {
        // Only match by ID if this class has one (it was loaded from server)
        if (cls.id && byId.has(cls.id)) {
          const serverRecord = byId.get(cls.id);
          processedIds.add(cls.id);
          try {
            console.log('[API] Updating class', cls.name, 'ID:', cls.id);
            await pbRequest(`/collections/classes/records/${cls.id}`, {
              method: 'PATCH',
              body: JSON.stringify({
                name: cls.name,
                teacher: email,
                students: JSON.stringify(cls.students || []),
                tasks: JSON.stringify(cls.tasks || [])
              })
            });
          } catch (e) {
            console.error('[API] Update failed:', e.message);
          }
        } else {
          // Create new ONLY if class has no ID
          try {
            console.log('[API] Creating class', cls.name);
            const created = await pbRequest('/collections/classes/records', {
              method: 'POST',
              body: JSON.stringify({
                name: cls.name,
                teacher: email,
                students: JSON.stringify(cls.students || []),
                tasks: JSON.stringify(cls.tasks || [])
              })
            });
            processedIds.add(created.id);
            console.log('[API] Created with ID:', created.id);
          } catch (e) {
            console.error('[API] Create failed:', e.message);
          }
        }
      }
      
      // Delete records that are not in the incoming array
      for (const [id, item] of byId) {
        if (!processedIds.has(id)) {
          console.log('[API] Deleting class', item.name, 'ID:', id);
          try {
            await pbRequest(`/collections/classes/records/${id}`, { method: 'DELETE' });
          } catch (e) {
            console.error('[API] Delete failed:', e.message);
          }
        }
      }
      
      return arr;
    } catch (err) {
      console.error('[API] Save error:', err.message);
      throw err;
    }
  },

  setToken(token) {
    if (token) localStorage.setItem('class123_pb_token', token);
    else localStorage.removeItem('class123_pb_token');
  }
};
