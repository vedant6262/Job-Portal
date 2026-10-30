export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Temporary',
]

export const EXPERIENCE_LEVELS = [
  'Fresher',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
]

export const WORK_MODES = ['Remote', 'Hybrid', 'On-site']

export const JOB_CATEGORIES = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Legal',
  'Healthcare',
  'Education',
  'Technology',
]

export const SALARY_RANGES = [
  { label: '0 - 3 LPA', min: 0, max: 300000 },
  { label: '3 - 6 LPA', min: 300000, max: 600000 },
  { label: '6 - 10 LPA', min: 600000, max: 1000000 },
  { label: '10 - 15 LPA', min: 1000000, max: 1500000 },
  { label: '15 - 25 LPA', min: 1500000, max: 2500000 },
  { label: '25+ LPA', min: 2500000, max: Infinity },
]

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  HIRED: 'hired',
}

export const NOTIFICATION_TYPES = {
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_VIEWED: 'application_viewed',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  OFFER_LETTER: 'offer_letter',
  JOB_RECOMMENDATION: 'job_recommendation',
}

export const SKILLS_LIST = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask',
  'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Firebase',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD',
  'Git', 'Linux', 'REST API', 'GraphQL', 'WebSockets',
  'Machine Learning', 'Data Science', 'AI', 'Deep Learning',
  'Figma', 'Adobe XD', 'UI/UX Design', 'Product Design',
  'Agile', 'Scrum', 'Project Management', 'Leadership',
]

export const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Manufacturing', 'Consulting', 'Media', 'Telecommunications',
  'Real Estate', 'Hospitality', 'Transportation', 'Energy',
]

export const COMPANY_SIZES = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5000+ employees',
]

export const PLACEHOLDER_LOGO = 'https://ui-avatars.com/api/?background=6366f1&color=fff&name='
