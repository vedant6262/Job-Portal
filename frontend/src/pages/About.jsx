import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiOutlineHeart, HiOutlineLightBulb, HiOutlineHandRaised, HiOutlineGlobeAlt } from 'react-icons/hi2'

const values = [
  { icon: HiOutlineHeart, title: 'People First', description: 'We prioritize the success and well-being of job seekers and employers alike.' },
  { icon: HiOutlineLightBulb, title: 'Innovation', description: 'Leveraging AI and cutting-edge technology to revolutionize job searching.' },
  { icon: HiOutlineHandRaised, title: 'Trust & Safety', description: 'Every company and job listing is verified for your peace of mind.' },
  { icon: HiOutlineGlobeAlt, title: 'Global Reach', description: 'Connecting talent with opportunities across the globe without boundaries.' },
]

const team = [
  { name: 'Alex Rivera', role: 'CEO & Founder', avatar: 'AR' },
  { name: 'Emily Chen', role: 'CTO', avatar: 'EC' },
  { name: 'James Wilson', role: 'Head of Product', avatar: 'JW' },
  { name: 'Sofia Martinez', role: 'Head of Design', avatar: 'SM' },
]

export default function About() {
  return (
    <div>
      <section className="py-20 bg-gradient-to-br from-primary-500/5 to-secondary-500/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
              About <span className="gradient-text">JobPortal</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to transform the way people find work. By combining AI technology with human understanding, 
              we've created a platform that makes job searching smarter, faster, and more personal.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Our Story</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Founded in 2024, JobPortal was born from a simple observation: job hunting is broken. 
                Traditional job platforms flood candidates with irrelevant listings while employers struggle to find the right talent.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                We built JobPortal to fix this. Our AI-powered platform uses advanced algorithms to understand 
                each candidate's unique skills, experience, and career aspirations — then matches them with opportunities 
                where they'll truly thrive.
              </p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Today, we serve over 2 million job seekers and 5,000 companies worldwide, with a 98% satisfaction rate.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {['10,000+', '5,000+', '2M+', '98%'].map((stat, i) => (
                <div key={stat} className="glass-card p-6 text-center">
                  <p className="text-2xl font-bold gradient-text">{stat}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {['Active Jobs', 'Companies', 'Job Seekers', 'Satisfaction'][i]}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Values</h2>
            <p className="section-subtitle mx-auto">The principles that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-subtitle mx-auto">Passionate people building the future of work</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center group"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  {member.avatar}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-slate-500">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
