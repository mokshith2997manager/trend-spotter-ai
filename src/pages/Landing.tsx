import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Slide {
  id: number;
  headline: string;
  subtitle: string;
  image: string;
  ctaText?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    headline: 'Discover What\'s Trending',
    subtitle: 'Stay ahead of the curve with AI-powered trend analysis',
    image: 'https://images.pexels.com/photos/3819518/pexels-photo-3819518.jpeg?auto=compress&cs=tinysrgb&w=1600',
    ctaText: 'Next'
  },
  {
    id: 2,
    headline: 'Create Viral Content',
    subtitle: 'Record, edit, and share your best moments directly in the app',
    image: 'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=1600',
    ctaText: 'Next'
  },
  {
    id: 3,
    headline: 'Track Your HYPE',
    subtitle: 'Measure your impact with our unique scoring system',
    image: 'https://images.pexels.com/photos/3758139/pexels-photo-3758139.jpeg?auto=compress&cs=tinysrgb&w=1600',
    ctaText: 'Next'
  },
  {
    id: 4,
    headline: 'Get Real-time Alerts',
    subtitle: 'Never miss a trending opportunity with push notifications',
    image: 'https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg?auto=compress&cs=tinysrgb&w=1600',
    ctaText: 'Next'
  },
  {
    id: 5,
    headline: 'Join The Community',
    subtitle: 'Connect with creators who are making waves',
    image: 'https://images.pexels.com/photos/3587994/pexels-photo-3587994.jpeg?auto=compress&cs=tinysrgb&w=1600',
    ctaText: 'Start Now'
  }
];

export default function Landing() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('landing_completed', 'true');
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
    } else {
      navigate('/');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentIndex].image})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>

          <div className="absolute inset-0 flex flex-col justify-between p-6">
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground font-medium">
                {currentIndex + 1} / {slides.length}
              </div>
              {currentIndex < slides.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip
                </button>
              )}
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  {slides[currentIndex].headline}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {slides[currentIndex].subtitle}
                </p>
              </div>

              <div className="flex gap-3 items-center">
                {currentIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="w-12 h-12 rounded-full bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-foreground" />
                  </button>
                )}

                <Button
                  onClick={handleNext}
                  size="lg"
                  className="flex-1 bg-gradient-hype hover:bg-gradient-hype/90 text-white"
                >
                  {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                </Button>
              </div>
            </motion.div>

            <div className="flex gap-2 justify-center">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'transition-all duration-300 rounded-full',
                    index === currentIndex
                      ? 'w-8 h-2 bg-primary'
                      : 'w-2 h-2 bg-foreground/30 hover:bg-foreground/50'
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}