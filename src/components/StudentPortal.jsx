import React, { useState, useEffect } from 'react';
import {
  X, ArrowRight, Trophy, Star, BookOpen, Ghost, LogOut,
  CheckCircle, Clock, Award, MessageSquare, ChevronLeft
} from 'lucide-react';
import api from '../services/api';
import StudentWorksheetSolver from './StudentWorksheetSolver';

// --- MODERN 2026 STYLES ---
const modernStyles = {
  container: { 
    background: '#F8FAFC', 
    minHeight: '100vh', 
    fontFamily: "'Inter', sans-serif",
    color: '#1A1A1A',
    overflowX: 'hidden'
  },
  portalNav: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    width: '100%',
    padding: '20px 40px',
    borderBottom: '1px solid #E2E8F0',
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '16px',
    border: 'none',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.3s ease'
  },
  logoutBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
  },
  portalContainer: { 
    height: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    background: '#F8FAFC' 
  },
  glassCard: { 
    width: '400px', 
    background: '#fff', 
    padding: '50px', 
    borderRadius: '32px', 
    textAlign: 'center', 
    boxShadow: '0 20px 60px rgba(0,0,0,0.05)', 
    border: '1px solid #E2E8F0' 
  },
  iconCircle: { 
    width: '70px', 
    height: '70px', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: '0 auto 15px',
    background: '#E0F2F1'
  },
  codeField: { 
    fontSize: '40px', 
    width: '100%', 
    textAlign: 'center', 
    border: 'none', 
    fontWeight: 900, 
    letterSpacing: '8px', 
    marginBottom: '20px', 
    color: '#1A1A1A',
    background: '#F8FAFC',
    padding: '10px',
    borderRadius: '12px'
  },
  ghostBtn: { 
    background: 'none', 
    border: 'none', 
    marginTop: '15px', 
    color: '#64748B', 
    fontWeight: 700, 
    cursor: 'pointer' 
  },
  errorMsg: { 
    color: '#EF4444', 
    fontSize: '13px', 
    fontWeight: 700, 
    marginBottom: '10px' 
  },
  mainCta: { 
    background: '#1A1A1A', 
    color: '#fff', 
    border: 'none', 
    padding: '18px 36px', 
    borderRadius: '16px', 
    fontSize: '16px', 
    fontWeight: 700, 
    cursor: 'pointer', 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '10px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    width: '100%',
    justifyContent: 'center'
  },
  authForm: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '15px' 
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px'
  },
  statCard: { 
    background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
    padding: '24px',
    borderRadius: '24px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
    minWidth: '240px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  statCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
  },
  statVal: { 
    fontSize: '28px', 
    fontWeight: 900, 
    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  statLabel: { 
    fontSize: '14px', 
    color: '#64748B', 
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  sectionHeader: {
    fontSize: '28px',
    fontWeight: 900,
    marginBottom: '20px',
    color: '#1E293B',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  assignmentsGrid: {
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
    gap: '28px',
    marginTop: '20px'
  },
  assignmentCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '28px',
    borderRadius: '28px',
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    position: 'relative',
    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden'
  },
  assignmentCardHover: {
    transform: 'translateY(-8px) scale(1.02)',
    border: '1px solid #6366F1',
    boxShadow: '0 20px 40px -10px rgba(99, 102, 241, 0.15)'
  },
  assignmentIconContainer: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
    borderRadius: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative'
  },
  deleteButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: '#fff',
    border: '1px solid #F1F5F9',
    borderRadius: '14px',
    padding: '10px',
    cursor: 'pointer',
    color: '#94A3B8',
    zIndex: 10,
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
  },
  deleteButtonHover: {
    background: '#FEE2E2',
    color: '#EF4444',
    transform: 'scale(1.1)',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
  },
  assignmentContent: {
    flex: 1
  },
  assignmentTitle: {
    margin: '0 0 6px 0',
    fontSize: '20px',
    fontWeight: 900,
    color: '#1E293B',
    transition: 'color 0.3s'
  },
  assignmentDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  assignmentMeta: {
    fontSize: '14px',
    color: '#64748B',
    fontWeight: 600
  },
  statusBadge: {
    fontSize: '13px',
    color: '#4F46E5',
    fontWeight: 800,
    padding: '4px 12px',
    borderRadius: '20px',
    background: 'rgba(79, 70, 229, 0.1)'
  },
  arrowIcon: {
    color: '#4F46E5',
    opacity: 0.3,
    transition: 'opacity 0.3s'
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5
  },
  completedIcon: {
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '15px',
    borderRadius: '50%',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  }
};

const StudentPortal = ({ onBack, classes, setClasses, refreshClasses }) => {
  const [studentData, setStudentData] = useState(() => {
    // Get student data from localStorage
    const saved = localStorage.getItem('class123_student_portal');
    return saved ? JSON.parse(saved) : null;
  });
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeWorksheet, setActiveWorksheet] = useState(null);
  const [completedAssignments, setCompletedAssignments] = useState(() => {
    // Load completed assignments from localStorage
    const saved = localStorage.getItem('class123_completed_assignments');
    return saved ? JSON.parse(saved) : [];
  });

  // Effect to force re-render when classes change to update assignments
  useEffect(() => {
    // This useEffect will cause the component to re-render when classes change
    // which will update the studentAssignments calculation
  }, [classes]);

  // Normalize student ID for comparison
  const normalizeStudentId = (id) => {
    if (id === undefined || id === null) return '';
    return String(id).trim();
  };

  // Find the live class data
  // This ensures that when a teacher publishes, the student sees it immediately.
  // Use normalized ID comparison to handle string/number mismatches
  // First try to find by classId if available, otherwise find by studentId
  let liveClassData = null;
  
  // If student data has a classId, try to find the class by ID first
  if (studentData?.classId) {
    liveClassData = classes?.find(c => String(c.id) === String(studentData.classId));
  }
  
  // If not found by classId or no classId available, find by student ID
  if (!liveClassData) {
    liveClassData = classes?.find(c =>
      c.students?.some(s => normalizeStudentId(s.id) === normalizeStudentId(studentData?.studentId))
    );
  }

  // Filter assignments to only show those assigned to this student
  // If assignedToAll is true, all students can see it
  const studentAssignments = liveClassData?.assignments?.filter(assignment => {
    if (assignment.assignedToAll === true || assignment.assignedTo === 'all') {
      return true;
    }
    // If specific students are assigned, check if current student is in the list
    // Handle potential type mismatches (string vs number IDs) and normalization
    if (Array.isArray(assignment.assignedTo) && assignment.assignedTo.length > 0) {
      const normalizedStudentId = normalizeStudentId(studentData?.studentId);
      return assignment.assignedTo.some(id => normalizeStudentId(id) === normalizedStudentId);
    }
    // Default: show the assignment
    return true;
  }) || [];

  // Force a re-render when assignments change by using a key that depends on the assignments
  const assignmentsKey = JSON.stringify(studentAssignments.map(a => a.id));

  // Handle worksheet completion
  const handleWorksheetComplete = (worksheetId) => {
    const newCompleted = [...completedAssignments, worksheetId];
    setCompletedAssignments(newCompleted);
    localStorage.setItem('class123_completed_assignments', JSON.stringify(newCompleted));
  };

  // Handle assignment deletion (only if completed)
  const handleDeleteAssignment = (assignment) => {
    if (completedAssignments.includes(assignment.id)) {
      if (window.confirm("Are you sure you want to remove this completed task?")) {
        // Remove the assignment from the classes state
        const updatedClasses = classes.map(cls => ({
          ...cls,
          assignments: cls.assignments ? cls.assignments.filter(a => a.id !== assignment.id) : []
        }));

        setClasses(updatedClasses);
        
        // Update local storage as well
        const userEmail = localStorage.getItem('class123_user_email');
        if (userEmail) {
          const key = `class123_data_${userEmail}`;
          localStorage.setItem(key, JSON.stringify(updatedClasses));
        }
        
        // Update the local storage copy of student data if needed
        const storedStudentData = localStorage.getItem('class123_student_portal');
        if (storedStudentData) {
          const parsedData = JSON.parse(storedStudentData);
          localStorage.setItem('class123_student_portal', JSON.stringify(parsedData));
        }
      }
    } else {
      alert("You can only remove assignments after completing them!");
    }
  };

  // Handle login with access code
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (accessCode.length < 5) return setError('Enter 5-digit code.');
    setLoading(true);

    try {
      // 1. First, look for the student in your LOCAL classes prop (The reliable way)
      let foundStudent = null;
      let foundClass = null;

      classes.forEach(c => {
        const student = c.students?.find(s => s.accessCode === accessCode);
        if (student) {
          foundStudent = student;
          foundClass = c;
        }
      });

      if (foundStudent) {
        const studentInfo = {
          studentId: foundStudent.id,
          studentName: foundStudent.name,
          score: foundStudent.score || 0,
          classId: foundClass.id  // Store the class ID to help locate the class later
        };
        
        setStudentData(studentInfo);
        localStorage.setItem('class123_student_portal', JSON.stringify(studentInfo));
        setLoading(false);
        return; // Stop here, we found them!
      }

      // 2. If not found locally, try the API (Original logic)
      const data = await api.getStudentByCode(accessCode, 'student');
      if (data) {
        setStudentData(data);
        localStorage.setItem('class123_student_portal', JSON.stringify(data));
      } else {
        setError(`Invalid student code.`);
      }
    } catch (err) {
      // If the API fails but we didn't find them locally, show the error
      setError('Student not found in any class.');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('class123_student_portal');
    localStorage.removeItem('class123_completed_assignments');
    setStudentData(null);
    setAccessCode('');
  };

  // If solving a worksheet
  if (activeWorksheet) {
    return (
      <StudentWorksheetSolver
        worksheet={activeWorksheet}
        onClose={() => setActiveWorksheet(null)}
        studentName={studentData?.studentName}
        studentId={studentData?.studentId}
        classId={liveClassData?.id}
        classes={classes}
        setClasses={setClasses}
        onCompletion={handleWorksheetComplete}
      />
    );
  }

  // If not logged in, show access code form
  if (!studentData) {
    return (
      <div style={modernStyles.portalContainer}>
        <div style={modernStyles.glassCard}>
          <div style={{ ...modernStyles.iconCircle, background: '#E0F2F1' }}>
            <BookOpen size={30} color="#009688" />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '24px', margin: '10px 0' }}>Student Portal</h2>
          <p style={{ color: '#64748B', marginBottom: '25px' }}>Enter your 5-digit access code.</p>
          <form onSubmit={handleLogin} style={modernStyles.authForm}>
            <input
              type="text"
              maxLength={5}
              style={modernStyles.codeField}
              placeholder="•••••"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.replace(/[^0-9]/g, ''))}
            />
            {error && <p style={modernStyles.errorMsg}>{error}</p>}
            <button type="submit" disabled={loading} style={modernStyles.mainCta}>
              {loading ? 'Verifying...' : 'View Dashboard'}
            </button>
            <button type="button" onClick={onBack} style={modernStyles.ghostBtn}>Back to Home</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={modernStyles.container}>
      {/* Top Navigation Bar */}
      <div style={modernStyles.portalNav}>
        <h2 style={{ margin: 0, fontWeight: 900, fontSize: '24px', color: '#1E293B' }}>
          {studentData.studentName}
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={refreshClasses}
            style={{...modernStyles.logoutBtn, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'}}
            onMouseEnter={(e) => Object.assign(e.target.style, {...modernStyles.logoutBtn, ...modernStyles.logoutBtnHover, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'})}
            onMouseLeave={(e) => Object.assign(e.target.style, {...modernStyles.logoutBtn, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'})}
          >
            <Clock size={18} style={{ marginRight: '8px' }} />
            Refresh
          </button>
          <button 
            onClick={handleLogout}
            style={modernStyles.logoutBtn}
            onMouseEnter={(e) => Object.assign(e.target.style, modernStyles.logoutBtnHover)}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, modernStyles.logoutBtn);
            }}
          >
            <LogOut size={18} style={{ marginRight: '8px' }} />
            Logout
          </button>
        </div>
      </div>

      <div style={modernStyles.mainContent}>
        {/* STAT CARDS */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <div 
            style={modernStyles.statCard}
            onMouseEnter={(e) => Object.assign(e.target.style, { ...modernStyles.statCard, ...modernStyles.statCardHover })}
            onMouseLeave={(e) => Object.assign(e.target.style, modernStyles.statCard)}
          >
            <Star color="#F59E0B" fill="#F59E0B" size={32} />
            <div>
              <div style={modernStyles.statVal}>{studentData.score || 0}</div>
              <div style={modernStyles.statLabel}>Total Points</div>
            </div>
          </div>
          
          <div 
            style={modernStyles.statCard}
            onMouseEnter={(e) => Object.assign(e.target.style, { ...modernStyles.statCard, ...modernStyles.statCardHover })}
            onMouseLeave={(e) => Object.assign(e.target.style, modernStyles.statCard)}
          >
            <Trophy color="#10B981" fill="#10B981" size={32} />
            <div>
              <div style={modernStyles.statVal}>{completedAssignments.length}</div>
              <div style={modernStyles.statLabel}>Completed</div>
            </div>
          </div>
          
          <div 
            style={modernStyles.statCard}
            onMouseEnter={(e) => Object.assign(e.target.style, { ...modernStyles.statCard, ...modernStyles.statCardHover })}
            onMouseLeave={(e) => Object.assign(e.target.style, modernStyles.statCard)}
          >
            <BookOpen color="#6366F1" size={32} />
            <div>
              <div style={modernStyles.statVal}>{studentAssignments.length - completedAssignments.length}</div>
              <div style={modernStyles.statLabel}>Remaining</div>
            </div>
          </div>
        </div>

        {/* ASSIGNMENTS SECTION */}
        <h3 style={modernStyles.sectionHeader}>
          <BookOpen size={28} color="#6366F1" />
          My Assignments
        </h3>
        
        <div key={assignmentsKey} style={modernStyles.assignmentsGrid}>
          {studentAssignments.map((assignment) => {
            const isCompleted = completedAssignments.includes(assignment.id);
            
            return (
              <div
                key={assignment.id}
                onClick={() => {
                  if (!isCompleted) {
                    setActiveWorksheet(assignment);
                  }
                }}
                style={modernStyles.assignmentCard}
                onMouseEnter={(e) => Object.assign(e.target.style, { ...modernStyles.assignmentCard, ...modernStyles.assignmentCardHover })}
                onMouseLeave={(e) => Object.assign(e.target.style, modernStyles.assignmentCard)}
              >
                {/* Delete button - only show for completed assignments */}
                {isCompleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAssignment(assignment);
                    }}
                    style={modernStyles.deleteButton}
                    onMouseEnter={(e) => Object.assign(e.target.style, { ...modernStyles.deleteButton, ...modernStyles.deleteButtonHover })}
                    onMouseLeave={(e) => Object.assign(e.target.style, modernStyles.deleteButton)}
                  >
                    <Ghost size={18} />
                  </button>
                )}
                
                {/* Assignment icon */}
                <div style={modernStyles.assignmentIconContainer}>
                  {isCompleted ? (
                    <CheckCircle size={32} color="#10B981" />
                  ) : (
                    <BookOpen size={32} color="#4F46E5" strokeWidth={2.5} />
                  )}
                </div>

                <div style={modernStyles.assignmentContent}>
                  <h4 style={modernStyles.assignmentTitle}>
                    {assignment.title}
                  </h4>
                  <div style={modernStyles.assignmentDetails}>
                    <span style={modernStyles.assignmentMeta}>
                      {assignment.questions?.length || 0} Questions
                    </span>
                    <div style={{ width: '4px', height: '4px', background: '#CBD5E1', borderRadius: '50%' }} />
                    <span style={modernStyles.statusBadge}>
                      {isCompleted ? 'Completed' : 'Not Started'}
                    </span>
                  </div>
                </div>

                {/* Arrow icon */}
                {!isCompleted && (
                  <div style={modernStyles.arrowIcon}>
                    <ArrowRight size={24} />
                  </div>
                )}

                {/* Completed overlay */}
                {isCompleted && (
                  <div style={modernStyles.completedOverlay}>
                    <div style={modernStyles.completedIcon}>
                      <CheckCircle size={28} color="#10B981" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {studentAssignments.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748B',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '24px',
              border: '2px dashed #E2E8F0'
            }}>
              <BookOpen size={48} color="#94A3B8" style={{ marginBottom: '20px' }} />
              <h3 style={{ margin: '0 0 10px', fontSize: '20px', color: '#475569' }}>No assignments yet!</h3>
              <p style={{ margin: 0, fontSize: '16px' }}>Your teacher hasn't assigned any worksheets yet.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add custom styles for hover effects */}
      <style>{`
        .assignment-card:hover h4 {
          color: #6366F1 !important;
        }
        
        .delete-btn-hover:hover {
          background: #FEE2E2 !important;
          color: #EF4444 !important;
          transform: scale(1.1) !important;
        }
      `}</style>
    </div>
  );
};

export default StudentPortal;