import React, { useState } from 'react';
import { Plus, LogOut, X } from 'lucide-react';
import { dicebearAvatar, fallbackInitialsDataUrl } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';

export default function TeacherPortal({ user, classes, onSelectClass, onAddClass, onLogout, onEditProfile }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassAvatar, setNewClassAvatar] = useState(null);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const defaultSeeds = ['Alex','Sam','Riley','Jordan','Taylor'];

  const handleCreateClass = () => {
    if (!newClassName.trim()) return;
    
    const newClass = {
      id: Date.now(),
      name: newClassName,
      students: [], // Starts empty
      avatar: newClassAvatar || (selectedSeed ? dicebearAvatar(selectedSeed) : dicebearAvatar(newClassName || 'class')),
      stats: { stars: 0, eggs: 0 }
    };
    
    onAddClass(newClass);
    setNewClassName('');
    setNewClassAvatar(null);
    setShowAddModal(false);
  };

  return (
    <div style={{ ...styles.container, fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system' }}>
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* show logged-in user (compact) */}
          {user && (
            <div style={{ marginLeft: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{(user.name || user.email || '').charAt(0).toUpperCase()}</div>
              <div style={{ fontWeight: 700 }}>{user.name || user.email}</div>
              <button onClick={onEditProfile} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#4CAF50', fontWeight: 700 }}>Edit Profile</button>
            </div>
          )}
        </div>
        <button onClick={onLogout} style={{ ...styles.logoutBtn, background: 'transparent', border: '1px solid #E6EEF2', padding: '8px 12px' }}><LogOut size={16}/> Logout</button>
      </nav>

      <main style={styles.main}>
        <div style={styles.header}>
          <h2>My Classes</h2>
          <button onClick={() => setShowAddModal(true)} style={styles.addClassBtn}>
            <Plus size={20} /> Add Class
          </button>
        </div>

        <div style={styles.grid}>
          {(classes || []).map((cls) => (
            <div key={cls.id} onClick={() => onSelectClass(cls.id)} style={styles.classCard}>
              <div style={styles.classIcon}>
                <SafeAvatar src={cls.avatar || dicebearAvatar(cls.name || 'class')} name={cls.name} alt={cls.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 12 }} />
              </div>
              <h3>{cls.name}</h3>
              <p>{cls.students.length} Students</p>
            </div>
          ))}
        </div>
      </main>

      {/* ADD CLASS MODAL WITH CANCEL X */}
      {showAddModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Create New Class</h3>
              <X onClick={() => setShowAddModal(false)} style={{cursor: 'pointer'}} />
            </div>
            <input 
              style={styles.input}
              placeholder="e.g. 4th Grade Math" 
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SafeAvatar src={newClassAvatar || dicebearAvatar(newClassName || 'class')} name={newClassName} alt="class" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setNewClassAvatar(reader.result);
                reader.readAsDataURL(file);
              }} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
              {defaultSeeds.map(seed => (
                <div key={seed} onClick={() => { setSelectedSeed(seed); setNewClassAvatar(null); }} style={{ cursor: 'pointer', border: selectedSeed === seed ? '2px solid #4CAF50' : '2px solid transparent', borderRadius: 8, padding: 2 }}>
                  <SafeAvatar src={dicebearAvatar(seed)} name={seed} alt={seed} style={{ width: 56, height: 56, borderRadius: 8 }} />
                </div>
              ))}
            </div>
            <button onClick={handleCreateClass} style={styles.saveBtn}>Create Class</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { height: '100vh', background: '#F4F1EA' },
  nav: { padding: '20px 50px', display: 'flex', justifyContent: 'space-between', background: 'white', borderBottom: '1px solid #ddd' },
  logo: { color: '#4CAF50', fontWeight: '900', fontSize: '24px' },
  logoutBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  main: { padding: '50px' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  addClassBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '30px' },
  classCard: { background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: 'white', padding: '30px', borderRadius: '24px', width: '400px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '20px' },
  saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }
};