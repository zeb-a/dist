import React, { useState } from 'react';
import { dicebearAvatar, fallbackInitialsDataUrl } from '../utils/avatar';
import { X, Camera } from 'lucide-react';
import SafeAvatar from './SafeAvatar';

export default function AddStudentModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('boy');
  const [uploadedAvatar, setUploadedAvatar] = useState(null);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const defaultSeeds = ['Alex','Sam','Riley','Jordan','Taylor'];

  // AUTOMATIC GENDER DETECTION: Changes seed based on choice
  // 'adventurer' set allows for short hair (boy style) or long hair seeds
// Change your avatarUrl lines to look like this:
  const avatarUrl = uploadedAvatar || (selectedSeed ? dicebearAvatar(selectedSeed, gender) : (name ? dicebearAvatar(name, gender) : fallbackInitialsDataUrl(gender === 'boy' ? 'B' : 'G')));

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>Enrol New Student</h3>
          {/* THE X BUTTON YOU REQUESTED */}
          <button style={styles.closeBtn} onClick={onClose}><X /></button>
        </div>

        <div style={styles.avatarSection}>
          <div style={styles.previewContainer}>
            <img src={avatarUrl} alt="Preview" style={styles.previewImg} onError={(e) => { e.target.onerror = null; e.target.src = fallbackInitialsDataUrl(name); }} />
            <div style={{ marginTop: 12 }}>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setUploadedAvatar(reader.result);
                reader.readAsDataURL(file);
              }} />
            </div>
            <div style={styles.cameraBadge}><Camera size={14} /></div>
          </div>
          
          {/* GENDER CHOICE BUTTONS */}
          <div style={styles.genderToggle}>
            <button 
              onClick={() => setGender('boy')} 
              style={gender === 'boy' ? styles.genderActive : styles.genderInactive}
            >
              Boy
            </button>
            <button 
              onClick={() => setGender('girl')} 
              style={gender === 'girl' ? styles.genderActive : styles.genderInactive}
            >
              Girl
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {defaultSeeds.map(seed => (
              <div key={seed} onClick={() => { setSelectedSeed(seed); setUploadedAvatar(null); }} style={{ cursor: 'pointer', border: selectedSeed === seed ? '2px solid #4CAF50' : '2px solid transparent', borderRadius: 8, padding: 2 }}>
                <SafeAvatar src={dicebearAvatar(seed, gender)} name={seed} alt={seed} style={{ width: 56, height: 56, borderRadius: 8 }} />
              </div>
            ))}
          </div>
        </div>

        <input 
          style={styles.input} 
          placeholder="Student's Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div style={styles.footer}>
          {/* CANCEL BUTTON */}
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.saveBtn} onClick={() => onSave({ name, gender, avatar: avatarUrl })}>Add Student</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: 'white', padding: '30px', borderRadius: '24px', width: '380px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '25px' },
  previewContainer: { position: 'relative', marginBottom: '20px' },
  previewImg: { width: '100px', height: '100px', borderRadius: '50%', background: '#F8FAFC', border: '3px solid #E2E8F0' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, background: '#4CAF50', color: 'white', padding: '6px', borderRadius: '50%' },
  genderToggle: { display: 'flex', background: '#F1F5F9', borderRadius: '12px', padding: '4px', width: '100%' },
  genderActive: { flex: 1, border: 'none', background: 'white', padding: '10px', borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' },
  genderInactive: { flex: 1, border: 'none', background: 'transparent', padding: '10px', color: '#64748B', cursor: 'pointer' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '25px', outline: 'none' },
  footer: { display: 'flex', gap: '12px' },
  cancelBtn: { flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontWeight: 'bold' },
  saveBtn: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#4CAF50', color: 'white', cursor: 'pointer', fontWeight: 'bold' }
};