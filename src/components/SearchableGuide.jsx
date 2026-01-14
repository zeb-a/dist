import React, { useState, useMemo } from 'react';
import { Search, X, ChevronDown, ChevronUp } from 'lucide-react';

const GUIDE_SECTIONS = {
  portal: [
    {
      id: 'add-class',
      category: 'Getting Started',
      title: '➕ Add a New Class',
      description: 'Create a new classroom',
      steps: [
        'Click the "Add Class" button in the top right',
        'Enter your class name (e.g., "Room 4A", "Class 2B")',
        'Click "Create" to add the class to your list',
        'Select the class to start managing students and behaviors',
      ],
      icon: '📚',
    },
    {
      id: 'profile',
      category: 'Account',
      title: '👤 Update Your Profile',
      description: 'Manage your account settings',
      steps: [
        'Click your profile avatar in the top left corner',
        'View your email and account information',
        'You can update your profile picture by clicking on the avatar',
      ],
      icon: '⚙️',
    },
    {
      id: 'select-class',
      category: 'Getting Started',
      title: '🎓 Select a Class',
      description: 'Open a class to manage students',
      steps: [
        'Your classes appear as cards on the portal',
        'Click any class card to open it',
        'You\'ll see all students in that class',
      ],
      icon: '🎯',
    },
  ],

  // --- UPDATED DASHBOARD GUIDE BASED ON YOUR CLASS DASHBOARD ---
  dashboard: [
    // --- DAILY TOOLS ---
    {
      id: 'attendance',
      category: 'Daily Tools',
      title: '✅ Taking Attendance',
      description: 'Mark students as present or absent',
      steps: [
        'Click the Checkbox icon (CheckSquare) in the sidebar',
        'The top banner will turn orange to indicate "Attendance Mode"',
        'Click on students who are absent (they will fade out and show "ABSENT")',
        'Click "Save Attendance" in the top right header to confirm',
        'Absent students cannot receive points while absent',
      ],
      icon: '📋',
    },
    {
      id: 'give-points',
      category: 'Daily Tools',
      title: '⭐ Giving Points',
      description: 'Award positive or improvement points',
      steps: [
        'Click on a student\'s card',
        'A modal will open showing behavior choices',
        'Select a behavior (e.g., "Helping Others", "On Task")',
        'The points are instantly added to the student\'s score',
        'Animation will play showing the points added',
      ],
      icon: '🏆',
    },
    {
      id: 'whole-class',
      category: 'Daily Tools',
      title: '👥 Whole Class Points',
      description: 'Give points to everyone at once',
      steps: [
        'Click the "Whole Class" button in the top header',
        'Select the behavior to award',
        'Every student present in the class receives the points',
        'Great for group achievements or class-wide good behavior',
      ],
      icon: '🙌',
    },
    {
      id: 'lucky-draw',
      category: 'Daily Tools',
      title: '🎲 Lucky Draw',
      description: 'Pick a random student',
      steps: [
        'Click the Dice icon in the sidebar',
        'The system will shuffle through student avatars',
        'A winner is selected randomly',
        'The winner\'s profile automatically opens so you can award points',
      ],
      icon: '🎰',
    },

   
   // --- GRADING & ASSIGNMENTS ---
    {
      id: 'assignments-create',
      category: 'Grading & Assignments',
      title: '📝 Creating Assignments',
      description: 'Build worksheets and tasks for students',
      steps: [
        'Click the Clipboard icon in the sidebar to open the Studio',
        'Click the "Create New Assignment" button',
        'Enter a title (e.g., "Math Week 1") and choose a question type',
        'Add questions (Short Answer, Choice, Matching, or Story)',
        'Click "Publish" to send the assignment to your class',
      ],
      icon: '📄',
    },
    {
      id: 'assignments-edit',
      category: 'Grading & Assignments',
      title: '⚙️ Managing Assignments',
      description: 'Edit, delete, or review active tasks',
      steps: [
        'Active assignments appear in a list in the Assignments Studio',
        'Click the "Pencil" icon to edit the content of an assignment',
        'Click the "Trash" icon to remove an assignment',
        'The status (e.g., "Published") is shown on the assignment card',
        'Switch between "Individual" or "Whole Class" distribution in the header',
      ],
      icon: '🛠️',
    },
    {
      id: 'inbox-grading',
      category: 'Grading & Assignments',
      title: '📬 Inbox & Grading',
      description: 'Review and grade student submissions',
      steps: [
        'Click the Inbox icon in the sidebar',
        'View the "Needs Grading" column for new submissions',
        'Click "Review & Grade" on a submission',
        'Read the student\'s answer and enter a score',
        'Click "Submit Grade" to update the student\'s total points',
      ],
      icon: '📮',
    },

    // --- CLASS MANAGEMENT ---
    {
      id: 'add-student',
      category: 'Class Management',
      title: '➕ Add Students',
      description: 'Enroll new students to the grid',
      steps: [
        'Scroll to the end of your student grid',
        'Click the large "Add Student" card',
        'Enter the student\'s name and select a gender',
        'A unique access code is automatically generated for them',
      ],
      icon: '👶',
    },
    {
      id: 'edit-student',
      category: 'Class Management',
      title: '✏️ Edit Student Profile',
      description: 'Change avatars or names',
      steps: [
        'Click the "Pencil" icon on any student card',
        'Update their name or upload a custom photo',
        'You can also choose a predefined character avatar',
        'Click "Save" to update their card',
      ],
      icon: '🎨',
    },
    {
      id: 'grid-display',
      category: 'Class Management',
      title: '🖥️ Display Settings',
      description: 'Change the size of student cards',
      steps: [
        'Click the "Display" (Sliders) button in the top header',
        'Choose between Small, Medium, or Big grid sizes',
        'Small is good for large classes, Big is good for visibility',
      ],
      icon: '🔍',
    },
    {
      id: 'access-codes',
      category: 'Administration',
      title: '🔑 Access Codes',
      description: 'Get login codes for parents and students',
      steps: [
        'Click the QR Code icon in the sidebar',
        'View the generated 5-digit Parent and Student codes',
        'These codes allow families to view progress from home',
      ],
      icon: '🔐',
    },
    {
      id: 'reports-link',
      category: 'Administration',
      title: '📊 View Reports',
      description: 'Analyze class performance',
      steps: [
        'Click the Bar Chart icon in the sidebar',
        'Switch to the Reports view to see detailed analytics',
        'View score history and behavior trends',
      ],
      icon: '📈',
    },
  ],

  reports: [
    {
      id: 'switch-view',
      category: 'Navigation',
      title: '📊 Class vs. Individual',
      description: 'Switch between the whole class or one student',
      steps: [
        'Use the "Select Student" dropdown',
        'Choose "All Students" to see everyone at once',
        'Choose "Individual" to focus on one specific person',
      ],
      icon: '🔄',
    },
    {
      id: 'printing',
      category: 'Export',
      title: '🖨️ Print & PDF',
      description: 'Save or print the reports',
      steps: [
        'Click the "Print Reports" button in the top right',
        'The page is optimized to remove the buttons and only print the cards',
        'Select "Save as PDF" in your print settings',
      ],
      icon: '📄',
    },
  ]
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'flex-end',
    zIndex: 2500, // Increased z-index to be above everything
    animation: 'fadeIn 0.2s ease-in-out',
  },
panel: {
    background: '#ffffff',
    width: '100%',
    maxWidth: '480px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.05)', // Softer shadow
    animation: 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)', // Smoother slide
  },
  header: {
    padding: '24px 20px',
    borderBottom: '1px solid #F1F5F9', // Lighter border
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    margin: 0,
    color: '#0F172A', // Deep navy/slate instead of black
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#636E72',
    transition: 'color 0.2s',
  },
searchContainer: {
    padding: '20px',
    background: '#fff', // Keep it clean white
  },
  searchInput: {
    width: '100%',
    padding: '14px 14px 14px 42px',
    background: '#F8FAFC', // Very light slate
    border: '1px solid #E2E8F0',
    borderRadius: '16px', // Extra rounded
    fontSize: '15px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '0',
    background: '#fff',
  },
  section: {
    borderBottom: '1px solid #f0f0f0',
  },sectionHeader: {
    padding: '20px 20px 10px 20px',
    background: '#fff',
    fontSize: '11px',
    fontWeight: '800',
    color: '#94A3B8', // Muted uppercase look
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  guideItem: {
    margin: '4px 12px',
    padding: '16px',
    borderRadius: '12px', // Make items look like cards
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
  },
  guideItemTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1E293B',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  guideItemDescription: {
    fontSize: '14px',
    color: '#64748B',
    margin: '4px 0 0 32px',
    lineHeight: '1.4',
  },
  steps: {
    padding: '16px 20px 0 52px', // Indent steps to look nested
    fontSize: '14px',
    color: '#4B5563',
    lineHeight: '1.6',
  },
stepItem: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#334155',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
  },
  stepBullet: {
    background: '#F0FDF4',
    color: '#22C55E',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    flexShrink: 0,
    marginTop: '2px',
  },
  noResults: {
    padding: '40px 16px',
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
  },
};

export default function SearchableGuide({ view = 'portal', onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Default to portal if view doesn't exist, but prioritize passed view
  const guides = GUIDE_SECTIONS[view] || GUIDE_SECTIONS.portal;

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return guides;
    
    const query = searchQuery.toLowerCase();
    return guides.filter(guide => 
      guide.title.toLowerCase().includes(query) ||
      guide.description.toLowerCase().includes(query) ||
      guide.category.toLowerCase().includes(query) ||
      guide.steps.some(step => step.toLowerCase().includes(query))
    );
  }, [searchQuery, guides]);

  const groupedGuides = useMemo(() => {
    const grouped = {};
    filteredGuides.forEach(guide => {
      if (!grouped[guide.category]) {
        grouped[guide.category] = [];
      }
      grouped[guide.category].push(guide);
    });
    return grouped;
  }, [filteredGuides]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={styles.container} onClick={onClose}>
      <div style={styles.panel} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>📚 Guide & Help</h2>
          <button 
            style={styles.closeBtn} 
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.color = '#000'}
            onMouseLeave={(e) => e.target.style.color = '#636E72'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div style={styles.searchContainer}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="How do I..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setExpandedId(null); 
              }}
              style={{
                ...styles.searchInput,
                paddingLeft: '38px', // Space for icon
                borderColor: searchQuery ? '#4CAF50' : '#E2E8F0',
                boxShadow: searchQuery ? '0 0 0 3px rgba(76, 175, 80, 0.1)' : 'none',
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {filteredGuides.length === 0 ? (
            <div style={styles.noResults}>
              {searchQuery ? (
                <>
                  <p>No guides found for "{searchQuery}"</p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>Try searching for "Attendance", "Grading", or "Points"</p>
                </>
              ) : (
                <p>No guides available</p>
              )}
            </div>
          ) : (
            Object.entries(groupedGuides).map(([category, items]) => (
              <div key={category} style={styles.section}>
                <div style={styles.sectionHeader}>{category}</div>
                {items.map(guide => (
                  <div
                    key={guide.id}
                    style={{
                      ...styles.guideItem,
                      background: expandedId === guide.id ? '#F0FDF4' : 'white', // Light green bg when active
                    }}
                    onClick={() => toggleExpand(guide.id)}
                  >
                    <div style={styles.guideItemHeader}>
                      <div style={{ flex: 1 }}>
                        <p style={styles.guideItemTitle}>
                          <span style={{ fontSize: '20px' }}>{guide.icon}</span>
                          {guide.title}
                        </p>
                        {expandedId !== guide.id && (
                          <p style={styles.guideItemDescription}>{guide.description}</p>
                        )}
                      </div>
                      <div style={{ color: '#aaa', flexShrink: 0 }}>
                        {expandedId === guide.id ? (
                          <ChevronUp size={20} color="#4CAF50" />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>

                    {/* Expanded content */}
                    {expandedId === guide.id && (
                      <div style={styles.steps}>
                        {guide.steps.map((step, idx) => (
  <div key={idx} style={styles.stepItem}>
    <span style={styles.stepBullet}>{idx + 1}</span> {/* Numbers look more modern than dots */}
    <span style={{ lineHeight: '1.5' }}>{step}</span>
  </div>
))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}