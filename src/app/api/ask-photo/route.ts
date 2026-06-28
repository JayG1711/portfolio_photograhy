import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_CONTEXT = `You are analyzing a photograph from Jay Gurav's cinematic photography portfolio. Answer questions about this specific image — its mood, composition, lighting, story, technical aspects, or emotion. Keep answers to 2-3 sentences maximum. Be poetic but precise. Do not say 'I can see' or 'The image shows' — speak directly about the photograph.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ answer: "AI analysis unavailable." });
    }

    const { imageId, question } = await req.json();

    if (!imageId || !question || typeof question !== 'string') {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (question.length > 200) {
      return NextResponse.json({ error: "Question too long" }, { status: 400 });
    }

    const imageUrl = `https://drive.google.com/thumbnail?id=${imageId}&sz=w800`;
    
    // Fetch image and convert to base64
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      return NextResponse.json({
        answer: "I could not load the full photograph for analysis right now, but the question is ready to try again in a moment."
      });
    }
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imgRes.headers.get("content-type") || "image/jpeg";

    const genAI = new GoogleGenerativeAI(apiKey);
    const fullPrompt = `${SYSTEM_CONTEXT}\n\nQuestion: ${question}`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType
      }
    };

    let answer = "";

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([fullPrompt, imagePart]);
      answer = result.response.text();
    } catch (err) {
      console.warn("gemini-1.5-flash failed, falling back to gemini-2.0-flash", err);
      try {
        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await fallbackModel.generateContent([fullPrompt, imagePart]);
        answer = result.response.text();
      } catch (err2) {
        console.warn("gemini-2.0-flash also failed, falling back to Groq Vision", err2);
        
        // Fallback to Groq Llama 3.2 Vision if available
        const groqKey = process.env.GROQ_API_KEY;
        if (groqKey) {
          try {
            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${groqKey}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                model: "llama-3.2-11b-vision-preview",
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: fullPrompt },
                      { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
                    ]
                  }
                ]
              })
            });
            
            if (groqRes.ok) {
              const groqData = await groqRes.json();
              answer = groqData.choices[0]?.message?.content || "";
            } else {
              throw new Error(`Groq API returned ${groqRes.status}`);
            }
          } catch (groqErr) {
            console.warn("Groq also failed", groqErr);
            return NextResponse.json({ answer: "My AI assistant is currently overwhelmed with requests. Please try asking again in a minute." });
          }
        } else {
          return NextResponse.json({ answer: "My AI assistant is currently overwhelmed with requests. Please try asking again in a minute." });
        }
      }
    }

    if (!answer) {
      answer = "My AI assistant is currently overwhelmed with requests. Please try asking again in a minute.";
    }

    return NextResponse.json({ answer: answer.trim() });
  } catch (error) {
    console.error("Ask Photo API Error:", error);
    return NextResponse.json({ answer: "My AI assistant is currently overwhelmed with requests. Please try asking again in a minute." });
  }
}
