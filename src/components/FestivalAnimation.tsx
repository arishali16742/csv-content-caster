import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

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

// Christmas Animation - Snowflakes overlay
const ChristmasAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  const snowflakes = Array.from({ length: 80 }, (_, i) => i);

  return (
    <>
      {/* Snowflakes */}
      {snowflakes.map((i) => {
        const startX = Math.random() * window.innerWidth;
        const size = Math.random() * 8 + 10;
        const drift = Math.random() * 100 - 50;
        
        return (
          <motion.div
            key={i}
            className="absolute text-white opacity-90"
            style={{ 
              fontSize: size,
              filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.9))',
              left: startX,
              textShadow: '0 0 10px rgba(255,255,255,0.8)'
            }}
            initial={{ 
              y: -50, 
              opacity: Math.random() * 0.5 + 0.5,
              rotate: Math.random() * 360
            }}
            animate={{
              y: window.innerHeight + 50,
              x: startX + drift,
              rotate: [0, 360, 720],
              opacity: [0.7, 1, 0.5, 1, 0.7],
            }}
            transition={{
              duration: Math.random() * 8 + 12,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'linear',
            }}
          >
            ❄️
          </motion.div>
        );
      })}

      {/* Santa sleigh */}
      <motion.div
        className="absolute text-6xl flex items-center gap-1"
        style={{ top: '20%' }}
        initial={{ x: -200 }}
        animate={{ x: window.innerWidth + 200 }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <span>🦌</span>
        <span>🛷</span>
        <span>🎅</span>
      </motion.div>
    </>
  );
};

// Holi Animation - Color splashes overlay
const HoliAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  const colors = ['#FF0080', '#00FF80', '#8000FF', '#FFFF00', '#00FFFF', '#FF4500', '#FF1493', '#32CD32'];
  const splashes = Array.from({ length: 40 }, (_, i) => i);

  return (
    <>
      {/* Color powder splashes */}
      {splashes.map((i) => {
        const color = colors[i % colors.length];
        const startX = (i * (window.innerWidth / 40)) + Math.random() * 30;
        const size = Math.random() * 80 + 60;

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: startX,
              top: -100,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              y: [0, Math.random() * 400 + 200],
              opacity: [0, 0.8, 0.6, 0],
              scale: [0, 1.5, 2, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 3,
              repeat: Infinity,
              delay: Math.random() * duration,
              ease: 'easeOut',
            }}
          >
            <div
              style={{
                width: size,
                height: size,
                background: `radial-gradient(circle, ${color}dd 0%, ${color}88 50%, ${color}00 100%)`,
                borderRadius: '50%',
                filter: 'blur(8px)',
              }}
            />
          </motion.div>
        );
      })}
    </>
  );
};

// Diwali Animation - Fireworks overlay
const DiwaliAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  const corners = [
    { x: '5%', y: '10%' },
    { x: '95%', y: '10%' },
    { x: '5%', y: '85%' },
    { x: '95%', y: '85%' },
    { x: '50%', y: '5%' },
    { x: '25%', y: '15%' },
    { x: '75%', y: '15%' },
  ];

  return (
    <>
      {/* Firecrackers from corners */}
      {corners.map((corner, cornerIndex) => (
        <React.Fragment key={cornerIndex}>
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`${cornerIndex}-${i}`}
              className="absolute"
              style={{ left: corner.x, top: corner.y }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Main burst */}
              <motion.div
                className="absolute"
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1.5, 2, 0],
                  opacity: [1, 0.8, 0.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: (cornerIndex * 0.5) + (i * 0.3),
                  ease: 'easeOut',
                }}
              >
                <div
                  style={{
                    width: 100,
                    height: 100,
                    background: `radial-gradient(circle, #FFD700 0%, #FF6B6B 30%, #FF8C00 60%, transparent 100%)`,
                    borderRadius: '50%',
                    filter: 'blur(2px)',
                  }}
                />
              </motion.div>

              {/* Sparkles */}
              {Array.from({ length: 12 }).map((_, j) => (
                <motion.div
                  key={j}
                  className="absolute text-yellow-400 text-2xl"
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos((j * Math.PI * 2) / 12) * 80,
                    y: Math.sin((j * Math.PI * 2) / 12) * 80,
                    opacity: [1, 0.5, 0],
                    scale: [1, 0.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: (cornerIndex * 0.5) + (i * 0.3),
                    ease: 'easeOut',
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>
          ))}
        </React.Fragment>
      ))}

      {/* Diya */}
      <motion.div
        className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-6xl"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        🪔
      </motion.div>
    </>
  );
};

// Eid Animation - Stars and moon overlay
const EidAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  const stars = Array.from({ length: 40 }, (_, i) => i);
  const lanterns = Array.from({ length: 8 }, (_, i) => i);

  return (
    <>
      {/* Stars */}
      {stars.map((i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-300"
          style={{
            fontSize: Math.random() * 15 + 20,
            left: Math.random() * window.innerWidth,
            top: Math.random() * (window.innerHeight * 0.5),
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            repeat: Infinity,
            delay: Math.random() * duration,
          }}
        >
          ⭐
        </motion.div>
      ))}

      {/* Crescent Moon */}
      <motion.div
        className="absolute top-20 right-20 text-8xl"
        animate={{
          rotate: [0, 10, -10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      >
        🌙
      </motion.div>

      {/* Lanterns */}
      {lanterns.map((i) => {
        const positions = [
          { bottom: '20%', left: '10%' },
          { bottom: '25%', left: '25%' },
          { bottom: '20%', right: '15%' },
          { bottom: '30%', right: '30%' },
          { bottom: '15%', left: '40%' },
          { bottom: '35%', left: '60%' },
          { bottom: '20%', right: '45%' },
          { bottom: '25%', left: '80%' },
        ];
        const emojis = ['🏮', '🕌', '🌟', '🕯️', '✨', '🎆', '💫', '⭐'];
        
        return (
          <motion.div
            key={i}
            className="absolute text-5xl"
            style={positions[i]}
            animate={{
              scale: [1, 1.2, 1],
              y: [0, -10, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          >
            {emojis[i]}
          </motion.div>
        );
      })}
    </>
  );
};

export default FestivalAnimation;
