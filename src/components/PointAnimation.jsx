import { motion, AnimatePresence } from 'framer-motion';

// Anchored point animation. Pass `isVisible`, optional `x`,`y` page coordinates, `points` value, and `type` ('wow' | 'nono').
export const PointAnimation = ({ isVisible, x = 0, y = 0, points = 1, type = 'wow' }) => {
  const isPositive = points > 0;
  const emoji = isPositive ? '⭐' : '😔';
  const prefix = isPositive ? '+' : '';
  const direction = isPositive ? -60 : 60; // positive goes up, negative goes down
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 0, opacity: 0, scale: 0.6 }}
          animate={{ y: direction, opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.6 }}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            transform: 'translate(-50%, -50%)',
            color: isPositive ? '#FFD700' : '#FF6B6B',
            fontSize: '2.2rem',
            pointerEvents: 'none',
            zIndex: 2000,
            textShadow: '0 6px 12px rgba(0,0,0,0.12)'
          }}
        >
          {emoji} {prefix}{Math.abs(points)}
        </motion.div>
      )}
    </AnimatePresence>
  );
};