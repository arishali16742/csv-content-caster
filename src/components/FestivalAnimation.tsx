import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Snowflake, Sparkles } from 'lucide-react';

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

// Christmas Animation - Snow and Santa
const ChristmasAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  const snowflakes = Array.from({ length: 30 }, (_, i) => i);

  return (
    <>
      {/* Snowflakes */}
      {snowflakes.map((i) => (
        <motion.div
          key={i}
          className="absolute text-white text-2xl"
          initial={{ y: -20, x: Math.random() * window.innerWidth, opacity: 0.8 }}
          animate={{
            y: window.innerHeight + 20,
            x: Math.random() * window.innerWidth,
            rotate: 360,
          }}
          transition={{
            duration: Math.random() * 3 + 5,
            repeat: Infinity,
            delay: Math.random() * duration,
            ease: 'linear',
          }}
        >
          <Snowflake className="w-4 h-4" />
        </motion.div>
      ))}

      {/* Santa Sleigh */}
      <motion.div
        className="absolute top-20 text-6xl"
        initial={{ x: -100 }}
        animate={{ x: window.innerWidth + 100 }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        🎅🛷
      </motion.div>

      {/* Offer Text */}
      {offerText && (
        <motion.div
          className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          🎄 {offerText} 🎄
        </motion.div>
      )}
    </>
  );
};

// Holi Animation - Colors from Pichkari
const HoliAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  const colors = ['#FF0080', '#00FF80', '#8000FF', '#FFFF00', '#00FFFF', '#FF4500'];
  const splashes = Array.from({ length: 25 }, (_, i) => i);

  return (
    <>
      {/* Color Splashes */}
      {splashes.map((i) => {
        const color = colors[i % colors.length];
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * (window.innerHeight * 0.3);

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 30 + 20,
              height: Math.random() * 30 + 20,
              backgroundColor: color,
              opacity: 0.6,
            }}
            initial={{ x: startX, y: startY, scale: 0 }}
            animate={{
              x: startX + (Math.random() - 0.5) * 300,
              y: startY + Math.random() * window.innerHeight,
              scale: [0, 1.5, 1],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              repeat: Infinity,
              delay: Math.random() * duration,
              ease: 'easeOut',
            }}
          />
        );
      })}

      {/* Pichkari */}
      <motion.div
        className="absolute text-5xl"
        style={{ top: '15%', left: '10%' }}
        animate={{
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        💦
      </motion.div>

      {/* Offer Text */}
      {offerText && (
        <motion.div
          className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          🎨 {offerText} 🎨
        </motion.div>
      )}
    </>
  );
};

// Diwali Animation - Firecrackers
const DiwaliAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  const fireworks = Array.from({ length: 15 }, (_, i) => i);

  return (
    <>
      {/* Fireworks */}
      {fireworks.map((i) => {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight * 0.6);

        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: x, top: y }}
          >
            <motion.div
              className="text-4xl"
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 2, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * duration,
                ease: 'easeOut',
              }}
            >
              ✨
            </motion.div>
            {Array.from({ length: 8 }).map((_, j) => (
              <motion.div
                key={j}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((j * Math.PI) / 4) * 50,
                  y: Math.sin((j * Math.PI) / 4) * 50,
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: Math.random() * duration,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        );
      })}

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

      {/* Offer Text */}
      {offerText && (
        <motion.div
          className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          🪔 {offerText} 🪔
        </motion.div>
      )}
    </>
  );
};

// Eid Animation - Moon and Greetings
const EidAnimation = ({ offerText, duration }: { offerText: string | null; duration: number }) => {
  const stars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <>
      {/* Stars */}
      {stars.map((i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-300 text-xl"
          style={{
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
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      >
        🌙
      </motion.div>

      {/* People Greeting */}
      <motion.div
        className="absolute bottom-32 left-1/4 text-5xl"
        animate={{
          x: [0, 20, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      >
        🤝
      </motion.div>

      {/* Offer Text */}
      {offerText && (
        <motion.div
          className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          🌙 {offerText} 🌙
        </motion.div>
      )}
    </>
  );
};

export default FestivalAnimation;
