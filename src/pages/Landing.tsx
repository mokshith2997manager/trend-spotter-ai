import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="font-bold text-primary-foreground text-sm">H</span>
          </div>
          <span className="font-bold text-lg">HypeLens</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Animated Logo */}
        <motion.div 
          className="relative mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Outer ring */}
          <div className="w-40 h-40 rounded-full border-2 border-primary/30 flex items-center justify-center relative">
            {/* Inner glow */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-transparent" />
            
            {/* Lightning bolt */}
            <Zap className="w-16 h-16 text-primary" strokeWidth={2.5} />
            
            {/* Floating icons */}
            <motion.div 
              className="absolute -top-2 -right-2"
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <TrendingUp className="w-6 h-6 text-primary" />
            </motion.div>
            
            <motion.div 
              className="absolute bottom-4 -left-4"
              animate={{ y: [2, -2, 2] }}
              transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1 
          className="text-4xl md:text-5xl font-black mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-foreground">Hype</span>
          <span className="text-primary">Lens</span>
          <span className="text-foreground"> AI</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.h2 
          className="text-xl md:text-2xl font-bold mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Discover Trends <span className="text-primary">Before</span> They Go Viral
        </motion.h2>

        {/* Description */}
        <motion.p 
          className="text-muted-foreground max-w-md mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Your AI-powered early trend detector. Stay ahead of the curve and create content that resonates.
        </motion.p>

        {/* Feature badges */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Badge variant="outline" className="px-4 py-2">AI Scoring</Badge>
          <Badge variant="outline" className="px-4 py-2">Real-time Trends</Badge>
          <Badge variant="outline" className="px-4 py-2">Viral Predictions</Badge>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-glow"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.p 
          className="text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Join 10,000+ creators staying ahead of trends
        </motion.p>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground">
        © 2024 HypeLens AI. All rights reserved.
      </footer>
    </div>
  );
}
