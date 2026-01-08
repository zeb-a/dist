import React, { useState } from 'react';
import { ChevronLeft, Trash2, Edit2, Plus, Users, LayoutGrid, X, Save } from 'lucide-react';
import { dicebearAvatar, fallbackInitialsDataUrl } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';

export default function SettingsPage({ activeClass, behaviors, onBack, onUpdateBehaviors, onUpdateStudents }) {
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' | 'students' | 'general'
  const [cards, setCards] = useState(Array.isArray(behaviors) ? behaviors : []);
  const [students, setStudents] = useState(Array.isArray(activeClass?.students) ? activeClass.students : []);
  const [editingCardId, setEditingCardId] = useState(null);
  const [editingCard, setEditingCard] = useState({ label: '', pts: 0 });
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingStudentName, setEditingStudentName] = useState('');
  const [editingStudentAvatar, setEditingStudentAvatar] = useState(null);

  React.useEffect(() => setCards(Array.isArray(behaviors) ? behaviors : []), [behaviors]);
  React.useEffect(() => setStudents(Array.isArray(activeClass?.students) ? activeClass.students : []), [activeClass]);

  const handleSaveCard = (id) => {
    const updated = cards.map(c => c.id === id ? { ...c, label: editingCard.label, pts: Number(editingCard.pts) } : c);
    setCards(updated);
    setEditingCardId(null);
    onUpdateBehaviors && onUpdateBehaviors(updated);
  };

  const handleDeleteCard = (id) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    onUpdateBehaviors && onUpdateBehaviors(updated);
  };

  const handleSaveStudent = (id) => {
    const updated = students.map(s => s.id === id ? { ...s, name: editingStudentName, avatar: editingStudentAvatar || s.avatar } : s);
    setStudents(updated);
    setEditingStudentId(null);
    setEditingStudentAvatar(null);
    onUpdateStudents && onUpdateStudents(updated);
  };

  const handleDeleteStudent = (id) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    onUpdateStudents && onUpdateStudents(updated);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Top Navigation Bar */}
      <header style={styles.header}>
        <div style={styles.headerLeft} onClick={onBack}>
          <ChevronLeft size={24} />
          <h2 style={{ margin: 0 }}>Class Settings: {activeClass.name}</h2>
        </div>
        <button style={styles.doneBtn} onClick={onBack}>Done</button>
      </header>

      <div style={styles.mainLayout}>
        {/* Settings Sidebar */}
        <aside style={styles.sidebar}>
          <button 
            onClick={() => setActiveTab('cards')} 
            style={activeTab === 'cards' ? styles.tabActive : styles.tab}
          >
            <LayoutGrid size={20} /> Behavior Cards
          </button>
          <button 
            onClick={() => setActiveTab('students')} 
            style={activeTab === 'students' ? styles.tabActive : styles.tab}
          >
            <Users size={20} /> Manage Students
          </button>
        </aside>

        {/* Dynamic Content Area */}
        <main style={styles.content}>
          {activeTab === 'cards' ? (
            <section>
              <div style={styles.sectionHeader}>
                <h3>Behavior Point Cards</h3>
                <button
                  style={styles.addBtn}
                  onClick={() => {
                    const newCard = { id: Date.now(), label: 'New Card', pts: 1, type: 'wow', icon: '🌟' };
                    const updated = [newCard, ...cards];
                    setCards(updated);
                    setEditingCardId(newCard.id);
                    setEditingCard({ label: newCard.label, pts: newCard.pts });
                    onUpdateBehaviors && onUpdateBehaviors(updated);
                  }}
                ><Plus size={18}/> Add Card</button>
              </div>
              <div style={styles.cardList}>
                {cards.map(card => (
                  <div key={card.id} style={styles.settingItem}>
                    <div style={styles.itemInfo}>
                      <span style={styles.itemIcon}>{card.icon}</span>
                      <div>
                        {editingCardId === card.id ? (
                          <div>
                            <input value={editingCard.label} onChange={(e) => setEditingCard(prev => ({ ...prev, label: e.target.value }))} />
                            <input value={editingCard.pts} onChange={(e) => setEditingCard(prev => ({ ...prev, pts: e.target.value }))} style={{ width: 60, marginLeft: 8 }} />
                          </div>
                        ) : (
                          <div>
                            <div style={styles.itemLabel}>{card.label}</div>
                            <div style={{ color: card.pts > 0 ? '#4CAF50' : '#F44336' }}>{card.pts > 0 ? '+' : ''}{card.pts} Points</div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={styles.itemActions}>
                      {editingCardId === card.id ? (
                        <>
                          <button onClick={() => handleSaveCard(card.id)} style={{ ...styles.addBtn, padding: '6px 10px' }}>Save</button>
                          <button onClick={() => setEditingCardId(null)} style={{ ...styles.addBtn, padding: '6px 10px', marginLeft: 8 }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingCardId(card.id); setEditingCard({ label: card.label, pts: card.pts }); }} style={styles.actionIcon}>Edit</button>
                          <button onClick={() => handleDeleteCard(card.id)} style={{ ...styles.actionIcon, color: '#FF7675' }}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <div style={styles.sectionHeader}>
                <h3>Student Roster</h3>
                <p style={{ color: '#666' }}>Modify names or change avatars for your students.</p>
              </div>
              <div style={styles.cardList}>
                {students.map(student => (
                  <div key={student.id} style={styles.settingItem}>
                    <div style={styles.itemInfo}>
                      <SafeAvatar src={student.avatar || dicebearAvatar(student.name, student.gender)} name={student.name} alt="avatar" style={styles.miniAvatar} />
                      <div>
                        {editingStudentId === student.id ? (
                          <div>
                            <input value={editingStudentName} onChange={(e) => setEditingStudentName(e.target.value)} />
                            <div style={{ marginTop: 8 }}>
                              <input type="file" accept="image/*" onChange={(e) => {
                                const file = e.target.files && e.target.files[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => setEditingStudentAvatar(reader.result);
                                reader.readAsDataURL(file);
                              }} />
                            </div>
                          </div>
                        ) : (
                          <span style={styles.itemLabel}>{student.name}</span>
                        )}
                      </div>
                    </div>
                    <div style={styles.itemActions}>
                      {editingStudentId === student.id ? (
                          <>
                          <button onClick={() => handleSaveStudent(student.id)} style={{ ...styles.addBtn, padding: '6px 10px' }}>Save</button>
                          <button onClick={() => { setEditingStudentId(null); setEditingStudentAvatar(null); }} style={{ ...styles.addBtn, padding: '6px 10px', marginLeft: 8 }}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingStudentId(student.id); setEditingStudentName(student.name); setEditingStudentAvatar(student.avatar || null); }} style={styles.actionIcon}>Edit</button>
                          <button onClick={() => handleDeleteStudent(student.id)} style={{ ...styles.actionIcon, color: '#FF7675' }}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { height: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' },
  header: { padding: '15px 30px', background: '#fff', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' },
  doneBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  mainLayout: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '260px', background: '#fff', borderRight: '1px solid #E2E8F0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  tab: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: 'transparent', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#64748B' },
  tabActive: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: '#E8F5E9', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', color: '#2E7D32', fontWeight: 'bold' },
  content: { flex: 1, padding: '40px', overflowY: 'auto' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  addBtn: { background: '#f0f0f0', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  cardList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  settingItem: { background: '#fff', padding: '16px 24px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
  itemIcon: { fontSize: '24px' },
  itemLabel: { fontWeight: 'bold', fontSize: '1.1rem' },
  miniAvatar: { width: '45px', height: '45px', borderRadius: '50%', background: '#f5f5f5' },
  itemActions: { display: 'flex', gap: '20px' },
  actionIcon: { cursor: 'pointer', color: '#94A3B8' }
};