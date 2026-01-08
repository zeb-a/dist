import React from 'react';
import { ChevronLeft, Star } from 'lucide-react';

export default function EggRoad({ classData, onBack }) {
  const currentTotal = classData.students.reduce((sum, s) => sum + s.score, 0);

  return (
    <div style={roadStyles.container}>
      <header style={roadStyles.header}>
        <ChevronLeft onClick={onBack} style={{cursor: 'pointer'}} />
        <h2>Class Progress Road</h2>
      </header>
      
      <div style={roadStyles.pathContainer}>
        <div style={roadStyles.pathLine}></div>
        {/* Animated Path with stars and the Egg */}
        {[10, 20, 30, 40].map((milestone, i) => (
          <div key={i} style={{...roadStyles.milestone, opacity: currentTotal >= milestone ? 1 : 0.4}}>
            <Star fill={currentTotal >= milestone ? "#FFD700" : "none"} color="#FFD700" size={40} />
          </div>
        ))}
        <div style={roadStyles.eggFinal}>
          <div style={roadStyles.eggLarge}>{currentTotal >= 50 ? '🐣' : '🥚'}</div>
          <div style={roadStyles.eggScore}>{currentTotal} / 50</div>
        </div>
      </div>
    </div>
  );
}

const roadStyles = {
  container: { height: '100vh', background: 'linear-gradient(to bottom, #81D4FA, #E1F5FE)', padding: '40px' },
  header: { display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '50px' },
  pathContainer: { position: 'relative', display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '100px' },
  pathLine: { position: 'absolute', top: '50%', left: '10%', right: '10%', height: '8px', background: 'rgba(255,255,255,0.5)', borderRadius: '10px', zIndex: 0 },
  milestone: { zIndex: 1, textAlign: 'center' },
  eggFinal: { textAlign: 'center', zIndex: 1 },
  eggLarge: { fontSize: '100px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' },
  eggScore: { fontWeight: 'bold', fontSize: '24px', color: '#01579B' }
};