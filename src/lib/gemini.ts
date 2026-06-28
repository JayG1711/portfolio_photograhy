import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateDailyStory(photoName: string, category: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const fallbackStory = "Look deeper into the ordinary. The world is full of untold stories waiting for a lens.";
  
  if (!apiKey) {
    return fallbackStory;
  }

  try {
    const prompt = `Write a single, very short, deeply emotional and raw sentence inspired by a photograph titled "${photoName}" (Category: ${category}). Make it sound deeply human, intimately heart-touching, and poetic. Do NOT use cliché AI phrases (e.g. 'a visual journey', 'capturing moments', 'in this photograph'). Just output the single beautiful sentence without any quotes around it.`;
    
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const data = await res.json();
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content.trim().replace(/^"|"$/g, '');
    }
    
    return fallbackStory;
  } catch (error) {
    return fallbackStory;
  }
}
