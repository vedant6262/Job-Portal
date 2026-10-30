const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

const generateATSScore = async (resumeText, jobDescription) => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS (Applicant Tracking System) analyzer. Analyze the resume against the job description and provide a score out of 100 and specific improvement suggestions.',
        },
        {
          role: 'user',
          content: `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription}\n\nProvide a JSON response with "score" (number 0-100) and "suggestions" (array of strings).`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI ATS Score error:', error);
    return { score: 70, suggestions: ['Unable to analyze at this time'] };
  }
};

const generateResumeSummary = async (resumeText) => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume writer. Generate a compelling professional summary based on the resume content.',
        },
        {
          role: 'user',
          content: `Generate a professional summary (2-3 sentences) based on this resume:\n${resumeText}`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Summary error:', error);
    return 'Unable to generate summary at this time.';
  }
};

const generateCoverLetter = async (resumeText, jobTitle, companyName, jobDescription) => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a professional cover letter writer. Generate a personalized, compelling cover letter.',
        },
        {
          role: 'user',
          content: `Generate a cover letter for a ${jobTitle} position at ${companyName}.\n\nJob Description:\n${jobDescription}\n\nResume:\n${resumeText}`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Cover Letter error:', error);
    return 'Unable to generate cover letter at this time.';
  }
};

const generateInterviewQuestions = async (jobTitle, jobDescription, skills = [], difficulty = 'Medium', questionType = 'Technical') => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interview coach. Generate realistic interview questions for software engineering roles. Return valid JSON only with an array of questions.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            jobTitle,
            questionType,
            difficulty,
            jobDescription: jobDescription || 'General software engineering role.',
            requiredSkills: skills.length ? skills : ['problem solving', 'system design', 'code quality'],
            requirements: [
              'Return exactly this structure: {"questions":[{"question":"...","topic":"...","difficulty":"...","type":"Technical","answer":"...","followUp":"..."}]}',
              'Focus on technical, coding, and system-design questions that fit the role.',
              'Include 5 questions with strong interview relevance.',
            ],
          }),
        },
      ],
      response_format: { type: 'json_object' },
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Interview Questions error:', error);
    return JSON.stringify({
      questions: [{
        question: 'Explain how you would optimize a slow API endpoint in production.',
        topic: 'Performance',
        difficulty: 'Medium',
        type: 'Technical',
        answer: 'Profile the bottleneck, check database queries, add caching, optimize indexes, and validate with benchmarks.',
        followUp: 'What metrics would you use to confirm the fix worked?',
      }],
    });
  }
};

const getJobRecommendations = async (userSkills, userExperience, userPreferences) => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a career advisor. Recommend suitable job roles based on the candidate profile.',
        },
        {
          role: 'user',
          content: `Based on the following profile, recommend 5 job titles that would be a good fit:\n\nSkills: ${userSkills.join(', ')}\nExperience: ${userExperience}\nPreferences: ${userPreferences}`,
        },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Recommendations error:', error);
    return 'Unable to generate recommendations at this time.';
  }
};

const chatWithAssistant = async (message, history = []) => {
  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful career assistant for JobPortal. Help users with job search, resume tips, interview preparation, and career advice. Be concise and actionable.',
      },
      ...history,
      { role: 'user', content: message },
    ];

    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI Chat error:', error);
    return 'I apologize, but I\'m having trouble processing your request right now. Please try again.';
  }
};

module.exports = { openai, generateATSScore, generateResumeSummary, generateCoverLetter, generateInterviewQuestions, getJobRecommendations, chatWithAssistant };
