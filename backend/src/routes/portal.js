const express = require('express');
const router = express.Router();
const { askGroq } = require('../services/groqService');

const careerGoalMap = {
  software: 'Software Developer',
  data: 'Data Analyst',
  ai: 'AI / ML Engineer',
  cyber: 'Cybersecurity Analyst',
  electronics: 'Electronics Engineer',
  other: 'General Career Path',
};

const staticAssessmentQuestions = [
  {
    id: 'q1',
    category: 'Technical',
    question: 'Which skill most directly helps you turn business requirements into reliable software systems?',
    options: ['Problem decomposition', 'Copy editing', 'Stock trading', 'Manual scheduling'],
    correctIndex: 0,
    weight: 1,
  },
  {
    id: 'q2',
    category: 'Technical',
    question: 'What is the best way to improve application reliability before deployment?',
    options: ['Write tests and validate edge cases', 'Skip code review', 'Increase code comments only', 'Wait until production errors appear'],
    correctIndex: 0,
    weight: 1,
  },
  {
    id: 'q3',
    category: 'Soft Skills',
    question: 'A team member is blocked and asks for help. What is the most professional response?',
    options: ['Break down the issue, clarify expectations, and collaborate on a solution', 'Ignore the message until the deadline', 'Tell them to figure it out alone', 'Blame the tooling'],
    correctIndex: 0,
    weight: 1,
  },
  {
    id: 'q4',
    category: 'Analytical',
    question: 'When a project deadline is at risk, the best action is to:',
    options: ['Prioritize the critical path, re-scope, and communicate early', 'Promise everything immediately', 'Stop all communication', 'Ignore dependencies'],
    correctIndex: 0,
    weight: 1,
  },
  {
    id: 'q5',
    category: 'Data',
    question: 'Which habit most improves decision-making in product or internship work?',
    options: ['Review relevant data and metrics before acting', 'Choose based on guesses', 'Avoid documentation', 'Depend only on senior opinion'],
    correctIndex: 0,
    weight: 1,
  },
  {
    id: 'q6',
    category: 'Communication',
    question: 'An internship mentor gives feedback. The best response is to:',
    options: ['Listen, reflect, and apply the feedback to improve your work', 'Defend your work without listening', 'Ask for a different mentor', 'Ignore the feedback'],
    correctIndex: 0,
    weight: 1,
  },
  {
    id: 'q7',
    category: 'Career Readiness',
    question: 'Which action best prepares you for industry roles?',
    options: ['Build a digital portfolio with projects and measurable outcomes', 'Only apply without preparation', 'Avoid certifications', 'Limit networking to classroom friends'],
    correctIndex: 0,
    weight: 1,
  },
  {
    id: 'q8',
    category: 'Innovation',
    question: 'When you discover a better process, the best professional approach is to:',
    options: ['Document it, share it, and propose improvement with evidence', 'Keep it secret', 'Change everything without testing', 'Wait for permission to think'],
    correctIndex: 0,
    weight: 1,
  },
];

const internshipOpportunities = [
  {
    id: 'intern-101',
    title: 'Software Engineering Intern',
    company: 'Nexa Labs',
    type: 'Internship',
    mode: 'Hybrid',
    location: 'Bengaluru',
    stipend: '₹25,000 / month',
    skills: ['JavaScript', 'Problem Solving', 'API Design'],
    rating: 4.8,
    deadline: '2026-09-20',
    description: 'Build scalable product features and participate in engineering reviews with a modern product team.',
  },
  {
    id: 'intern-102',
    title: 'Data Analyst Intern',
    company: 'Astra Metrics',
    type: 'Internship',
    mode: 'Remote',
    location: 'Remote',
    stipend: '₹20,000 / month',
    skills: ['SQL', 'Excel', 'Data Visualization'],
    rating: 4.7,
    deadline: '2026-09-18',
    description: 'Create dashboards and interpret customer and product trends for business planning.',
  },
  {
    id: 'intern-103',
    title: 'Product Design & Research Intern',
    company: 'Pixel Harbor',
    type: 'Project',
    mode: 'On-site',
    location: 'Pune',
    stipend: '₹18,000 / month',
    skills: ['UI/UX', 'Research', 'Prototyping'],
    rating: 4.9,
    deadline: '2026-09-24',
    description: 'Work on campus-to-industry product experiences and improve design systems.',
  },
  {
    id: 'intern-104',
    title: 'Campus Ambassador / Partnerships',
    company: 'SkillForge',
    type: 'Apprenticeship',
    mode: 'Hybrid',
    location: 'Delhi NCR',
    stipend: '₹15,000 / month',
    skills: ['Communication', 'Marketing', 'Events'],
    rating: 4.6,
    deadline: '2026-09-15',
    description: 'Support workshops, campus engagement, and student outreach with industry mentors.',
  },
];

const learningPrograms = [
  {
    id: 'program-201',
    title: 'AI for Career Readiness Bootcamp',
    provider: 'Industry Skills Alliance',
    format: 'Hybrid',
    duration: '6 weeks',
    level: 'Beginner to Intermediate',
    skills: ['AI literacy', 'Prompting', 'Career strategy'],
    description: 'Learn job-readiness workflows, portfolio building, and AI-assisted career planning.',
  },
  {
    id: 'program-202',
    title: 'Full Stack Development Sprint',
    provider: 'CodeBridge Labs',
    format: 'Live cohort',
    duration: '8 weeks',
    level: 'Intermediate',
    skills: ['React', 'Node.js', 'REST APIs'],
    description: 'Build a full-stack project with mentorship, code reviews, and deployment guidance.',
  },
  {
    id: 'program-203',
    title: 'Industry Mentorship for Research Careers',
    provider: 'Academic Research Exchange',
    format: 'Online',
    duration: '4 weeks',
    level: 'All levels',
    skills: ['Research methods', 'Problem framing', 'Presentation'],
    description: 'Connect with faculty and industry experts to shape dissertation and research projects.',
  },
];

const academicOpportunities = [
  {
    id: 'acad-301',
    title: 'Faculty Internship in Emerging Technologies',
    organization: 'Centre for Digital Innovation',
    type: 'Faculty Development Program',
    location: 'Hybrid',
    duration: '4 weeks',
    focus: ['AI', 'Data Science', 'Curriculum Design'],
    description: 'Collaborate on curriculum modernization and faculty training for applied industry practices.',
  },
  {
    id: 'acad-302',
    title: 'Industrial Training for Academicians',
    organization: 'FutureWorks Research Collective',
    type: 'Training',
    location: 'Bengaluru',
    duration: '2 weeks',
    focus: ['Data pipelines', 'Product development', 'Innovation labs'],
    description: 'Participate in an immersive industrial training program aligned to current engineering practices.',
  },
  {
    id: 'acad-303',
    title: 'Collaborative Research Consultant',
    organization: 'Sustainable Tech Forum',
    type: 'Consultancy',
    location: 'Remote',
    duration: 'Flexible',
    focus: ['Sustainability', 'Smart systems', 'Applied research'],
    description: 'Support research proposals, pilot studies, and applied technology consulting for campuses.',
  },
];

const portfolioProfile = {
  name: 'Aisha Verma',
  role: 'Computer Science Student / Aspiring Product Analyst',
  summary: 'Focused on software development, data literacy, and problem-solving with an interest in AI-enabled product teams.',
  profileScore: 88,
  verifiedSkills: ['JavaScript', 'SQL', 'Python', 'UI/UX', 'Problem Solving', 'Communication'],
  certifications: [
    { name: 'Google Data Analytics', issuer: 'Coursera', year: 2026 },
    { name: 'AWS Cloud Foundations', issuer: 'AWS Skill Builder', year: 2025 },
  ],
  projects: [
    { name: 'Campus Placement Tracker', description: 'Built a dashboard to track internship eligibility, application status, and skill readiness.', technologies: ['React', 'Node.js', 'PostgreSQL'] },
    { name: 'Smart Attendance Analytics', description: 'Developed a real-time analytics workflow for classroom participation and trend monitoring.', technologies: ['Python', 'Power BI', 'SQL'] },
  ],
  achievements: ['Finalist, National Innovation Challenge', 'Best Student Mentor Award', 'Published research abstract in AI and Education'],
  internshipHistory: [
    { title: 'Product Intern', company: 'Nexa Labs', period: 'Jun 2026 - Jul 2026' },
    { title: 'Research Volunteer', company: 'AI for Good Club', period: 'Jan 2025 - Mar 2025' },
  ],
  skillGap: ['Advanced system design', 'Cloud deployment practice', 'Strategic communication'],
};

router.get('/overview', (req, res) => {
  res.json({
    headline: 'Academia–Industry Collaboration Portal',
    stats: [
      { label: 'Skill Profiles', value: '12.4k', change: '+18.5%' },
      { label: 'Active Internships', value: '3.8k', change: '+24%' },
      { label: 'Programs', value: '640', change: '+12%' },
      { label: 'Placement Matches', value: '91%', change: '+9.3%' },
    ],
    pipeline: [
      { label: 'Assessment', value: 'Skill readiness scoring' },
      { label: 'Matching', value: 'Career and internship fit' },
      { label: 'Learning', value: 'Industry specific upskilling' },
      { label: 'Placement', value: 'Shortlisting and tracking' },
    ],
    recommendedSkills: ['Problem Solving', 'Communication', 'SQL', 'AI Literacy', 'Product Thinking'],
  });
});

function shuffleArray(items) {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function buildFallbackQuestions(careerGoal) {
  const requestId = `${careerGoal}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return shuffleArray(staticAssessmentQuestions)
    .slice(0, 18)
    .map((question, index) => ({
      ...question,
      id: `fallback-${requestId}-${index + 1}`,
    }));
}

async function generateCareerAssessmentQuestions(careerGoal = 'software') {
  const goalLabel = careerGoalMap[String(careerGoal).toLowerCase()] || 'Software Developer';
  const requestStamp = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  try {
    if (!process.env.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY is not configured. Falling back to static assessment questions.');
      return buildFallbackQuestions(careerGoal);
    }

    const raw = await askGroq([
      {
        role: 'system',
        content: 'You are an expert career readiness coach. Generate a fresh, relevant assessment for a student. Return valid JSON only. No markdown, no code fences.',
      },
      {
        role: 'user',
        content: JSON.stringify({
          requestStamp,
          careerGoal: goalLabel,
          count: 18,
          sections: ['Technical Skills', 'Aptitude', 'Soft Skills', 'Industry Readiness'],
          requirements: [
            'Use the selected career goal heavily to decide what skills matter most.',
            'This is a fresh generation request. Make the set look genuinely different from earlier calls by changing concepts, difficulty mix, wording, and option ordering every time.',
            'Questions must be realistic for students and early-career candidates.',
            'Balance multiple-choice and scenario-style questions across the sections.',
            'Each question must have a unique id, a section, a question, an array of 4 options, and the correctAnswer as one option text exactly matching the option string.',
            'Return JSON with shape: { "questions": [{ "id": "q1", "section": "Technical Skills", "type": "multiple", "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "...", "explanation": "..." }] }'
          ],
        }),
      },
    ], { json: true, maxTokens: 3200, temperature: 0.9 });

    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed.questions) ? parsed.questions : [];

    const result = questions.map((question, index) => ({
      id: question.id || `q-${goalLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${requestStamp}-${index + 1}`,
      section: String(question.section || 'Technical Skills').trim(),
      type: String(question.type || 'multiple').trim(),
      question: String(question.question || '').trim(),
      options: Array.isArray(question.options) ? question.options.map((option) => String(option || '').trim()).filter(Boolean) : [],
      correctAnswer: String(question.correctAnswer || '').trim(),
      explanation: String(question.explanation || '').trim(),
    })).filter((question) => question.question && question.options.length === 4 && question.correctAnswer);

    if (result.length >= 12) {
      return result;
    }

    return buildFallbackQuestions(careerGoal);
  } catch (error) {
    console.error('Assessment generation failed:', error.message);
    return buildFallbackQuestions(careerGoal);
  }
}

router.get('/assessment', async (req, res) => {
  const careerGoal = String(req.query.careerGoal || 'software');

  try {
    const generatedQuestions = await generateCareerAssessmentQuestions(careerGoal);

    if (generatedQuestions.length >= 12) {
      return res.json({
        totalQuestions: generatedQuestions.length,
        careerGoal,
        questions: generatedQuestions,
      });
    }

    const fallback = staticAssessmentQuestions
      .map((question, index) => ({
        ...question,
        id: `fallback-${careerGoal}-${index + 1}`,
      }));

    res.json({
      totalQuestions: fallback.length,
      careerGoal,
      questions: fallback,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/assessment/submit', (req, res) => {
  const { answers = {} } = req.body;

  let score = 0;
  const strengths = [];
  const gaps = [];
  const sectionStats = new Map();
  const questionResults = [];

  const questionsForScoring = Array.isArray(req.body.questions) ? req.body.questions : staticAssessmentQuestions;

  questionsForScoring.forEach((question) => {
    const selectedValue = answers[question.id];
    const correctValue = question.correctAnswer ?? ((typeof question.correctIndex === 'number') ? question.options?.[question.correctIndex] : undefined);
    const weight = Number(question.weight || 1);
    const section = String(question.section || 'General');
    const isCorrect = correctValue !== undefined && String(selectedValue) === String(correctValue);

    if (isCorrect) {
      score += weight;
    }

    const stat = sectionStats.get(section) || { name: section, correct: 0, total: 0 };
    stat.total += 1;
    if (isCorrect) stat.correct += 1;
    sectionStats.set(section, stat);

    questionResults.push({
      id: question.id,
      section,
      question: question.question,
      selectedAnswer: selectedValue ?? null,
      correctAnswer: correctValue ?? null,
      isCorrect,
    });
  });

  const total = Math.max(questionsForScoring.length, 1);
  const percentage = Math.round((score / total) * 100);

  if (percentage >= 75) {
    strengths.push('Strong career readiness foundation');
  } else {
    strengths.push('Good potential with targeted upskilling');
  }

  strengths.push('Professional communication readiness');
  gaps.push('Advanced system design');
  gaps.push('Cloud deployment and validation');

  const recommendedRoles = [
    'Product Analyst',
    'Software Engineer',
    'Data Analyst',
    'UX Research Assistant',
  ];

  const sections = Array.from(sectionStats.values()).map((section) => ({
    ...section,
    percentage: section.total ? Math.round((section.correct / section.total) * 100) : 0,
  }));

  res.json({
    score,
    percentage,
    total,
    sections,
    questionResults,
    strengths,
    skillGaps: gaps,
    recommendedRoles,
    summary: `You scored ${percentage}% in the industry-readiness assessment. This indicates ${percentage >= 80 ? 'excellent alignment' : 'good potential'} for career-focused internships and placement pathways.`,
    recommendedIndustries: ['Technology', 'Consulting', 'Fintech', 'EdTech', 'Research'],
  });
});

router.get('/internships', (req, res) => {
  res.json({ opportunities: internshipOpportunities });
});

router.get('/programs', (req, res) => {
  res.json({ programs: learningPrograms });
});

router.get('/academia', (req, res) => {
  res.json({ opportunities: academicOpportunities });
});

router.get('/portfolio', (req, res) => {
  res.json({ profile: portfolioProfile });
});

module.exports = router;
