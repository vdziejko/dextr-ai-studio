console.log("Dextr Live Update 1.0");
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 🚨 PASTE YOUR REAL KEY INSIDE THE QUOTES BELOW 🚨
  const apiKey = process.env.GEMINI_API_KEY_FINAL;

  const { input } = req.body;
  if (!input) {
    return res.status(400).json({ error: "No file data received." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview", 
        generationConfig: { responseMimeType: "application/json" } 
    });

    const files = input.files || [];
    const targetSystem = input.state?.target_system || "Standard";
    
    // Logic Switches for different Phases
    const isTargetDiscovery = input.state?.phase === "target_discovery"; // Phase 1
    const isSourceAnalysis = input.state?.phase === "source_analysis";   // Phase 2
    const isMappingSuggestion = input.state?.phase === "mapping_suggestion"; // Phase 3
    const isCodeGeneration = input.state?.phase === "code_generation"; // Phase 4

    // 1. BUILD CONTEXT (Used for Phase 1 and 2)
    let fileContext = "";
    files.forEach((file, index) => {
        fileContext += `\n--- FILE ${index + 1}: ${file.fileName} ---\n${file.content}\n`;
    });

    // 2. THE MULTI-PHASE PROMPT ENGINE
    let prompt = "";

    if (isCodeGeneration) {
      // --- PHASE 4: SYSTEM-SPECIFIC CODE WRITING ---
      prompt = `
        Act as a Senior Integration Developer specializing in ${targetSystem}.
        Generate the exact transformation logic required to map Source Fields to the Target Schema.

        TARGET SYSTEM: ${targetSystem}
        FINAL MAPPINGS: ${JSON.stringify(input.mappings)}
        SOURCE SCHEMA: ${JSON.stringify(input.source_schema)}
        TARGET SCHEMA: ${JSON.stringify(input.target_schema)}
        USER RULES: ${input.user_instructions || "None"}

        SPECIFIC SYNTAX RULES:
        1. If MuleSoft: Write valid DataWeave 2.0 (.dwl). Include header mapping and a 'map' function for lines if they exist.
        2. If Boomi: Generate a valid XSLT 1.0 stylesheet compatible with Boomi's XSLT component.
        3. If DextrHub: You are generating a JSON MAPPING FILE, not a data payload. 
           - NO SAMPLE DATA: Use source paths like "source.header.fieldname" or "source.lines.fieldname".
           - NO DEFAULTS: If no mapping exists, use "". Do NOT invent values like "NET30".
           - DEXTR STRUCTURE: The output must have exactly two root keys: "header" (an object) and "lines" (an array containing exactly one mapping object).
           - NO SYSTEM KEYS: Never use "iterate", "map", or "foreach" keys in the JSON.
        4. Apply "rule" logic (e.g., formatDate, toUpper) directly into the string value.
        5. STRICT FIELD MATCHING: 
        - Pay close attention to field names with punctuation, such as "No.". 
        - If the Mapping shows a Source mapped to "No.", ensure the output JSON uses that exact key "No." and assigns the correct source path (e.g., "source.lines.SKU").
        - NEVER output null for a field that has an active mapping in the input.
        6. If the target schema includes fields with periods (e.g., 'No.'), generate the XML tag using an underscore (e.g., 'No_') but add a comment indicating the original schema requirement.

        OUTPUT FORMAT (Strict JSON):
        { "generated_code": "...the code snippet text..." }
      `;
    } else if (isMappingSuggestion) {
      // --- PHASE 3: SEMANTIC MAPPING ---
      prompt = `
        Act as an ERP Data Integration Expert. 
        Compare Source Fields and Target Schema. Suggest a mapping for every Target field.
        
        SOURCE FIELDS: ${JSON.stringify(input.source_fields)}
        TARGET SCHEMA: ${JSON.stringify(input.target_schema)}
        USER INSTRUCTIONS: ${input.user_instructions || "None"}
        
        OUTPUT FORMAT (Strict JSON):
        {
          "suggestions": [
            { "source": "field_name", "target": "field_name", "rule": "logic", "confidence": 0.95 }
          ]
        }
      `;
    } else if (isSourceAnalysis) {
      // --- PHASE 2: ENHANCED INTERNAL FILE ANALYSIS ---
      prompt = `
        Analyze these internal system files. Extract every unique field name, identify its data type, and provide one realistic sample value.
        
        DATA TYPES: "String", "Integer", "Decimal", "Date", "Boolean".

        DATA:
        ${fileContext}

        OUTPUT FORMAT (Strict JSON):
        { 
          "header": { "field_name": { "type": "String", "sample": "value" } },
          "lines": [{ "field_name": { "type": "String", "sample": "value" } }]
        }
      `;
    } else {
      // PHASE 1 LOGIC (Default)
      prompt = `
        Analyze the provided data for a ${targetSystem} integration.
        Create a JSON schema describing the fields.
        - If 1 file is provided (flat list), put all fields in "header" and leave "lines" empty.
        - If hierarchy is detected, split into "header" and "lines".
        - IDENTIFY SHARED KEYS: If a field (like "external_doc_no" or "OrderID") exists in both sections, include it in BOTH.
        
        STRICT DATA TYPES: "Date", "Decimal", "Integer", "String", "Boolean".
        DATA:
        ${fileContext}
        OUTPUT FORMAT (Strict JSON):
        {
          "header": { "FieldName": "Type" },
          "lines": [{ "FieldName": "Type" }]
        }
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.status(200).json({ response: response.text() });

  } catch (error) {
      console.error("Gemini Error:", error);
      return res.status(500).json({ error: error.message });
  }
}