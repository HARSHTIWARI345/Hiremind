import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Resume parsing function schema
const resumeParserSchema = {
  name: 'parse_resume',
  description: 'Extract structured data from a resume',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      skills: { type: 'array', items: { type: 'string' } },
      projects: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            technologies: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      experience: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            company: { type: 'string' },
            position: { type: 'string' },
            duration: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
      education: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            institution: { type: 'string' },
            degree: { type: 'string' },
            field: { type: 'string' },
            year: { type: 'string' },
          },
        },
      },
    },
    required: ['name', 'skills'],
  },
}

export async function parseResume(resumeText: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert at parsing resumes. Extract structured JSON with fields: name, skills, projects, experience, education from the resume text provided.',
      },
      {
        role: 'user',
        content: `Parse this resume:\n\n${resumeText}`,
      },
    ],
    tools: [{ type: 'function', function: { name: 'parse_resume', ...resumeParserSchema } }],
    tool_choice: { type: 'function', function: { name: 'parse_resume' } },
    temperature: 0.3,
  })

  const response = completion.choices[0].message
  if (response.tool_calls && response.tool_calls[0]?.function?.name === 'parse_resume') {
    return JSON.parse(response.tool_calls[0].function.arguments)
  }
  throw new Error('Failed to parse resume')
}

export async function generateInterviewQuestions(resumeData: any, jobDescription: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert interviewer. Generate relevant interview questions based on the candidate resume and job description.',
      },
      {
        role: 'user',
        content: `Generate 5 technical questions and 2 behavioral questions for this candidate:\n\nResume: ${JSON.stringify(resumeData)}\n\nJob Description: ${jobDescription}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const response = completion.choices[0].message.content
  if (response) {
    return JSON.parse(response)
  }
  throw new Error('Failed to generate interview questions')
}

export async function evaluateAnswer(question: string, answer: string, context: { resumeData: any; jobDescription: string }) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert interviewer evaluating candidate answers. Provide a score out of 10, confidence level, correctness assessment, strengths, weaknesses, and a model better answer.',
      },
      {
        role: 'user',
        content: `Question: ${question}\n\nAnswer: ${answer}\n\nContext: Resume: ${JSON.stringify(context.resumeData)}\nJob Description: ${context.jobDescription}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
  })

  const response = completion.choices[0].message.content
  if (response) {
    return JSON.parse(response)
  }
  throw new Error('Failed to evaluate answer')
}

export async function calculateMatchScore(resumeData: any, jobDescription: string, jobSkills: string[]) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert recruiter. Calculate a match score between 0-100 based on resume and job requirements. Also identify missing skills and strength areas.',
      },
      {
        role: 'user',
        content: `Resume: ${JSON.stringify(resumeData)}\n\nJob Description: ${jobDescription}\n\nRequired Skills: ${jobSkills.join(', ')}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const response = completion.choices[0].message.content
  if (response) {
    return JSON.parse(response)
  }
  throw new Error('Failed to calculate match score')
}

export async function generateFinalFeedback(interviewData: any) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are an expert career coach. Generate comprehensive interview feedback including overall score, hireability assessment, weak areas, and a personalized improvement roadmap.',
      },
      {
        role: 'user',
        content: `Interview Data: ${JSON.stringify(interviewData)}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  })

  const response = completion.choices[0].message.content
  if (response) {
    return JSON.parse(response)
  }
  throw new Error('Failed to generate final feedback')
}
