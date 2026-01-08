import React, { useState } from 'react';
import { Dices, Trophy, Settings, Home, UserPlus, X } from 'lucide-react';
import StudentCard from './StudentCard';
import BehaviorModal from './BehaviorModal';
import LuckyDrawModal from './LuckyDrawModal';
import AddStudentModal from './AddStudentModal';
import { PointAnimation } from './PointAnimation';

export default function ClassDashboard({ user, activeClass, behaviors, onBack, onOpenEggRoad, onOpenSettings, updateClasses, onUpdateBehaviors }) {
  const [isLuckyDrawOpen, setIsLuckyDrawOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [lastClickPos, setLastClickPos] = useState(null);

  const handleGivePoint = (behavior) => {
    // play a short positive tone to give feedback
    try {
      const playPointSound = () => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = behavior.pts > 0 ? 880 : 220;
        g.gain.value = 0.0001;
        o.connect(g);
        g.connect(ctx.destination);
        // ramp the gain quickly
        g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
        o.start();
        setTimeout(() => {
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
          o.stop(ctx.currentTime + 0.18);
          try { ctx.close(); } catch(e){}
        }, 120);
      };
      playPointSound();
    } catch (e) {
      // ignore sound errors
      console.warn('Sound play failed', e);
    }
    const updatedClasses = (prevClasses) => prevClasses.map(cls => {
      if (cls.id === activeClass.id) {
        const updatedStudents = cls.students.map(s => 
          s.id === selectedStudent.id ? { ...s, score: s.score + behavior.pts } : s
        );
        return { ...cls, students: updatedStudents };
      }
      return cls;
    });
    
    updateClasses(updatedClasses);
    // show point animation briefly at the last click position (fallback to center)
    const pos = lastClickPos || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setShowPoint({ visible: true, x: pos.x, y: pos.y, points: behavior.pts, type: behavior.type });
    setTimeout(() => setShowPoint({ visible: false, x: 0, y: 0, points: 1, type: 'wow' }), 900);
    setSelectedStudent(null);
  };

  const [showPoint, setShowPoint] = React.useState({ visible: false, x: 0, y: 0, points: 1, type: 'wow' });

  return (
    <div style={styles.layout}>
      <nav style={styles.sidebar}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#2E7D32' }}>{(user && (user.name || user.email) || '').charAt(0).toUpperCase()}</div>
          <div style={{ fontWeight: 800, fontSize: 12 }}>{user && (user.name || user.email)}</div>
        </div>
        <Home onClick={onBack} style={styles.icon} />
        <Dices onClick={() => setIsLuckyDrawOpen(true)} style={styles.icon} />
        <Trophy onClick={onOpenEggRoad} style={styles.icon} />
        <Settings onClick={onOpenSettings} style={styles.icon} />
      </nav>

      <main style={styles.content}>
        <header style={styles.header}>
          <h2>{activeClass.name}</h2>
        </header>

        <PointAnimation isVisible={showPoint.visible} x={showPoint.x} y={showPoint.y} points={showPoint.points} type={showPoint.type} />

        <div style={styles.studentGrid}>
          {activeClass.students.map(s => (
            <StudentCard key={s.id} student={s} onClick={(stu, rect) => { setSelectedStudent(stu); setLastClickPos(rect); }} />
          ))}
          {/* Add Student tile inside the students grid for better UX */}
          <div style={styles.addStudentTile} onClick={() => setIsAddStudentOpen(true)}>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height: '100%'}}>
              <UserPlus size={28} />
              <div style={{marginTop:8, fontWeight:'700'}}>Add Student</div>
            </div>
          </div>
        </div>
      </main>

      {selectedStudent && (
        <div>
          <BehaviorModal
            student={selectedStudent}
            behaviors={behaviors}
            onClose={() => setSelectedStudent(null)}
            onGivePoint={(behavior) => handleGivePoint(behavior)}
          />
        </div>
      )}

      {isLuckyDrawOpen && <LuckyDrawModal students={activeClass.students} onClose={() => setIsLuckyDrawOpen(false)} onWinner={(s) => { setIsLuckyDrawOpen(false); setSelectedStudent(s); setLastClickPos({ x: window.innerWidth/2, y: window.innerHeight/2 }); }} />}
      
      {isAddStudentOpen && (
        <AddStudentModal 
          onClose={() => setIsAddStudentOpen(false)} 
          onSave={(newStudent) => {
            const updated = (prev) => prev.map(c => 
              c.id === activeClass.id ? { ...c, students: [...c.students, { ...newStudent, id: Date.now(), score: 0 }] } : c
            );
            updateClasses(updated);
            setIsAddStudentOpen(false);
          }} 
        />
      )}
    </div>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', background: '#F4F1EA' },
  sidebar: { width: '80px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '30px 0', borderRight: '1px solid #ddd' },
  icon: { cursor: 'pointer', color: '#636E72' },
  content: { flex: 1, display: 'flex', flexDirection: 'column' },
  header: { padding: '20px 40px', background: 'linear-gradient(90deg,#fff,#F8FFF8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 6px 18px rgba(16,24,40,0.06)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  addBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  studentGrid: { padding: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px', overflowY: 'auto' },
  addStudentTile: { background: 'white', border: '2px dashed #ddd', borderRadius: 16, padding: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: 'white', padding: '30px', borderRadius: '24px', width: '500px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  behaviorGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' },
  behaviorCard: { padding: '15px', border: '1px solid #eee', borderRadius: '15px', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }
};