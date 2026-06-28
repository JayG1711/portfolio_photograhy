require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function run() {
  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAGCvh1aRz2Fx2So_DqGfkPdVfuiiTbpOw';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  try {
    const res = await model.generateContent("Write a one sentence story about a camera.");
    console.log("SUCCESS:", res.response.text());
  } catch(e) {
    console.error("ERROR:", e);
  }
}
run();
