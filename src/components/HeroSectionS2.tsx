import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import item1 from '../assets/hero/item-1.jpg';
import item2 from '../assets/hero/item-2.jpg';
import item3 from '../assets/hero/item-3.jpg';

const HERO_IMAGES = [item1, item2, item3];

interface HeroSectionS2Props {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonLink?: string;
  secondaryButtonAction?: () => void;
  imageSrc?: string;
  imageAlt?: string;
}

export default function HeroSectionS2({
  title = "Discover Your Winter Paradise!",
  subtitle = "Exciting ski slopes, cozy accommodations, and unforgettable experiences await.",
  primaryButtonText = "CONTACT NOW",
  secondaryButtonText = "ROOMS & SUITES",
  primaryButtonLink = "#contact",
  secondaryButtonAction,
  imageAlt = "Hero Image",
}: HeroSectionS2Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 400 }
    },
    tap: {
      scale: 0.95,
      transition: { type: "spring", stiffness: 400 }
    }
  };


  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image Carousel */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={HERO_IMAGES[currentImageIndex]}
            alt={`${imageAlt} ${currentImageIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(79, 16, 32, 0.7), rgba(111, 24, 48, 0.45), rgba(47, 9, 20, 0.8))',
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-8 lg:px-16">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 max-w-5xl leading-tight"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-2xl text-white mb-10 max-w-3xl font-light"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-5"
        >
          <motion.a
            href={primaryButtonLink}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="px-8 py-4 text-white bg-red-700 font-semibold rounded-md hover:bg-red-800 transition-all flex items-center justify-center shadow-lg uppercase tracking-wider"
          >
            {primaryButtonText}
            <span className="ml-2">→</span>
          </motion.a>

          <motion.button
            onClick={secondaryButtonAction}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold rounded-md hover:bg-white/20 transition-all flex items-center justify-center shadow-lg uppercase tracking-wider"
          >
            {secondaryButtonText}
            <span className="ml-2">→</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
