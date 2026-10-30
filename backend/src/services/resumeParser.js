const { PDFParse } = require('pdf-parse');
const mammoth = require('mammoth');

const SKILLS_DB = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'Shell',
  'React', 'React Native', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Svelte', 'Node.js', 'Express', 'Django', 'Flask',
  'FastAPI', 'Spring', 'Spring Boot', '.NET', 'Laravel', 'Rails', 'ASP.NET', 'HTML', 'CSS', 'Sass', 'LESS', 'Tailwind CSS',
  'Bootstrap', 'Material UI', 'Chakra UI', 'Redux', 'Zustand', 'jQuery', 'GraphQL', 'REST API', 'RESTful', 'gRPC', 'WebSockets',
  'SQL', 'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis', 'Firebase', 'DynamoDB', 'Elasticsearch', 'Cassandra', 'Oracle',
  'AWS', 'Amazon Web Services', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitLab CI',
  'Git', 'GitHub', 'Bitbucket', 'Linux', 'Unix', 'Bash', 'Terraform', 'Ansible', 'Nginx', 'Apache', 'Kafka', 'RabbitMQ',
  'Machine Learning', 'Deep Learning', 'Data Science', 'Data Analysis', 'Artificial Intelligence', 'AI', 'NLP',
  'TensorFlow', 'PyTorch', 'Keras', 'Pandas', 'NumPy', 'scikit-learn', 'OpenCV', 'Computer Vision', 'LLM', 'LangChain',
  'Figma', 'Adobe XD', 'Adobe Photoshop', 'Illustrator', 'UI/UX Design', 'UX Research', 'Product Design', 'Wireframing',
  'Prototyping', 'Design Systems', 'Tailwind', 'WordPress', 'SEO', 'SEM', 'Google Analytics', 'Content Marketing',
  'Digital Marketing', 'Social Media', 'Email Marketing', 'CRM', 'Salesforce', 'HubSpot', 'Tableau', 'Power BI', 'Excel',
  'Agile', 'Scrum', 'Kanban', 'Jira', 'Trello', 'Project Management', 'Product Management', 'Leadership', 'Team Management',
  'Communication', 'Problem Solving', 'Critical Thinking', 'Jest', 'Cypress', 'Playwright', 'Mocha', 'Selenium', 'Testing',
  'DevOps', 'Microservices', 'Serverless', 'Webpack', 'Vite', 'Babel', 'TypeScript Interfaces', 'System Design',
];

const ACTION_VERBS = [
  'developed', 'built', 'designed', 'implemented', 'managed', 'led', 'created', 'launched',
  'improved', 'increased', 'decreased', 'reduced', 'achieved', 'delivered', 'migrated', 'optimized',
  'engineered', 'architected', 'coordinated', 'mentored', 'trained', 'collaborated', 'automated',
  'integrated', 'deployed', 'monitored', 'analyzed', 'researched', 'authored', 'spearheaded', 'streamlined',
];

function normalize(text = '') {
  return text.replace(/\r/g, '').replace(/\u00A0/g, ' ');
}

async function extractText(buffer, mimetype = '') {
  const mime = (mimetype || '').toLowerCase();

  if (mime.includes('pdf') || mime.includes('application/pdf')) {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return normalize(result.text);
    } finally {
      await parser.destroy();
    }
  }

  if (mime.includes('openxmlformats')) {
    const result = await mammoth.extractRawText({ buffer });
    return normalize(result.value);
  }

  if (mime.includes('msword')) {
    const result = await mammoth.extractRawText({ buffer });
    if (result.value && result.value.trim()) return normalize(result.value);
    return normalize(buffer.toString('latin1'));
  }

  return normalize(buffer.toString('utf8'));
}

function extractSkills(text) {
  const lower = text.toLowerCase();
  const found = [];
  const used = new Set();

  for (const skill of SKILLS_DB) {
    const key = skill.toLowerCase();
    if (used.has(key)) continue;
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`).test(lower) || lower.includes(` ${key} `) || lower.endsWith(` ${key}`)) {
      found.push(skill);
      used.add(key);
    }
  }

  return found;
}

function computeResumeQuality(text) {
  const suggestions = [];
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  let contact = 0;
  const emails = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g);
  const phones = text.match(/(?:\+?\d[\d\s-]{8,}\d)/g);
  const hasWeb = /\b(linkedin\.com|github\.com|gitlab\.com|behance\.net|stackoverflow\.com|medium\.com|portfolio)\b/i.test(text);
  if (emails && emails.length) contact += 3;
  else suggestions.push('Add a professional email address to your header.');
  if (phones && phones.length) contact += 3;
  else suggestions.push('Add a phone number to your contact header.');
  if (hasWeb) contact += 2;
  else suggestions.push('Add a LinkedIn, GitHub, or portfolio link — recruiters and ATS both look for these.');

  let lengthPts = 0;
  if (words < 150) {
    lengthPts = 2;
    suggestions.push('Your resume is very short. Expand each role with 3-5 achievement-focused bullet points.');
  } else if (words < 300) {
    lengthPts = 4;
    suggestions.push('Your resume is on the shorter side. Aim for 400-700 words of substantive content.');
  } else if (words < 400) {
    lengthPts = 6;
  } else if (words <= 800) {
    lengthPts = 9;
  } else {
    lengthPts = 10;
    suggestions.push('Your resume is getting long. Trim it to keep the most relevant experience on the first page.');
  }

  const lower = text.toLowerCase();
  const hasSummary = /\b(summary|objective|profile|about me)\b/i.test(text);
  const hasExperience = /\b(experience|employment|work history|work experience)\b/i.test(text);
  const hasEducation = /\beducation\b/i.test(text);
  const hasSkillsSection = /\bskills\b/i.test(text);
  const hasProjects = /\bprojects?\b/i.test(text);
  let sectionPts = 0;
  if (hasSummary) sectionPts += 2;
  else suggestions.push('Add a 2-3 line professional summary at the top of your resume.');
  if (hasExperience) sectionPts += 3;
  else suggestions.push('Add a clearly labeled Work Experience section.');
  if (hasEducation) sectionPts += 2;
  else suggestions.push('Add an Education section with your degree and institution.');
  if (hasSkillsSection) sectionPts += 3;
  else suggestions.push('Add a dedicated Skills section so ATS parsers can extract your keywords.');
  if (hasProjects) sectionPts += 2;
  else suggestions.push('Add a Projects section to showcase practical, hands-on work.');

  const skills = extractSkills(text);
  const uniqueSkills = new Set(skills.map(s => s.toLowerCase())).size;
  let skillPts = 0;
  if (uniqueSkills >= 15) skillPts = 15;
  else if (uniqueSkills >= 10) skillPts = 12;
  else if (uniqueSkills >= 6) skillPts = 9;
  else if (uniqueSkills >= 3) skillPts = 5;
  else {
    skillPts = 2;
    suggestions.push('Very few recognizable skills detected. List your technologies and tools explicitly.');
  }

  const actionCount = ACTION_VERBS.filter(v => new RegExp(`\\b${v}\\b`, 'i').test(text)).length;
  let verbPts = 0;
  if (actionCount >= 10) verbPts = 8;
  else if (actionCount >= 6) verbPts = 6;
  else if (actionCount >= 3) verbPts = 4;
  else {
    verbPts = 2;
    suggestions.push('Use strong action verbs (built, led, improved, launched) to start your bullet points.');
  }

  const metrics = (text.match(/\b\d+%|\b\d[\d,]{2,}\b|\b\$\s?[\d,.]+[kKmM]?\b|by\s+\d+%|\d+x\b/g) || []).length;
  let metricPts = 0;
  if (metrics >= 5) metricPts = 8;
  else if (metrics >= 3) metricPts = 6;
  else if (metrics >= 1) metricPts = 3;
  else {
    metricPts = 1;
    suggestions.push('Quantify your achievements (e.g. "Improved conversion by 25%", "Managed a $500K budget").');
  }

  const years = [...new Set(text.match(/\b(?:19|20)\d{2}\b/g) || [])];
  let timePts = 0;
  if (years.length >= 4) timePts = 9;
  else if (years.length >= 2) timePts = 6;
  else if (years.length >= 1) timePts = 3;
  else {
    timePts = 1;
    suggestions.push('Add employment dates (e.g. "Jan 2019 - Present") so recruiters can verify your timeline.');
  }

  const points = contact + lengthPts + sectionPts + skillPts + verbPts + metricPts + timePts;
  const max = 8 + 10 + 12 + 15 + 8 + 8 + 9;

  return { points, max, suggestions, skills };
}

function analyzeATS(text, jobDescription = '') {
  const quality = computeResumeQuality(text);
  const { skills, suggestions } = quality;

  let matchedKeywords = [];
  let missingKeywords = [];
  let score;

  if (jobDescription) {
    const jobKeywords = extractSkills(jobDescription);
    const resumeSkillSet = new Set(skills.map(s => s.toLowerCase()));
    matchedKeywords = jobKeywords.filter(k => resumeSkillSet.has(k.toLowerCase()));
    missingKeywords = jobKeywords.filter(k => !resumeSkillSet.has(k.toLowerCase())).slice(0, 8);
    const ratio = jobKeywords.length ? matchedKeywords.length / jobKeywords.length : 0;
    score = Math.round((quality.points / quality.max) * 60 + ratio * 40);
    if (missingKeywords.length) {
      suggestions.push(`Add these job-specific keywords to match the role: ${missingKeywords.slice(0, 5).join(', ')}.`);
    }
  } else {
    score = Math.round((quality.points / quality.max) * 100);
  }

  score = Math.max(0, Math.min(100, score));

  if (score >= 85) suggestions.unshift('Excellent resume! Only minor polish needed.');
  else if (score >= 70) suggestions.unshift('Good resume. Tightening keyword relevance and adding metrics will push you higher.');
  else if (score >= 50) suggestions.unshift('Decent foundation, but ATS filters will likely screen it out. Apply the suggestions below.');
  else suggestions.unshift('Your resume needs significant work to pass ATS filters.');

  return {
    score,
    matchedSkills: skills,
    matchedKeywords,
    missingKeywords,
    suggestions: [...new Set(suggestions)].slice(0, 8),
  };
}

function matchJobs(jobs = [], skills = [], text = '') {
  const skillLower = new Set(skills.map(s => s.toLowerCase()));
  const textLower = text.toLowerCase();
  const titleKeywords = extractSkills(text).map(s => s.toLowerCase()).filter(s => s.length > 2);

  const scored = jobs
    .map(job => {
      const tags = Array.isArray(job.tags) ? job.tags : typeof job.tags === 'string' ? [job.tags] : [];
      const haystack = `${job.title || ''} ${tags.join(' ')} ${(job.description || '').slice(0, 1500)}`.toLowerCase();
      let hits = 0;
      const matched = [];

      skillLower.forEach(s => {
        const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (new RegExp(`\\b${escaped}\\b`).test(haystack)) {
          hits += 2;
          matched.push(s);
        }
      });

      titleKeywords.forEach(t => {
        if (haystack.includes(t)) {
          hits += 3;
          matched.push(t);
        }
      });

      if (textLower && job.title && textLower.includes(job.title.toLowerCase().split(' ').slice(0, 2).join(' '))) hits += 1;

      const matchScore = Math.min(100, Math.round(hits * 6));
      return {
        id: job.slug || null,
        title: job.title || 'Untitled Role',
        company: job.company_name || job.company || 'Unknown',
        location: job.location || 'Remote',
        remote: Boolean(job.remote),
        url: job.url || '#',
        tags,
        description: (job.description || '').slice(0, 300),
        matchScore,
        matchedSkills: [...new Set(matched)].slice(0, 8),
      };
    })
    .filter(job => job.matchScore >= 10)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);

  return scored;
}

module.exports = { extractText, extractSkills, analyzeATS, matchJobs, SKILLS_DB };
