import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineUser, HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineCog6Tooth, HiOutlinePlus, HiOutlineTrash, HiOutlineCloudArrowUp } from 'react-icons/hi2'

export default function Profile() {
  const [activeTab, setActiveTab] = useState('basic')
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Node.js', 'Python'])

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: HiOutlineUser },
    { id: 'education', label: 'Education', icon: HiOutlineAcademicCap },
    { id: 'experience', label: 'Experience', icon: HiOutlineBriefcase },
    { id: 'skills', label: 'Skills', icon: HiOutlineCog6Tooth },
  ]

  const profileCompletion = 75

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">My Profile</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage your professional profile.</p>

      <div className="mb-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              JD
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">John Doe</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Senior Full Stack Developer</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">john.doe@email.com · +1 (555) 123-4567</p>
            </div>
            <button className="btn-secondary text-sm px-4 py-2">
              <HiOutlineCloudArrowUp className="w-4 h-4" /> Upload Photo
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600" style={{ width: `${profileCompletion}%` }} />
            </div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{profileCompletion}% Complete</span>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="glass-card p-6">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label><input type="text" defaultValue="John Doe" className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label><input type="email" defaultValue="john.doe@email.com" className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label><input type="tel" defaultValue="+1 (555) 123-4567" className="input-field" /></div>
              <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label><input type="text" defaultValue="San Francisco, CA" className="input-field" /></div>
              <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Headline</label><input type="text" defaultValue="Senior Full Stack Developer" className="input-field" /></div>
              <div className="sm:col-span-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label><textarea rows={4} className="input-field resize-none" defaultValue="Experienced full stack developer with 5+ years..." /></div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <button className="btn-primary"><HiOutlineCloudArrowUp className="w-5 h-5" /> Upload Resume</button>
              <button className="btn-primary">Save Changes</button>
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Education</h3>
              <button className="btn-secondary text-sm px-3 py-1.5"><HiOutlinePlus className="w-4 h-4" /> Add</button>
            </div>
            {[
              { school: 'Stanford University', degree: 'B.S. Computer Science', year: '2018 - 2022' },
              { school: 'MIT', degree: 'M.S. Artificial Intelligence', year: '2022 - 2024' },
            ].map((edu, i) => (
              <div key={i} className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{edu.school}</p>
                  <p className="text-sm text-slate-500">{edu.degree}</p>
                  <p className="text-xs text-slate-400">{edu.year}</p>
                </div>
                <button className="btn-ghost p-2 text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'experience' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Experience</h3>
              <button className="btn-secondary text-sm px-3 py-1.5"><HiOutlinePlus className="w-4 h-4" /> Add</button>
            </div>
            {[
              { company: 'TechCorp', role: 'Senior Full Stack Developer', period: '2022 - Present' },
              { company: 'StartupXYZ', role: 'Full Stack Developer', period: '2020 - 2022' },
            ].map((exp, i) => (
              <div key={i} className="flex items-start justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{exp.role}</p>
                  <p className="text-sm text-slate-500">{exp.company}</p>
                  <p className="text-xs text-slate-400">{exp.period}</p>
                </div>
                <button className="btn-ghost p-2 text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map(skill => (
                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  {skill}
                  <button onClick={() => setSkills(skills.filter(s => s !== skill))} className="hover:text-red-500 transition-colors">
                    <HiOutlineTrash className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" placeholder="Add a skill..." className="input-field flex-1" onKeyDown={e => { if (e.key === 'Enter' && e.target.value) { setSkills([...skills, e.target.value]); e.target.value = '' } }} />
              <button className="btn-primary px-4 py-2">Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
