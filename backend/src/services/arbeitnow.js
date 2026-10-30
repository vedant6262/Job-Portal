const ARBEITNOW_API_URL = process.env.ARBEITNOW_API_URL || 'https://arbeitnow.com/api/job-board-api';
const ARBEITNOW_API_KEY = process.env.ARBEITNOW_API_KEY;

async function apiFetch(urlStr) {
  const headers = {};
  if (ARBEITNOW_API_KEY) headers.Authorization = `Bearer ${ARBEITNOW_API_KEY}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(urlStr, { headers, signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}${body ? `: ${body.slice(0, 200)}` : ''}`);
    }

    return await res.json();
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') throw new Error('Request timed out');
    throw error;
  }
}

function buildUrl(params) {
  const url = new URL(ARBEITNOW_API_URL);
  url.searchParams.set('page', String(params.page));
  url.searchParams.set('per_page', String(Math.min(params.perPage, 20)));
  if (params.search) url.searchParams.set('search', params.search);
  if (params.location) url.searchParams.set('location', params.location);
  if (params.remote !== undefined) url.searchParams.set('remote', String(params.remote));
  if (params.tags) url.searchParams.set('tags', params.tags);

  return url.toString();
}

async function fetchJobs({ page = 1, perPage = 20, search, location, remote, tags } = {}) {
  const urlStr = buildUrl({ page, perPage, search, location, remote, tags });
  return await apiFetch(urlStr);
}

async function fetchJobBySlug(slug) {
  return await apiFetch(`${ARBEITNOW_API_URL}/${slug}`);
}

module.exports = { fetchJobs, fetchJobBySlug };
