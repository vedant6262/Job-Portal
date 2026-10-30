const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const prisma = require('../config/prisma');
const { generateATSScore, generateResumeSummary, generateCoverLetter, generateInterviewQuestions, getJobRecommendations, chatWithAssistant } = require('../config/openai');
const { extractText, extractSkills, analyzeATS, matchJobs } = require('../services/resumeParser');
const { fetchJobs } = require('../services/arbeitnow');

router.post('/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Please upload a resume file (PDF, DOCX or TXT)' });

    const { jobDescription } = req.body;
    const resumeText = await extractText(req.file.buffer, req.file.mimetype);

    if (!resumeText || !resumeText.trim()) {
      return res.status(422).json({ error: 'Could not read text from the uploaded file. Please upload a valid PDF, DOCX or TXT resume.' });
    }

    const skills = extractSkills(resumeText);
    const localAts = analyzeATS(resumeText, jobDescription);
    const ats = await generateATSScore(resumeText, jobDescription || 'Evaluate this resume for general ATS readiness without a specific job description.');
    ats.matchedSkills = localAts.matchedSkills;
    ats.matchedKeywords = localAts.matchedKeywords;
    ats.missingKeywords = localAts.missingKeywords;
    ats.suggestions = [...new Set([...(ats.suggestions || []), ...localAts.suggestions])].slice(0, 8);

    let jobs = [];
    try {
      const search = skills.slice(0, 3).join(' ');
      const data = await fetchJobs({ perPage: 20, search });
      jobs = Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error('Arbeitnow fetch error:', error.message);
    }

    const matchedJobs = matchJobs(jobs, skills, resumeText);

    if (req.userId) {
      try {
        const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
        if (user) {
          await prisma.user.update({ where: { id: user.id }, data: { atsScore: ats.score } });
        }
      } catch (error) {
        console.error('Error saving ATS score:', error.message);
      }
    }

    res.json({
      resumeText: resumeText.slice(0, 5000),
      skills,
      ats,
      matchedJobs,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ats-score', requireAuth, async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) return res.status(400).json({ error: 'Resume text and job description are required' });

    const result = await generateATSScore(resumeText, jobDescription);

    const user = await prisma.user.findUnique({ where: { clerkId: req.userId } });
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { atsScore: result.score } });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/resume-summary', requireAuth, async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'Resume text is required' });

    const summary = await generateResumeSummary(resumeText);
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/cover-letter', requireAuth, async (req, res) => {
  try {
    const { resumeText, jobTitle, companyName, jobDescription } = req.body;
    if (!resumeText || !jobTitle || !companyName) return res.status(400).json({ error: 'Resume, job title, and company name are required' });

    const coverLetter = await generateCoverLetter(resumeText, jobTitle, companyName, jobDescription || '');
    res.json({ coverLetter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/interview-questions', requireAuth, async (req, res) => {
  try {
    const { jobTitle, jobDescription, skills } = req.body;
    if (!jobTitle) return res.status(400).json({ error: 'Job title is required' });

    const questions = await generateInterviewQuestions(jobTitle, jobDescription || '', skills || []);
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/recommendations', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.userId },
      include: { skills: true, experience: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const userSkills = user.skills.map(s => s.name);
    const userExperience = user.experience.map(e => `${e.title} at ${e.company}`).join(', ');
    const preferences = user.headline || user.bio || '';

    const recommendations = await getJobRecommendations(userSkills, userExperience, preferences);
    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const response = await chatWithAssistant(message, history || []);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
