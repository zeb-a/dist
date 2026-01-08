import React, { useState, useEffect, useMemo } from 'react';
import { Users, Trophy, Settings, LayoutGrid, Plus, Home, ChevronLeft, Camera, X, Dices, UserPlus, Trash2, Edit2, Star, LogOut, ArrowRight, GraduationCap, Heart, BookOpen, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import StudentCard from './components/StudentCard';
import BehaviorModal from './components/BehaviorModal';
import { dicebearAvatar, fallbackInitialsDataUrl } from './utils/avatar';

// --- INITIAL DATA ---
const INITIAL_STUDENTS = [
  { id: 1, name: 'Pablo Picasso', gender: 'boy', score: 0, avatar: dicebearAvatar('Pablo Picasso', 'boy') },
  { id: 2, name: 'Marie Curie', gender: 'girl', score: 0, avatar: dicebearAvatar('Marie Curie', 'girl') }
];

const INITIAL_BEHAVIORS = [
  { id: 1, label: 'Helped Friend', pts: 1, type: 'wow', icon: '🤝' },
  { id: 2, label: 'Great Work', pts: 2, type: 'wow', icon: '🌟' },
  { id: 3, label: 'On Task', pts: 1, type: 'wow', icon: '📖' },
  { id: 4, label: 'Kindness', pts: 1, type: 'wow', icon: '❤️' },
  { id: 5, label: 'Noisy', pts: -1, type: 'nono', icon: '📢' },
  { id: 6, label: 'Disruptive', pts: -2, type: 'nono', icon: '⚠️' }
];

// ==========================================
// 1. THE MODERN 2026 LANDING PAGE (Expanded)
// ==========================================
function LandingPage({ onAuthSuccess }) {
  const [modalMode, setModalMode] = useState(null); 
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('class123_users')) || [];
    if (users.find(u => u.email === email)) {
      setError('Email already registered.');
      return;
    }
    const newUser = { email, password, role: selectedRole };
    localStorage.setItem('class123_users', JSON.stringify([...users, newUser]));
    onAuthSuccess(newUser);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('class123_users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) onAuthSuccess(user);
    else setError('Incorrect email or password.');
  };

  return (
    <div style={modernStyles.container}>
      <div style={modernStyles.glow}></div>
      
      {/* Navigation */}
      <nav style={modernStyles.nav}>
        <div style={modernStyles.logo}>Class123 <span style={modernStyles.badge}>2026</span></div>
        <div style={modernStyles.navLinks}>
          <a href="#why" style={modernStyles.anchor}>Why Us</a>
          <a href="#how" style={modernStyles.anchor}>How To</a>
          <button onClick={() => setModalMode('login')} style={modernStyles.loginBtn}>Login</button>
          <button onClick={() => setModalMode('role')} style={modernStyles.signupBtn}>Sign Up Free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={modernStyles.hero}>
        <div style={modernStyles.tagline}>✨ The #1 Classroom Community Platform</div>
        <h1 style={modernStyles.heroTitle}>Engage students like <br/> <span style={modernStyles.gradientText}>never before.</span></h1>
        <p style={modernStyles.heroSub}>A complete ecosystem for teachers to track behavior, gamify learning, and connect with parents instantly.</p>
        <div style={{display:'flex', gap:'15px', justifyContent:'center', marginTop:'30px'}}>
            <button onClick={() => setModalMode('role')} style={modernStyles.mainCta}>Get Started for Free <ArrowRight size={18}/></button>
        </div>
      </section>

      {/* Why Section */}
      <section id="why" style={modernStyles.infoSection}>
        <h2 style={modernStyles.sectionHeading}>Why This is a Great Website</h2>
        <div style={modernStyles.infoGrid}>
            <div style={modernStyles.infoCard}>
                <div style={modernStyles.iconBg}><Zap color="#4CAF50" /></div>
                <h3>Real-time Reward System</h3>
                <p>Instantly recognize student effort with visual and audio feedback that builds confidence.</p>
            </div>
            <div style={modernStyles.infoCard}>
                <div style={modernStyles.iconBg}><Trophy color="#FFD700" /></div>
                <h3>Egg Progress Goals</h3>
                <p>Gamify the whole classroom experience. When the class works together, the egg hatches!</p>
            </div>
            <div style={modernStyles.infoCard}>
                <div style={modernStyles.iconBg}><ShieldCheck color="#2196F3" /></div>
                <h3>Data You Can Trust</h3>
                <p>End-to-end encryption for all student records and teacher communication.</p>
            </div>
        </div>
      </section>

      {/* How To Section */}
      <section id="how" style={modernStyles.howSection}>
          <div style={modernStyles.howContent}>
              <h2 style={{fontSize: '40px', fontWeight: 900}}>How to use Class123</h2>
              <div style={modernStyles.step}>
                  <div style={modernStyles.stepNum}>1</div>
                  <div>
                      <h4>Create your Digital Classroom</h4>
                      <p>Sign up as a teacher and add your students with custom avatars or real photos.</p>
                  </div>
              </div>
              <div style={modernStyles.step}>
                  <div style={modernStyles.stepNum}>2</div>
                  <div>
                      <h4>Award "Wow" & "Nono" Points</h4>
                      <p>Use your dashboard to reinforce positive behaviors during your lessons.</p>
                  </div>
              </div>
              <div style={modernStyles.step}>
                  <div style={modernStyles.stepNum}>3</div>
                  <div>
                      <h4>Automated Reporting</h4>
                      <p>Generate beautiful PDF reports for parents at the click of a button.</p>
                  </div>
              </div>
          </div>
          <div style={modernStyles.howVisual}>
              <div style={modernStyles.mockupCard}>🚀 Class Spirit: 100%</div>
          </div>
      </section>

      {/* Auth Modals */}
      {modalMode && (
        <div style={modernStyles.overlay}>
          <div style={modernStyles.bentoContainer}>
            <div style={modernStyles.modalHeader}>
              <h2 style={{fontWeight: 900}}>{modalMode === 'role' ? 'Choose Account Type' : modalMode === 'signup' ? 'Sign Up' : 'Welcome Back'}</h2>
              <X onClick={() => {setModalMode(null); setError('');}} style={{cursor:'pointer'}} />
            </div>

            {modalMode === 'role' && (
              <div style={modernStyles.bentoGrid}>
                <div onClick={() => {setSelectedRole('teacher'); setModalMode('signup');}} style={modernStyles.bentoCard}>
                  <GraduationCap size={40} color="#4CAF50" />
                  <h3>Teacher</h3>
                  <p>Manage your students.</p>
                </div>
                <div style={{...modernStyles.bentoCard, opacity: 0.6}}>
                  <Heart size={40} color="#FF5252" />
                  <h3>Parent</h3>
                  <p>View student reports.</p>
                </div>
                <div style={{...modernStyles.bentoCard, opacity: 0.6}}>
                  <BookOpen size={40} color="#4DB6AC" />
                  <h3>Student</h3>
                  <p>Track your badges.</p>
                </div>
              </div>
            )}

            {(modalMode === 'signup' || modalMode === 'login') && (
              <form onSubmit={modalMode === 'signup' ? handleSignup : handleLogin} style={modernStyles.authForm}>
                {error && <p style={{color:'red', fontSize:'13px', textAlign:'center'}}>{error}</p>}
                <input type="email" placeholder="Email Address" style={modernStyles.input} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" style={modernStyles.input} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" style={modernStyles.mainCta}>
                  {modalMode === 'signup' ? 'Create My Account' : 'Log Into Dashboard'}
                </button>
                <p style={{textAlign:'center', marginTop: '15px', color: '#666'}}>
                  {modalMode === 'signup' ? 'Already have an account?' : 'New here?'} 
                  <span onClick={() => setModalMode(modalMode === 'signup' ? 'login' : 'role')} style={{color:'#4CAF50', cursor:'pointer', fontWeight:'bold', marginLeft:'5px'}}>
                    {modalMode === 'signup' ? 'Login' : 'Sign Up'}
                  </span>
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. THE TEACHER PORTAL (FULL FEATURES RESTORED)
// ==========================================
function TeacherPortal({ currentUser, handleLogout }) {
  const storageKey = `class123_data_${currentUser.email}`;
  
  const [classes, setClasses] = useState(() => JSON.parse(localStorage.getItem(storageKey)) || []);
  const [behaviors, setBehaviors] = useState(() => JSON.parse(localStorage.getItem('class123_behaviors')) || INITIAL_BEHAVIORS);
  const [currentClassId, setCurrentClassId] = useState(null);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isEditingBehaviors, setIsEditingBehaviors] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showBigCard, setShowBigCard] = useState(null);
  const [isLuckyDraw, setIsLuckyDraw] = useState(false);
  const [luckyWinner, setLuckyWinner] = useState(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState('boy');
  const [tempAvatar, setTempAvatar] = useState(null);
  const [newClassName, setNewClassName] = useState('');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(classes));
    localStorage.setItem('class123_behaviors', JSON.stringify(behaviors));
  }, [classes, behaviors, storageKey]);

  const activeClass = useMemo(() => classes.find(c => c.id === currentClassId), [classes, currentClassId]);
  const currentTotal = useMemo(() => activeClass?.students.reduce((sum, s) => sum + s.score, 0) || 0, [activeClass]);
  const progressPercentage = Math.min((currentTotal / 50) * 100, 100);

  const handleSaveClass = () => {
    if (!newClassName) return;
    const newClass = { id: Date.now(), name: newClassName, grade: 'Grade 1', students: INITIAL_STUDENTS };
    setClasses([...classes, newClass]);
    setIsAddingClass(false);
    setNewClassName('');
  };

  const handleSaveStudent = () => {
    if (!newStudentName) return;
    const avatarUrl = tempAvatar || dicebearAvatar(newStudentName, newStudentGender);
    const updatedClasses = classes.map(c => {
      if (c.id === currentClassId) {
        return { ...c, students: [...c.students, { id: Date.now(), name: newStudentName, gender: newStudentGender, avatar: avatarUrl, score: 0 }] };
      }
      return c;
    });
    setClasses(updatedClasses);
    setIsAddingStudent(false);
    setNewStudentName('');
    setTempAvatar(null);
  };

  const handleGivePoint = (studentId, pts, card) => {
    const updatedClasses = classes.map(c => {
      if (c.id === currentClassId) {
        const updatedStudents = c.students.map(s => {
          if (studentId === 'all' || s.id === studentId) return { ...s, score: Math.max(0, s.score + pts) };
          return s;
        });
        return { ...c, students: updatedStudents };
      }
      return c;
    });
    setClasses(updatedClasses);
    setSelectedStudent(null);
    setIsGroupMode(false);
    const displayStudent = studentId === 'all' 
      ? { name: "Whole Class", avatar: fallbackInitialsDataUrl('Class') }
      : activeClass.students.find(s => s.id === studentId);
    setShowBigCard({ student: displayStudent, card });
    setTimeout(() => setShowBigCard(null), 2500);
  };

  if (!currentClassId) {
    return (
      <div style={styles.lobbyContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <h1 style={{...styles.heroTitle, margin: 0}}>Class123 <span style={{color: '#4CAF50'}}>Lobby</span></h1>
          <button onClick={handleLogout} style={styles.logoutBtn}><LogOut size={18}/> Logout</button>
        </div>
        <div style={styles.grid}>
          {classes.map(c => (
            <div key={c.id} onClick={() => setCurrentClassId(c.id)} style={styles.classCard}>
              <Users size={48} color="#4CAF50" />
              <h3 style={{margin: '15px 0'}}>{c.name}</h3>
              <p style={{color: '#888'}}>{c.students?.length || 0} Students</p>
            </div>
          ))}
          <button onClick={() => setIsAddingClass(true)} style={styles.addClassCard}><Plus size={40} /><br/>Add Class</button>
        </div>
        {isAddingClass && (
          <div style={styles.overlay}>
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}><h2>Create New Class</h2><X onClick={() => setIsAddingClass(false)} style={{cursor: 'pointer'}} /></div>
              <input value={newClassName} onChange={e => setNewClassName(e.target.value)} style={styles.input} placeholder="Class Name (e.g., Homeroom 5A)" />
              <button onClick={handleSaveClass} style={styles.saveBtn}>Create Class</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.appLayout}>
      <nav style={styles.sidebar}>
        <Home onClick={() => setCurrentClassId(null)} style={{cursor: 'pointer', color: '#4CAF50'}} />
        <Dices onClick={() => setIsLuckyDraw(true)} style={{cursor: 'pointer', color: '#FFD700'}} />
        <Settings onClick={() => setIsEditingBehaviors(true)} style={{cursor: 'pointer', color: '#636E72'}} />
        <LogOut onClick={handleLogout} style={{cursor: 'pointer', color: '#FF7675', marginTop: 'auto'}} />
      </nav>
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <header style={styles.header}>
          <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
            <ChevronLeft onClick={() => setCurrentClassId(null)} style={{cursor: 'pointer'}} />
            <h2 style={{margin: 0}}>{activeClass.name}</h2>
          </div>
          <div style={styles.eggWrapper}>
            <div style={styles.goalText}>Goal: {currentTotal}/50</div>
            <div style={styles.eggTrack}>
              <div style={{...styles.eggFill, width: `${progressPercentage}%`}}></div>
              <div style={{...styles.eggIcon, left: `calc(${progressPercentage}% - 20px)`}}>
                {currentTotal >= 50 ? '🐣' : '🥚'}
                <span style={styles.eggCounter}>{currentTotal}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsGroupMode(true)} style={styles.groupBtn}><Users size={18} /> Class Point</button>
        </header>

        <div style={{ padding: '30px', overflowY: 'auto', flex: 1 }}>
          <div style={styles.grid}>
            {activeClass.students.map(s => (
              <StudentCard key={s.id} student={s} onClick={(st) => setSelectedStudent(st)} />
            ))}
          </div>
        </div>

        <button onClick={() => setIsAddingStudent(true)} style={styles.fab}><UserPlus size={28} /></button>

        {/* RESTORED ADD STUDENT MODAL WITH AVATAR PICKER */}
        {isAddingStudent && (
          <div style={styles.overlay}>
            <div style={styles.modalCard}>
              <div style={styles.modalHeader}><h2>Enrol Student</h2> <X onClick={() => setIsAddingStudent(false)} style={{cursor: 'pointer'}} /></div>
              
              {/* Avatar Picker Section */}
              <div style={styles.avatarPickerContainer}>
                <div style={styles.mainAvatarPreview}>
                     <img src={tempAvatar || dicebearAvatar(newStudentName || 'new', newStudentGender)} 
                       style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="preview" />
                  <label style={styles.cameraIcon}>
                    <Camera size={18} />
                    <input type="file" hidden onChange={(e) => {
                        const reader = new FileReader();
                        reader.onload = () => setTempAvatar(reader.result);
                        reader.readAsDataURL(e.target.files[0]);
                    }} />
                  </label>
                </div>
              </div>

              {/* Gender Toggle */}
              <div style={styles.genderToggle}>
                <button onClick={() => setNewStudentGender('boy')} style={newStudentGender === 'boy' ? styles.genderActive : styles.genderInactive}>Boy</button>
                <button onClick={() => setNewStudentGender('girl')} style={newStudentGender === 'girl' ? styles.genderActive : styles.genderInactive}>Girl</button>
              </div>

              <input value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Full Name" style={styles.input} />
              <button onClick={handleSaveStudent} style={styles.saveBtn}>Add to Class</button>
            </div>
          </div>
        )}

        {showBigCard && (
          <div style={styles.bigCardOverlay}>
             <div style={styles.bigCardContent}>
                <div style={{fontSize: '6rem', marginBottom: '20px'}}>{showBigCard.card.icon}</div>
                <h1 style={{fontSize: '3.5rem', margin: '0 0 20px 0', color: showBigCard.card.type === 'wow' ? '#4CAF50' : '#F44336'}}>{showBigCard.card.label}</h1>
                <img src={showBigCard.student.avatar} style={styles.bigCardAvatar} />
                <h2 style={{fontSize: '2.5rem', margin: '20px 0'}}>{showBigCard.student.name}</h2>
             </div>
          </div>
        )}

        {selectedStudent && <BehaviorModal student={selectedStudent} behaviors={behaviors} onClose={() => setSelectedStudent(null)} onGivePoint={handleGivePoint} />}
        {isGroupMode && <BehaviorModal student={{ name: "Whole Class", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=class", score: currentTotal }} behaviors={behaviors} onClose={() => setIsGroupMode(false)} onGivePoint={(id, pts, card) => handleGivePoint('all', pts, card)} />}
      </main>
    </div>
  );
}

// ==========================================
// 3. MAIN APP (THE TRAFFIC CONTROLLER)
// ==========================================
export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('class123_logged_in')) || null);

  const handleAuth = (userData) => {
    localStorage.setItem('class123_logged_in', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('class123_logged_in');
    setUser(null);
  };

  if (!user) return <LandingPage onAuthSuccess={handleAuth} />;
  return <TeacherPortal currentUser={user} handleLogout={handleLogout} />;
}

// --- STYLES ---
const modernStyles = {
  container: { height: '100vh', background: '#fff', fontFamily: 'system-ui', overflowY: 'auto' },
  glow: { position: 'fixed', top: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at 50% -20%, #e8f5e9, transparent)', pointerEvents: 'none' },
  nav: { padding: '20px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 },
  logo: { fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' },
  badge: { fontSize: '10px', background: '#000', color: '#fff', padding: '2px 8px', borderRadius: '10px', verticalAlign: 'middle' },
  navLinks: { display: 'flex', gap: '30px', alignItems: 'center' },
  anchor: { textDecoration: 'none', color: '#444', fontWeight: '500' },
  loginBtn: { background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  signupBtn: { background: '#1a1a1b', color: '#fff', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  hero: { textAlign: 'center', padding: '100px 20px' },
  tagline: { color: '#4CAF50', fontWeight: 'bold', marginBottom: '15px' },
  heroTitle: { fontSize: '75px', fontWeight: '900', lineHeight: 1.1, letterSpacing: '-3px' },
  gradientText: { background: 'linear-gradient(90deg, #4CAF50, #2E7D32)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSub: { fontSize: '20px', color: '#666', maxWidth: '600px', margin: '20px auto' },
  mainCta: { background: '#000', color: '#fff', padding: '18px 35px', borderRadius: '15px', fontSize: '18px', fontWeight: 'bold', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px' },
  infoSection: { padding: '80px', background: '#f9f9f9' },
  sectionHeading: { textAlign: 'center', fontSize: '40px', fontWeight: '900', marginBottom: '50px' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' },
  infoCard: { background: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  iconBg: { width: '50px', height: '50px', background: '#f5f5f5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  howSection: { padding: '80px', display: 'flex', gap: '50px', alignItems: 'center' },
  howContent: { flex: 1 },
  step: { display: 'flex', gap: '20px', marginBottom: '30px' },
  stepNum: { minWidth: '40px', height: '40px', background: '#4CAF50', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  howVisual: { flex: 1, height: '350px', background: '#eee', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mockupCard: { background: '#fff', padding: '20px 40px', borderRadius: '15px', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  bentoContainer: { width: '700px', background: '#fff', padding: '50px', borderRadius: '35px', boxShadow: '0 30px 60px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px' },
  bentoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' },
  bentoCard: { background: '#f5f5f7', padding: '30px', borderRadius: '25px', cursor: 'pointer', textAlign: 'center' },
  authForm: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '15px', borderRadius: '12px', border: '1px solid #ddd', fontSize: '16px' }
};

const styles = {
  lobbyContainer: { padding: '60px', background: '#F4F1EA', minHeight: '100vh' },
  heroTitle: { fontSize: '2.5rem', fontWeight: '900' },
  logoutBtn: { padding: '10px 15px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' },
  classCard: { background: 'white', padding: '30px', borderRadius: '30px', textAlign: 'center', cursor: 'pointer' },
  addClassCard: { border: '2px dashed #ccc', borderRadius: '30px', height: '180px', cursor: 'pointer', background: 'transparent' },
  appLayout: { display: 'flex', height: '100vh', background: '#F4F1EA' },
  sidebar: { width: '80px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '40px' },
  header: { padding: '20px 40px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  groupBtn: { background: '#4CAF50', color: 'white', padding: '10px 20px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  eggTrack: { width: '200px', height: '12px', background: '#eee', borderRadius: '10px', position: 'relative' },
  eggFill: { height: '100%', background: '#4CAF50', borderRadius: '10px' },
  eggIcon: { position: 'absolute', top: '-15px', fontSize: '1.5rem' },
  eggCounter: { position: 'absolute', top: '15px', fontSize: '10px', fontWeight: 'bold' },
  fab: { position: 'absolute', bottom: '40px', right: '40px', width: '60px', height: '60px', borderRadius: '50%', background: '#4CAF50', color: '#fff', border: 'none', cursor: 'pointer' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { background: 'white', padding: '40px', borderRadius: '30px', width: '400px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  avatarPickerContainer: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  mainAvatarPreview: { width: '100px', height: '100px', borderRadius: '50%', background: '#f0f0f0', position: 'relative' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, background: '#4CAF50', color: '#fff', padding: '5px', borderRadius: '50%', cursor: 'pointer' },
  genderToggle: { display: 'flex', background: '#f0f0f0', borderRadius: '10px', padding: '5px', marginBottom: '20px' },
  genderActive: { flex: 1, background: '#fff', border: 'none', padding: '8px', borderRadius: '8px', fontWeight: 'bold' },
  genderInactive: { flex: 1, background: 'transparent', border: 'none', padding: '8px', color: '#888' },
  input: { width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '15px' },
  saveBtn: { width: '100%', padding: '15px', background: '#4CAF50', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' },
  bigCardOverlay: { position: 'fixed', inset: 0, background: '#fff', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bigCardContent: { textAlign: 'center' },
  bigCardAvatar: { width: '250px', borderRadius: '50%' }
};