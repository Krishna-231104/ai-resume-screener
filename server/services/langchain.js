const { ChatGroq } = require('@langchain/groq')
const { PromptTemplate } = require('@langchain/core/prompts')

const extractSkillsFromResume = async (rawText) => {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    temperature: 0
  })

  const prompt = PromptTemplate.fromTemplate(`
    You are an expert resume parser.
    Extract all technical skills from the following resume text.
    Return ONLY a JSON array of skills like this: ["React", "Node.js", "MongoDB"]
    Do not include any explanation or extra text.
    
    Resume text:
    {resumeText}
  `)

  const chain = prompt.pipe(model)
  const response = await chain.invoke({ resumeText: rawText })
  
  console.log('Groq response:', response.content)
  
  const skills = JSON.parse(response.content)
  return skills
}

const scoreCandidate = async (jobDescription, resumeText) => {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    temperature: 0
  })

  const prompt = PromptTemplate.fromTemplate(`
    You are an expert recruiter. Score how well this candidate matches the job description.
    Return ONLY a number between 0 and 100. No explanation, just the number.
    
    Job Description: {jobDescription}
    
    Candidate Resume: {resumeText}
  `)

  const chain = prompt.pipe(model)
  const response = await chain.invoke({ jobDescription, resumeText })
  
  const score = parseInt(response.content.trim())
  return isNaN(score) ? 0 : score
}

// Parses full structured portfolio data from resume text in a single Groq call
const parseResumeToPortfolio = async (rawText) => {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    temperature: 0
  })

  const prompt = PromptTemplate.fromTemplate(`
    You are an expert resume parser. Extract structured portfolio data from the resume text below.
    Return ONLY valid JSON (no markdown, no explanation, no code blocks) matching this exact structure:
    {{
      "bio": "A 1-2 sentence professional summary written in first person",
      "skills": ["skill1", "skill2", "skill3"],
      "experience": [
        {{ "company": "Company Name", "role": "Job Title", "duration": "Year - Year" }}
      ],
      "education": [
        {{ "institution": "College/University Name", "degree": "Degree and Field", "year": "Graduation Year" }}
      ],
      "projects": [
        {{ "title": "Project Name", "description": "1 sentence description", "githubUrl": "", "liveUrl": "" }}
      ]
    }}
    Rules:
    - bio must be non-empty (summarise from objective/summary section or infer from experience)
    - skills must be all technical skills mentioned
    - If experience/education/projects are not found, return empty arrays []
    - githubUrl and liveUrl should be empty strings unless explicitly mentioned
    - Return ONLY the JSON object, nothing else

    Resume text:
    {resumeText}
  `)

  const chain = prompt.pipe(model)
  const response = await chain.invoke({ resumeText: rawText })

  console.log('Groq parseResumeToPortfolio response:', response.content)

  try {
    // Strip markdown code fences if model wraps in them despite instructions
    const cleaned = response.content
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .trim()
    const parsed = JSON.parse(cleaned)
    return parsed
  } catch (err) {
    console.error('Failed to parse Groq portfolio JSON, falling back to skills-only:', err)
    // Fallback: return minimal structure so upload doesn't fail
    return {
      bio: '',
      skills: [],
      experience: [],
      education: [],
      projects: []
    }
  }
}

// General-purpose AI assistant — answers ANY question, uses resume as optional context
const answerCareerQuestion = async (question, resumeContext) => {
  const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7
  })

  const prompt = PromptTemplate.fromTemplate(`
    You are a helpful, knowledgeable AI assistant — like ChatGPT.
    You can help with anything: coding problems, career advice, general knowledge, interview prep, debugging, writing, math, or any other topic.
    If the user's question is related to their career or resume, use the resume context below to give personalized advice.
    If the question is about something else (coding, general topics, etc.), just answer it directly and helpfully.
    Be conversational, clear, and thorough.

    User's Resume Context (use only if relevant):
    {resumeContext}

    User's Question:
    {question}

    Answer:
  `)

  const chain = prompt.pipe(model)
  const response = await chain.invoke({ question, resumeContext })
  return response.content
}

module.exports = { extractSkillsFromResume, scoreCandidate, parseResumeToPortfolio, answerCareerQuestion }