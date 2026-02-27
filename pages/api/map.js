import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 🚨 PASTE YOUR REAL API KEY INSIDE THE QUOTES BELOW 🚨
  const apiKey = "AIzaSyAenK65EKqrcMd0YueDzD2ThEd2FrNRfQ0"; 

  const { target, source_sample } = req.body;

  if (!target || !source_sample) {
    return res.status(400).json({ error: "Missing target or source data" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Using the model that works for you (Flash 1.5 is the safest default)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    const prompt = `
    Act as a Senior Data Integration Architect.
    Map the Source CSV columns to the Target Schema fields.

    Target Schema:
    ${JSON.stringify(target)}

    Source CSV Sample:
    ${source_sample}

    Instructions:
    1. Match Source columns to Target fields based on name similarity or standard business logic (e.g. "CustName" -> "Customer").
    2. Output ONLY raw JSON.

    Output Format:
    {
      "mapping": [
        { "target": "field_name", "source": "column_name", "confidence": "High", "notes": "Direct match" }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean up any markdown formatting
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    res.status(200).json({ response: text });

  } catch (error) {
    console.error("Mapping Error:", error);
    return res.status(500).json({ error: error.message });
  }
}