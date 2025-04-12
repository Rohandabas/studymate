import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateVideoSummary(transcript) {
  try {
    const prompt = `Please analyze this educational video transcript and provide:
    1. A concise summary (2-3 paragraphs)
    2. 5-7 key learning points (start each with a dash)
    3. Important concepts or definitions
    4. 3 quiz questions to test understanding
    
    Transcript: ${transcript}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary. Please try again.');
  }
}

export async function generateVideoInsights(videoData) {
  try {
    const prompt = `Please analyze this YouTube video metadata and provide insights:
    
    Title: ${videoData.title}
    Description: ${videoData.description}
    Tags: ${videoData.tags.join(', ')}
    Duration: ${videoData.duration}

    Please provide:
    1. A summary of what this video likely covers (2-3 paragraphs)
    2. 5-7 key topics that are likely covered (start each with a dash)
    3. Suggested prerequisites or background knowledge
    4. 3 learning objectives for viewers

    Format the response with clear sections and bullet points.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new Error('Failed to generate video insights. Please try again.');
  }
}

export async function generateStudyPlan(topic, duration = "4 weeks") {
  try {
    const prompt = `Create a detailed study plan for learning ${topic} over ${duration}.
    Include:
    1. Clear learning objectives
    2. Weekly breakdown of topics
    3. Recommended practice exercises
    4. Progress milestones
    5. Estimated time commitment per week
    
    Format the response with clear sections and bullet points.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating study plan:', error);
    throw new Error('Failed to generate study plan. Please try again.');
  }
}