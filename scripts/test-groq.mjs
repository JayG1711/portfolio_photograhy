import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

async function main() {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image briefly.' },
            { type: 'image_url', image_url: { url: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg' } }
          ],
        },
      ],
      max_tokens: 100,
    });
    console.log(response.choices[0].message.content);
  } catch (err) {
    console.error(err.message);
  }
}
main();
