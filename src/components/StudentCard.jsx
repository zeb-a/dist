import { dicebearAvatar, fallbackInitialsDataUrl } from '../utils/avatar';
import SafeAvatar from './SafeAvatar';

const StudentCard = ({ student, onClick }) => {
  const displayAvatar = student.avatar || dicebearAvatar(student.name, student.gender);

  return (
    <div 
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2 + window.scrollX;
        const centerY = rect.top + rect.height / 2 + window.scrollY;
        if (onClick) onClick(student, { x: centerX, y: centerY });
      }}
      style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        position: 'relative'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{
        position: 'absolute', top: '15px', right: '15px',
        background: '#E3F2FD', color: '#2196F3',
        width: '32px', height: '32px', borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
      }}>
        {student.score}
      </div>

      <SafeAvatar
        src={displayAvatar}
        name={student.name}
        alt={student.name}
        loading="lazy"
        style={{
          ...styles.avatar,
          backgroundColor: '#FFEAA7',
          borderRadius: '50%'
        }}
      />
      
      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#2D3436' }}>
        {student.name}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#B2BEC3', marginTop: '4px' }}>
        {(student.gender || '').toUpperCase()}
      </div>
    </div>
  );
};


const styles = {
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid white',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  // Add other styles here if your JSX uses them, like:
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '20px',
    textAlign: 'center',
    cursor: 'pointer'
  }
};
export default StudentCard;