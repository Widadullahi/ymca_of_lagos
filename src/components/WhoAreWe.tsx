import { Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import whotheyare from "../assets/images/whotheyare.png"

type WhoAreWeProps = {
  buttonVariants?: Variants;
};

export default function WhoAreWe({  }: WhoAreWeProps) {
  const navigate = useNavigate();
  
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8">
          
          {/* Image Section */}
          <div className="md:w-2/5">
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img 
                src={whotheyare}
                alt="YMCA Lagos Logo" 
                className="w-full h-auto" 
              />
            </div>
          </div>

          {/* Text Section */}
          <div className="md:w-3/5">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Who we are</h2>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-xl">
              The YMCA of Lagos is a vibrant and inclusive community committed to empowering young people and transforming lives through service, education, leadership, and faith-based principles. As part of the global YMCA movement, one of the world’s oldest and most respected youth organizations, we work tirelessly to nurture the potential of every individual and promote positive change within our communities.
            </p>
            <p className='text-gray-600 mb-6'>
              Our focus goes beyond youth engagement; we seek to build stronger communities, promote social justice, and inspire holistic development spiritually, mentally, and physically. Through our diverse programs and outreach efforts, we provide platforms where young people can discover their purpose, strengthen their values, and become agents of change in society.
            </p>

            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => navigate('/about-us')}
              className="text-red-700 border border-red-700 px-6 py-2 rounded-full font-medium hover:bg-red-50 transition-colors"
            >
              Become a Part of Our Story
            </motion.button>
          </div>

        </div>
      </div>
    </section>
  );
}
