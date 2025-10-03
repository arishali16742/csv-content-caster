import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import christmasImg from '@/assets/festival-christmas.jpg';
import holiImg from '@/assets/festival-holi.jpg';
import diwaliImg from '@/assets/festival-diwali.jpg';
import eidImg from '@/assets/festival-eid.jpg';

interface FestivalAnimationData {
  id: string;
  festival_name: string;
  animation_type: string;
  offer_text: string | null;
  start_date: string;
  end_date: string;
  duration_seconds: number;
  is_active: boolean;
}

const FestivalAnimation = () => {
  const [animation, setAnimation] = useState<FestivalAnimationData | null>(null);

  useEffect(() => {
    loadActiveAnimation();

    const channel = supabase
      .channel('festival-animation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'festival_animations'
        },
        () => {
          console.log('Festival animation changed, reloading...');
          loadActiveAnimation();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadActiveAnimation = async () => {
    const now = new Date();
    console.log('Current time:', now.toISOString());
    
    const { data, error } = await supabase
      .from('festival_animations' as any)
      .select('*')
      .eq('is_active', true);

    console.log('All active animations:', data);
    console.log('Query error:', error);

    if (data && data.length > 0) {
      // Filter animations that are currently active based on date range
      const activeAnimation = data.find((anim: any) => {
        const startDate = new Date(anim.start_date);
        const endDate = new Date(anim.end_date);
        const isInRange = startDate <= now && endDate >= now;
        console.log(`Animation ${anim.festival_name}:`, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isInRange
        });
        return isInRange;
      });

      if (activeAnimation) {
        console.log('Active animation found:', activeAnimation);
        setAnimation(activeAnimation as unknown as FestivalAnimationData);
      } else {
        console.log('No animation in date range');
        setAnimation(null);
      }
    } else {
      console.log('No active animations found');
      setAnimation(null);
    }
  };

  if (!animation) return null;

  const renderAnimation = () => {
    switch (animation.animation_type) {
      case 'christmas':
        return <ChristmasAnimation offerText={animation.offer_text} duration={animation.duration_seconds} />;
      case 'holi':
        return <HoliAnimation offerText={animation.offer_text} duration={animation.duration_seconds} />;
      case 'diwali':
        return <DiwaliAnimation offerText={animation.offer_text} duration={animation.duration_seconds} />;
      case 'eid':
        return <EidAnimation offerText={animation.offer_text} duration={animation.duration_seconds} />;
      default:
        return null;
    }
  };

  return <div className="pointer-events-none">{renderAnimation()}</div>;
};

// Christmas Animation - Realistic Scene
const ChristmasAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${christmasImg})` }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-blue-900/20 animate-pulse" />
      
      {/* Falling snow overlay */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-80"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-5%`,
            }}
            animate={{
              y: ['0vh', '100vh'],
              x: [0, Math.random() * 50 - 25],
              opacity: [0.8, 1, 0.6],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Holi Animation - Realistic Scene
const HoliAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  const colors = ['#FF0080', '#00FF80', '#8000FF', '#FFFF00', '#00FFFF', '#FF4500', '#FF1493', '#32CD32'];

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${holiImg})` }}
        animate={{
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Color powder bursts overlay */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              background: `radial-gradient(circle, ${colors[i % colors.length]}88 0%, ${colors[i % colors.length]}00 70%)`,
            }}
            animate={{
              scale: [0, 2, 0],
              opacity: [0, 0.8, 0],
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// Diwali Animation - Realistic Scene
const DiwaliAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${diwaliImg})` }}
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 via-transparent to-purple-900/10" />
      
      {/* Firework sparkles overlay */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => {
          const positions = [
            { x: '10%', y: '15%' },
            { x: '90%', y: '20%' },
            { x: '30%', y: '10%' },
            { x: '70%', y: '25%' },
            { x: '50%', y: '15%' },
          ];
          const pos = positions[i % positions.length];
          
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: pos.x, top: pos.y }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 2, 0],
                opacity: [1, 0.8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: (i * 0.15) % 2,
                ease: 'easeOut',
              }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-radial from-yellow-400 via-orange-500 to-transparent blur-sm" />
            </motion.div>
          );
        })}
      </div>
      
      {/* Glowing diyas effect */}
      <motion.div
        className="absolute inset-0"
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent" />
      </motion.div>
    </motion.div>
  );
};

// Eid Animation - Realistic Scene
const EidAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${eidImg})` }}
        animate={{
          scale: [1, 1.06, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 via-transparent to-purple-900/20" />
      
      {/* Twinkling stars overlay */}
      <div className="absolute inset-0">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-200 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.5, 0.8],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      
      {/* Lantern glow effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-16 h-16 rounded-full blur-xl"
            style={{
              left: `${(i * 8.33) % 100}%`,
              top: `${Math.random() * 80 + 10}%`,
              background: 'radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)',
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default FestivalAnimation;
