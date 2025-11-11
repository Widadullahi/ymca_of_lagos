import { motion } from 'framer-motion';

export default function CoreValue() {
    
    const fadeInUp = {
        hidden: { opacity: 0, y: 60 },
        visible: { 
        opacity: 1, 
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1
        }
        }
    };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };



  const coreValues = [
    { 
      title: "Caring", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>, 
      description: "We show compassion and empathy to all individuals, ensuring everyone feels valued and supported in our community."
    },
    { 
      title: "Honesty", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        <path d="M9 14l2 2 4-4"></path>
      </svg>, 
      description: "We uphold integrity in all our actions and communications, building trust through transparency and truthfulness."
    },
    { 
      title: "Respect", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>, 
      description: "We honor the dignity and worth of every person, embracing diversity and treating all with fairness and consideration."
    },
    { 
      title: "Responsibility", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>, 
      description: "We take ownership of our actions and commitments, serving as reliable stewards for our community and future generations."
    }
  ];

    return (
        <>
            <section className="py-20 bg-gray-100">
                <div className="container mx-auto px-4">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    At the YMCA of Lagos, our core values serve as the heartbeat of everything we do. They reflect our unwavering commitment to empowering individuals, strengthening communities, and promoting holistic development spiritually, mentally, and physically. These principles guide our decisions, inspire our programs, and shape the way we interact with every person we serve. Through compassion, integrity, respect, and service, we strive to create an inclusive environment where everyone has the opportunity to grow, belong, and make a positive impact in society.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-4 gap-8"
                >
                    {coreValues.map((value, index) => (
                    <motion.div
                        key={index}
                        variants={scaleIn}
                        className="text-center"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 text-teal-500">
                            {value.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                        <p className="text-gray-600 leading-relaxed">
                            {value.description}
                        </p>
                    </motion.div>
                    ))}
                </motion.div>
                </div>
            </section>


            
        </>
    )
}
