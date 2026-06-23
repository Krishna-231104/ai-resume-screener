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

module.exports = { extractSkillsFromResume, scoreCandidate }