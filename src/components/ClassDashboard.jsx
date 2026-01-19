import React, { useEffect, useState } from 'react';
import {
  Dices, Trophy, Settings, Home, UserPlus, Camera,
  ChevronLeft, ChevronRight, Sliders, ChevronDown,
  CheckSquare, BarChart2, QrCode, ClipboardList, Inbox,
  Plus, Send, CheckCircle, X, Clock
} from 'lucide-react';
import ReportsPage from './ReportsPage';
import StudentCard from './StudentCard';
import BehaviorModal from './BehaviorModal';
import LuckyDrawModal from './LuckyDrawModal';
import AddStudentModal from './AddStudentModal';
import SafeAvatar from './SafeAvatar';
import AssignmentSubmissionNotification from './AssignmentSubmissionNotification';
import { PointAnimation } from './PointAnimation';
import { boringAvatar, AVATAR_OPTIONS, avatarByCharacter } from '../utils/avatar';
import api from '../services/api';
import InboxPage from './InboxPage'; // ⚡ NEW IMPORT: Ensure this file exists
import KidTimer from './KidTimer';

// Helper component for Sidebar Icons
const SidebarIcon = ({ icon: Icon, label, onClick, isActive, badge, style }) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon
        onClick={onClick}
        style={{ ...style, color: isActive ? '#4CAF50' : style?.color || '#636E72' }}
      />
      {badge}
      {hovered && (
        <div style={{
          position: 'absolute',
          left: '60px', // Pushes it to the right of the sidebar
          top: '50%',
          transform: 'translateY(-50%)',
          background: '#2D3436',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '8px',
          zIndex: 2000,
          whiteSpace: 'nowrap',
          fontSize: '14px',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {label}
        </div>
      )}
    </div>
  );
};

export default function ClassDashboard({
  user,
  activeClass,
  behaviors,
  onBack,
  onOpenEggRoad,
  onOpenSettings,
  updateClasses,
  onUpdateBehaviors,
  onOpenAssignments
}) {
  const [isLuckyDrawOpen, setIsLuckyDrawOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentAvatar, setEditStudentAvatar] = useState(null);
  const [editSelectedSeed, setEditSelectedSeed] = useState(null);
  const [showEditAvatarPicker, setShowEditAvatarPicker] = useState(false);
  const [hoveredEditChar, setHoveredEditChar] = useState(null);
  const [deleteConfirmStudentId, setDeleteConfirmStudentId] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [displaySize, setDisplaySize] = useState('big');
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [showClassBehaviorModal, setShowClassBehaviorModal] = useState(false);
  const [showGridMenu, setShowGridMenu] = useState(false);
  const [showPoint, setShowPoint] = useState({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' });
  const [isAttendanceMode, setIsAttendanceMode] = useState(false);
  const [absentStudents, setAbsentStudents] = useState(new Set());
  const [showReports, setShowReports] = useState(false);
  const [showCodesPage, setShowCodesPage] = useState(false);

  // --- SUBMISSIONS & MESSAGES STATE ---
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard', 'messages'
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // 1. Fetch fresh data from PocketBase
  const fetchFreshSubmissions = async () => {
    if (!activeClass || !activeClass.id) return;
    setLoadingSubmissions(true);
    try {
      const data = await api.pbRequest(
        `/collections/submissions/records?filter=(class_id='${activeClass.id}')&sort=-created`
      );
      setSubmissions(data.items || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // 2. Handle Grading (Passed to InboxPage)
  const handleGradeSubmit = async (submissionId, gradeValue) => {
    try {
      await api.pbRequest(`/collections/submissions/records/${submissionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ grade: gradeValue, status: 'graded' })
      });
      // Refresh local data so the UI updates instantly
      await fetchFreshSubmissions();
    } catch (err) {
      console.error("Grade submit failed", err);
      alert("Failed to save grade. Check console.");
    }
  };

  const generate5DigitCode = () => Math.floor(10000 + Math.random() * 90000).toString();

  useEffect(() => {
    if (!showGridMenu) return;
    const t = setTimeout(() => setShowGridMenu(false), 2000);
    return () => clearTimeout(t);
  }, [showGridMenu]);

  const ensureCodesAndOpen = () => {
    const currentAccessCodes = typeof activeClass.Access_Codes === 'object' && activeClass.Access_Codes !== null
      ? activeClass.Access_Codes
      : {};

    let needsUpdate = false;
    const updatedCodesObject = { ...currentAccessCodes };

    activeClass.students.forEach(s => {
      if (!updatedCodesObject[s.id]) {
        needsUpdate = true;
        updatedCodesObject[s.id] = {
          parentCode: generate5DigitCode(),
          studentCode: generate5DigitCode()
        };
      }
    });

    if (needsUpdate) {
      updateClasses(prev => prev.map(c =>
        c.id === activeClass.id ? { ...c, Access_Codes: updatedCodesObject } : c
      ));
    }
    setShowCodesPage(true);
  };

  // --- STUDENT MANAGEMENT HANDLERS ---
  const handleEditStudent = (student) => {
    setEditingStudentId(student.id);
    setEditStudentName(student.name || '');
    setEditStudentAvatar(student.avatar || null);
    setEditSelectedSeed(null);
  };

  const handleSaveStudentEdit = () => {
    if (!editStudentName.trim()) return;
    const finalAvatar =
      editStudentAvatar || (editSelectedSeed ? avatarByCharacter(editSelectedSeed) : undefined);

    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) =>
              s.id === editingStudentId ? { ...s, name: editStudentName, avatar: finalAvatar } : s
            )
          }
          : c
      )
    );

    setEditingStudentId(null);
    setEditStudentName('');
    setEditStudentAvatar(null);
    setEditSelectedSeed(null);
  };

  const handleDeleteStudent = (student) => {
    updateClasses((prev) =>
      prev.map((c) => {
        if (c.id === activeClass.id) {
          const updatedCodes = { ...(c.Access_Codes || {}) };
          delete updatedCodes[student.id];
          return {
            ...c,
            students: c.students.filter((s) => s.id !== student.id),
            Access_Codes: updatedCodes
          };
        }
        return c;
      })
    );
    setDeleteConfirmStudentId(null);
  };

  const handleGivePoint = (behavior) => {
    if (!selectedStudent) return;
    const today = new Date().toISOString().split('T')[0];
    if (selectedStudent.attendance === 'absent' && selectedStudent.attendanceDate === today) {
      return;
    }
    setShowPoint({ visible: true, student: selectedStudent, points: behavior.pts, behaviorEmoji: behavior.icon || '⭐' });
    setTimeout(() => setShowPoint({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' }), 2000);
    updateClasses((prev) =>
      prev.map((c) =>
        c.id === activeClass.id
          ? {
            ...c,
            students: c.students.map((s) => {
              if (s.id === selectedStudent.id) {
                const newLog = {
                  label: behavior.label,
                  pts: behavior.pts,
                  type: behavior.type,
                  timestamp: new Date().toISOString()
                };
                return {
                  ...s,
                  score: s.score + behavior.pts,
                  history: [...(s.history || []), newLog]
                };
              }
              return s;
            })
          }
          : c
      )
    );
    setSelectedStudent(null);
  };

  const handleGivePointsToClass = (behavior) => {
    setShowPoint({ visible: true, student: { name: 'Whole Class', students: activeClass.students }, points: behavior.pts, behaviorEmoji: behavior.icon || '⭐' });
    setTimeout(() => setShowPoint({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' }), 2000);
    updateClasses((prev) =>
      prev.map((c) => (c.id === activeClass.id ? { ...c, students: c.students.map((s) => ({ ...s, score: s.score + behavior.pts })) } : c))
    );
    setShowClassBehaviorModal(false);
  };

  if (!activeClass) return <div style={styles.layout}>No class selected</div>;

  // --- CONDITIONAL RENDERS FOR SUB-PAGES ---

  if (showReports) {
    return <ReportsPage
      activeClass={activeClass}
      onBack={() => {
        setShowReports(false);
        updateClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, isViewingReports: false } : c));
      }}
    />;
  }

  if (showCodesPage) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', padding: '40px', minHeight: '100vh', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#2D3436' }}> Student Access Codes</h1>
          <button onClick={() => setShowCodesPage(false)} style={{ ...styles.addBtn, background: '#636E72' }}>Back</button>
        </header>
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#475569' }}>Student Name</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#475569' }}>Parent Code</th>
                <th style={{ padding: '16px 24px', fontWeight: '700', color: '#475569' }}>Student Code</th>
              </tr>
            </thead>
            <tbody>
              {activeClass.students.map((s) => {
                const codes = (activeClass.Access_Codes && activeClass.Access_Codes[s.id]) || { parentCode: '---', studentCode: '---' };
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 24px', fontWeight: '600', color: '#2D3436' }}>{s.name}</td>
                    <td style={{ padding: '16px 24px' }}><span style={{ fontFamily: 'monospace', background: '#E8F5E9', color: '#2E7D32', padding: '4px 10px', borderRadius: '6px', fontSize: '15px' }}>{codes.parentCode}</span></td>
                    <td style={{ padding: '16px 24px' }}><span style={{ fontFamily: 'monospace', background: '#E3F2FD', color: '#1565C0', padding: '4px 10px', borderRadius: '6px', fontSize: '15px' }}>{codes.studentCode}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={styles.layout}>
        {/* --- SIDEBAR --- */}
        <nav
          style={{
            ...styles.sidebar,
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            zIndex: 1000,
            transform: sidebarVisible ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            boxShadow: sidebarVisible ? '0 0 20px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {/* User Initial Circle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#2E7D32' }}>
              {(user && (user.name || user.email) || '').charAt(0).toUpperCase()}
            </div>
          </div>

          <SidebarIcon
            icon={Home}
            label="Back to Dashboard"
            onClick={() => { onBack(); setViewMode('dashboard'); }}
            style={styles.icon}
          />

          <SidebarIcon
            icon={ClipboardList}
            label="Assignment Studio"
            onClick={onOpenAssignments}
            style={styles.icon}
          />

          <SidebarIcon
            icon={Inbox}
            label="Messages & Grading"
            onClick={() => {
              setViewMode('messages');      // 1. Switch the view
              fetchFreshSubmissions();     // 2. Refresh data
            }}
            isActive={viewMode === 'messages'}
            style={styles.icon}
            badge={(
              <>
                {submissions.filter(s => s.status === 'submitted').length > 0 && (
                  <span style={styles.badge}>
                    {submissions.filter(s => s.status === 'submitted').length}
                  </span>
                )}
              </>
            )}
          />

          <SidebarIcon
            icon={Dices}
            label="Lucky Draw"
            onClick={() => setIsLuckyDrawOpen(true)}
            style={styles.icon}
          />

          <SidebarIcon
            icon={Trophy}
            label="Egg Road"
            onClick={onOpenEggRoad}
            style={styles.icon}
          />

          <SidebarIcon
            icon={CheckSquare}
            label="Attendance"
            onClick={() => setIsAttendanceMode(!isAttendanceMode)}
            isActive={isAttendanceMode}
            style={styles.icon}
          />

          <SidebarIcon
            icon={Settings}
            label="Settings"
            onClick={onOpenSettings}
            style={styles.icon}
          />

          <SidebarIcon
            icon={QrCode}
            label="Access Codes"
            onClick={ensureCodesAndOpen}
            style={styles.icon}
          />

          <SidebarIcon
            icon={BarChart2}
            label="Reports"
            onClick={() => { setShowReports(true); updateClasses(prev => prev.map(c => c.id === activeClass.id ? { ...c, isViewingReports: true } : c)); }}
            style={styles.icon}
          />
          <SidebarIcon
            icon={Clock}
            label="Class Timer"
            onClick={() => setViewMode('timer')}
            isActive={viewMode === 'timer'}
            style={styles.icon}
          />
        </nav>

        {viewMode !== 'messages' && (
          <button
            onClick={() => setSidebarVisible(!sidebarVisible)}
            style={{
              position: 'fixed',
              left: sidebarVisible ? '80px' : '0',
              top: '20px',
              zIndex: 1001,
              background: 'white',
              border: 'none',
              borderRadius: '0 8px 8px 0',
              width: '28px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            {sidebarVisible ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        )}

       <main style={{ ...styles.content, marginLeft: sidebarVisible ? '80px' : '0', transition: 'margin-left 0.3s ease' }}>

  {/* 1. MESSAGES VIEW */}
  {viewMode === 'messages' ? (
    <InboxPage
      activeClass={activeClass}
      submissions={submissions}
      onGradeSubmit={handleGradeSubmit}
      onBack={() => setViewMode('dashboard')}
    />
  ) /* 2. ⚡ WIDER TIMER VIEW ⚡ */
 : viewMode === 'timer' ? (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100%', 
    background: '#F4F1EA',
    padding: '40px' 
  }}>
    <div style={{ 
      width: '100%', 
      maxWidth: '800px', // Much wider container
      background: 'white', 
      padding: '60px', 
      borderRadius: '40px', 
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ 
        background: '#EEF2FF', 
        padding: '12px 24px', 
        borderRadius: '20px', 
        color: '#4F46E5', 
        fontWeight: '800', 
        marginBottom: '40px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Clock size={20} /> CLASS TIMER
      </div>
      
      {/* The Updated KidTimer handles the width internally now */}
      <KidTimer onComplete={() => ("Time is up! 🎉")} />
    
    </div>
  </div>
) : (
    /* 3. STANDARD DASHBOARD VIEW (Default) */
    <>
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="30" height="30">
            <defs>
              <linearGradient id="dashboardLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
              </linearGradient>
            </defs>
            <circle cx="15" cy="15" r="14" fill="url(#dashboardLogoGrad)" />
            <text x="15" y="19" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">A</text>
          </svg>
          <h2>{activeClass.name} {isAttendanceMode && <span style={{ fontSize: '0.8em', color: '#FF9800', fontWeight: 'bold' }}>- ATTENDANCE MODE</span>}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          {isAttendanceMode && (
            <button
              onClick={() => {
                updateClasses((prev) => prev.map((c) => c.id === activeClass.id ? { ...c, students: c.students.map((s) => ({ ...s, attendance: absentStudents.has(s.id) ? 'absent' : 'present', attendanceDate: new Date().toISOString().split('T')[0] })) } : c));
                setIsAttendanceMode(false);
                setAbsentStudents(new Set());
              }}
              style={styles.actionBtn}
            >
              ✓ Save Attendance
            </button>
          )}
          {/* Assignment Notification */}
          <AssignmentSubmissionNotification
            onNotificationClick={(notification) => {
              setViewMode('messages');
              fetchFreshSubmissions();
            }}
          />
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowGridMenu(!showGridMenu)} style={styles.actionBtn}>
              <Sliders size={18} /> Display
            </button>
            {showGridMenu && (
              <div style={styles.gridMenu}>
                {[{ size: 'small', label: 'Small' }, { size: 'medium', label: 'Medium' }, { size: 'big', label: 'Big' }].map((option) => (
                  <button key={option.size} onClick={() => { setDisplaySize(option.size); setShowGridMenu(false); }} style={{ ...styles.gridOption, background: displaySize === option.size ? '#4CAF50' : '#f5f5f5', color: displaySize === option.size ? 'white' : '#2D3436' }}>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setShowClassBehaviorModal(true)} style={styles.actionBtn}>
            <span style={{ fontSize: '1.2rem' }}>👥</span> Whole Class
          </button>
        </div>
      </header>

      <div className="student-cards-container" style={{ display: 'grid', gap: displaySize === 'small' ? '12px' : '28px', gridTemplateColumns: `repeat(auto-fill, minmax(${displaySize === 'small' ? '150px' : displaySize === 'medium' ? '180px' : '220px'}, 1fr))`, padding: '10px', overflowY: 'auto', flex: 1, maxWidth: '100%', justifyContent: 'start' }}>
        {activeClass.students.map((s) => {
          const today = new Date().toISOString().split('T')[0];
          const isAbsentToday = absentStudents.has(s.id) || (s.attendance === 'absent' && s.attendanceDate === today);
          return (
            <div
              key={s.id}
              onClick={(event) => {
                if (isAttendanceMode) {
                  const next = new Set(absentStudents);
                  if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                  setAbsentStudents(next);
                } else if (event?.ctrlKey || event?.metaKey) {
                  const next = new Set(selectedStudents);
                  if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                  setSelectedStudents(next);
                } else if (!isAbsentToday) {
                  setSelectedStudent(s);
                }
              }}
              style={{
                position: 'relative',
                opacity: isAttendanceMode ? (isAbsentToday ? 0.4 : 1) : (isAbsentToday ? 0.4 : (selectedStudents.size > 0 && !selectedStudents.has(s.id) ? 0.5 : 1)),
                transition: 'opacity 0.15s, filter 0.15s',
                cursor: isAttendanceMode ? 'pointer' : isAbsentToday ? 'not-allowed' : 'default',
                filter: isAbsentToday ? 'grayscale(1)' : 'grayscale(0)',
                pointerEvents: 'auto'
              }}
            >
              <StudentCard student={s} onClick={() => { if (isAttendanceMode) { const next = new Set(absentStudents); if (next.has(s.id)) next.delete(s.id); else next.add(s.id); setAbsentStudents(next); } else if (!isAbsentToday) { setSelectedStudent(s); } }} onEdit={handleEditStudent} onDelete={() => setDeleteConfirmStudentId(s.id)} />
              {selectedStudents.has(s.id) && <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', border: '3px solid #4CAF50', pointerEvents: 'none' }} />}
              {isAbsentToday && !isAttendanceMode && <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', border: '3px solid #FF9800', background: 'rgba(255, 152, 0, 0.1)', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>ABSENT TODAY</div>}
            </div>
          );
        })}
        <div style={{ position: 'relative', minWidth: 0, aspectRatio: '1 / 1', display: 'flex' }}>
          <div onClick={() => setIsAddStudentOpen(true)} className="add-student-button" style={{ background: 'white', border: '2px dashed #ddd', borderRadius: 16, padding: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', transition: 'transform 0.2s' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <UserPlus size={28} />
              <div style={{ marginTop: 8, fontWeight: '700' }}>Add Student</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )}
</main>
        {/* MODALS */}
        {selectedStudent && <BehaviorModal student={selectedStudent} behaviors={behaviors} onClose={() => setSelectedStudent(null)} onGivePoint={handleGivePoint} />}
        {showClassBehaviorModal && <BehaviorModal student={{ name: 'Whole Class' }} behaviors={behaviors} onClose={() => setShowClassBehaviorModal(false)} onGivePoint={handleGivePointsToClass} />}
        {isLuckyDrawOpen && <LuckyDrawModal students={activeClass.students} onClose={() => setIsLuckyDrawOpen(false)} onWinner={(s) => { setIsLuckyDrawOpen(false); setSelectedStudent(s); }} />}

        {/* ⚡ OLD GRADING MODAL IS GONE - CLEANER CODE! ⚡ */}

        {isAddStudentOpen && (
          <AddStudentModal
            onClose={() => setIsAddStudentOpen(false)}
            onSave={(newStudent) => {
              const studentId = Date.now();
              const newCodes = { parentCode: generate5DigitCode(), studentCode: generate5DigitCode() };
              updateClasses((prev) => prev.map((c) => c.id === activeClass.id ? { ...c, students: [...c.students, { ...newStudent, id: studentId, score: 0 }], Access_Codes: { ...(c.Access_Codes || {}), [studentId]: newCodes } } : c));
              setIsAddStudentOpen(false);
            }}
          />
        )}

        {/* EDIT STUDENT MODAL */}
        {editingStudentId && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h3 style={{ marginBottom: 16 }}>Edit Student</h3>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
                <SafeAvatar src={editStudentAvatar || (editSelectedSeed ? avatarByCharacter(editSelectedSeed) : boringAvatar(editStudentName || 'anon', 'boy'))} name={editStudentName} alt={editStudentName} style={{ width: 100, height: 100, borderRadius: 50, objectFit: 'cover', background: '#F8FAFC' }} />
                <div style={{ marginTop: 10 }}><Camera size={14} /></div>
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onload = () => { setEditStudentAvatar(reader.result); setEditSelectedSeed(null); }; reader.readAsDataURL(file); } }} style={{ marginTop: 12 }} />
                <div style={{ marginTop: 12, position: 'relative' }}>
                  <button onClick={() => setShowEditAvatarPicker(!showEditAvatarPicker)} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 500, color: '#475569', transition: 'all 0.2s' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{editSelectedSeed ? (<><img src={avatarByCharacter(editSelectedSeed)} alt={editSelectedSeed} style={{ width: 24, height: 24, borderRadius: 4 }} /><span style={{ textTransform: 'capitalize' }}>{editSelectedSeed}</span></>) : ('Choose character...')}</span>
                    <ChevronDown size={18} style={{ transform: showEditAvatarPicker ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                  </button>
                  {showEditAvatarPicker && (
                    <div style={{ position: 'absolute', bottom: '100%', left: '-110%', right: '-110%', marginBottom: '8px', background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1001, padding: '16px', minWidth: '550px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', justifyItems: 'center', width: '100%' }}>
                        {AVATAR_OPTIONS.map((char) => (
                          <button key={char.name} onClick={() => { setEditSelectedSeed(char.name); setEditStudentAvatar(null); setShowEditAvatarPicker(false); }} onMouseEnter={() => setHoveredEditChar(char.name)} onMouseLeave={() => setHoveredEditChar(null)} style={{ background: 'white', border: editSelectedSeed === char.name ? '2px solid #4CAF50' : '2px solid #e9ecef', borderRadius: 10, padding: 8, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 9, color: '#666', fontWeight: 500, outline: 'none', width: '70px', justifySelf: 'center', ...(hoveredEditChar === char.name ? { transform: 'scale(1.15)', zIndex: 10, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' } : {}), ...(editSelectedSeed === char.name ? { boxShadow: '0 0 0 3px rgba(76, 175, 80, 0.1)' } : {}) }} title={char.label}>
                            <img src={avatarByCharacter(char.name)} alt={char.label} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', ...(hoveredEditChar === char.name ? { transform: 'scale(5)', position: 'absolute', bottom: 'calc(100% - 80px)', left: '50%', marginLeft: '-20px', zIndex: 20 } : {}) }} />
                            <span style={{ fontSize: 8, color: '#999', textTransform: 'capitalize' }}>{char.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <input autoFocus placeholder="Student name" value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: 12 }} onKeyDown={(e) => e.key === 'Enter' && handleSaveStudentEdit()} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setEditingStudentId(null); setEditStudentName(''); setEditStudentAvatar(null); setEditSelectedSeed(null); }} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveStudentEdit} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#4CAF50', color: 'white' }}>Save</button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirmStudentId && (
          <div style={styles.overlay}>
            <div style={{ ...styles.modal, width: 360 }}>
              <h3 style={{ marginBottom: 12 }}>Delete Student?</h3>
              <p style={{ color: '#666' }}>Are you sure you want to delete <strong>'{activeClass.students.find((s) => s.id === deleteConfirmStudentId)?.name}'</strong>?</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={() => setDeleteConfirmStudentId(null)} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white' }}>Cancel</button>
                <button onClick={() => handleDeleteStudent(activeClass.students.find((s) => s.id === deleteConfirmStudentId))} style={{ flex: 1, padding: 10, borderRadius: 8, border: 'none', background: '#FF6B6B', color: 'white' }}>Delete</button>
              </div>
            </div>
          </div>
        )}

        <PointAnimation isVisible={showPoint.visible} studentAvatar={showPoint.student?.avatar} studentName={showPoint.student?.name} students={showPoint.student?.students} points={showPoint.points} behaviorEmoji={showPoint.behaviorEmoji} onComplete={() => setShowPoint({ visible: false, student: null, points: 1, behaviorEmoji: '⭐' })} />
      </div>
    </>
  );
}

const styles = {
  layout: { display: 'flex', height: '100vh', background: '#F4F1EA', position: 'relative', overflow: 'hidden' },
  sidebar: { width: '80px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', padding: '30px 0', borderRight: '1px solid #ddd' },
  icon: { cursor: 'pointer', transition: 'color 0.2s', position: 'relative' },
  content: { flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease', height: '100vh', overflowY: 'auto' },
  header: { padding: '20px 40px', background: 'linear-gradient(90deg,#fff,#F8FFF8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', boxShadow: '0 6px 18px rgba(16,24,40,0.06)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  addBtn: { background: '#4CAF50', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  gridMenu: { position: 'absolute', top: '50px', right: 0, background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: '220px' },
  gridOption: { display: 'block', width: '100%', textAlign: 'left', padding: '10px', marginBottom: 6, borderRadius: 8, cursor: 'pointer', border: '1px solid #ddd' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modal: { background: 'white', padding: '24px', borderRadius: '16px', width: '500px' },
  badge: { position: 'absolute', top: '-5px', right: '-5px', background: '#FF5252', color: 'white', width: '18px', height: '18px', borderRadius: '50%', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  // NOTE: I removed styles specific to the deleted MessagesView (messageCard, gradeBtn, etc.) to keep this clean.
};