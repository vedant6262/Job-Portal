const OpenAI = require('openai');

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

async function askGroq(messages, options = {}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured on the backend');
  }

  const response = await groq.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 1800,
    ...(options.json ? { response_format: { type: 'json_object' } } : {}),
  });

  return response.choices[0]?.message?.content?.trim() || '';
}

module.exports = { askGroq, model };