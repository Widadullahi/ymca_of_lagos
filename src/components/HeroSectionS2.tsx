import { motion } from 'framer-motion';
import ymcaWorldImg from '../assets/images/ymca-world.png';

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
  secondaryButtonLink = "#rooms",
  secondaryButtonAction,
  imageSrc,
  imageAlt = "Hero Image",
}: HeroSectionS2Props) {
  
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
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={imageSrc || ymcaWorldImg} 
          alt={imageAlt} 
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/95"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 md:px-8 lg:px-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-4xl"
        >
          {title}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-white mb-8 max-w-2xl"
        >
          {subtitle}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.a
            href={primaryButtonLink}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="px-6 py-3 bg-[#6b5b35] text-white font-medium rounded-sm hover:bg-[#7d6b3e] transition-colors flex items-center justify-center"
          >
            {primaryButtonText} 
            <span className="ml-2">→</span>
          </motion.a>
          
          <motion.button
            onClick={secondaryButtonAction}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-sm hover:bg-white/10 transition-colors flex items-center justify-center"
          >
            {secondaryButtonText}
            <span className="ml-2">→</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}