import { motion} from 'framer-motion';

export default function Programme() {
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
    
      const programmes = [
        {
          title: "Sports Committee",
          description: "Promotes health, fitness, and teamwork through organized sports activities, particularly basketball.",
          icon: "🏀"
        },
        {
          title: "Programmes Committee",
          description: "Develops youth-centered programs that focus on personal growth, leadership, and social responsibility.",
          icon: "📋"
        },
        {
          title: "Social Welfare Committee",
          description: "Provides support to vulnerable groups and addresses social issues within the community.",
          icon: "🤝"
        },
        {
          title: "Christian Emphasis Committee",
          description: "Focuses on spiritual growth and embedding Christian values in all programs and activities.",
          icon: "⛪"
        },
        {
          title: "Membership Committee",
          description: "Engages members through active participation in YMCA programs, fostering a sense of belonging and contribution.",
          icon: "👥"
        },
        {
          title: "Leadership Development Committee",
          description: "Provides training and mentorship for young people, focusing on building leadership capacity for community and national service.",
          icon: "👑"
        },
        {
          title: "Camp Committee",
          description: "Organizes leadership and development camps aimed at enhancing youth capabilities.",
          icon: "🏕️"
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Programmes & Committees</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our specialized committees focus on holistic youth development through diverse programs and initiatives
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {programmes.map((programme, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">{programme.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{programme.title}</h3>
                </div>
                <p className="text-gray-700 text-center leading-relaxed">{programme.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
        </>
    )
}
