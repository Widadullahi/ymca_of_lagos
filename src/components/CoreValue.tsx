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
    { title: "Caring", icon: "❤️", color: "bg-red-100 text-red-800" },
    { title: "Honesty", icon: "🤝", color: "bg-blue-100 text-blue-800" },
    { title: "Respect", icon: "🙏", color: "bg-green-100 text-green-800" },
    { title: "Responsibility", icon: "⚖️", color: "bg-purple-100 text-purple-800" }
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
                    These fundamental principles guide everything we do at YMCA Lagos
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {coreValues.map((value, index) => (
                    <motion.div
                        key={index}
                        variants={scaleIn}
                        className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
                    >
                        <div className="text-4xl mb-4">{value.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${value.color}`}>
                        Core Value
                        </div>
                    </motion.div>
                    ))}
                </motion.div>
                </div>
            </section>


            
        </>
    )
}
