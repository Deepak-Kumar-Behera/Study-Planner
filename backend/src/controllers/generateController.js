const axios = require('axios');
const Plan = require('../models/Plan');
const Note = require('../models/Note');
const Quiz = require('../models/Quiz');
const Revision = require('../models/Revision');
const Input = require('../models/Input');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent';


function buildPrompt(input, type) {
  return `
You are an expert AI study assistant.
Given the following ${type}: "${input}", generate a JSON object with the following structure:
{
  "plan": [
    { "step": "Step description", "details": "Optional details for the step" },
    ...
  ],
  "notes": [
    { "title": "Section title", "content": "Section content" },
    ...
  ],
  "revision": [
    { "topic": "Topic name", "status": "pending" },
    ...
  ]
}

For the notes:
- Use detailed bullet points and pointers for all important concepts.
- If possible, include tables (in markdown) for structured data.
- If possible, include Mermaid.js diagrams in markdown code blocks (using \`\`\`mermaid ... \`\`\`).
- Use markdown formatting for bullets, tables, and diagrams.
- Make the notes as comprehensive and visually clear as possible.

IMPORTANT rules for Mermaid diagrams:
- Only use "graph TD" or "graph LR" (flowchart) or "sequenceDiagram" types.
- Node labels must NOT contain parentheses (), pipe characters |, colons :, semicolons ;, or any special characters.
- Use only plain alphanumeric text and spaces inside double-quoted labels, e.g. A["My Label"].
- Every node ID must be a simple alphanumeric string with no spaces (e.g. A, B, nodeX).
- Do NOT use subgraph.
- Do NOT use classDef, class, or style statements.
- Each arrow must be exactly --> with no extra characters.
- Keep diagrams very simple (max 8 nodes).
- If in doubt, use a markdown table or bullet list instead of a diagram.
- Example of valid diagram:
  graph TD
    A["Input Data"] --> B["Process Step"]
    B --> C["Output Result"]
- Example of INVALID node (do not use): A(Disk Block 0 | Next: 2)

Do NOT generate any quiz questions in this response.
Return ONLY the JSON object, no explanation or markdown outside the JSON.
`;
}

// --- Robust AI JSON cleaning (for parsing only) ---
function robustCleanAIResponse(aiText) {
  let cleaned = aiText;
  // Remove outer code fences (```json or ```)
  cleaned = cleaned.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  // Replace all inner triple backticks with a placeholder (to avoid breaking JSON)
  cleaned = cleaned.replace(/```/g, '`CODEBLOCK`');
  // Fix invalid JSON escape sequences produced by AI (e.g. \| \- \: at end of markdown table rows)
  // Valid JSON escapes are: \" \\ \/ \b \f \n \r \t \uXXXX — anything else is invalid
  cleaned = cleaned.replace(/\\([^"\\/bfnrtu])/g, '$1');
  
  // Fix literal bold markdown symbols being unnecessarily escaped by some AI models
  cleaned = cleaned.replace(/\\\*/g, '*');

  // Fix literal control characters (real newlines, tabs, carriage returns) inside JSON string values.
  // The AI sometimes outputs real newline characters inside JSON strings instead of the \n escape,
  // especially in long markdown tables. JSON.parse() rejects these as "Bad control character".
  // Strategy: match every JSON string (handling escaped chars), then escape any raw control chars found inside.
  cleaned = cleaned.replace(/"((?:[^"\\]|\\[^])*)"/g, (match, content) => {
    const fixed = content
      .replace(/\r\n/g, '\\n')
      .replace(/\r/g, '\\n')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');
    return '"' + fixed + '"';
  });
  return cleaned;
}

exports.generate = async (req, res) => {
  const { input, type, userId } = req.body;
  if (!input || !type || !userId) {
    return res.status(400).json({ message: 'Input, type, and userId are required.' });
  }
  try {
    // Find or create the input in the Input collection (scoped to this user)
    let inputDoc = await Input.findOne({ userId, value: input });
    if (!inputDoc) {
      inputDoc = await Input.create({ userId, value: input });
    }
    const inputId = inputDoc._id;

    const prompt = buildPrompt(input, type);
    const geminiRes = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    const aiText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    let aiJson;
    console.log("url:", `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`);
    console.log('AI response text:', aiText);

    let cleaned = robustCleanAIResponse(aiText);
    // Remove escapeNoteContents logic: do not escape newlines or backslashes in note content
    // Only clean for code fences and JSON parsing

    try {
      aiJson = JSON.parse(cleaned.replace(/`CODEBLOCK`/g, '```'));
    } catch (e) {
      console.error('JSON parse error:', e, '\nRaw AI text:', aiText);
      return res.status(500).json({ message: 'AI response could not be parsed.' });
    }
    // --- Restore original markdown in notes before saving ---
    if (Array.isArray(aiJson.notes)) {
      aiJson.notes = aiJson.notes.map(n => {
        if (typeof n.content === 'string') {
          n.content = n.content.replace(/`CODEBLOCK`/g, '```');
        }
        return n;
      });
    }

    // Store in separate collections
    try {
      if (Array.isArray(aiJson.plan)) {
        await Plan.insertMany(aiJson.plan.map(p => ({ userId, inputId, type, ...p })));
      }
      if (Array.isArray(aiJson.notes)) {
        await Note.insertMany(aiJson.notes.map(n => ({ userId, inputId, type, ...n })));
      }
      if (Array.isArray(aiJson.quiz)) {
        await Quiz.insertMany(
          aiJson.quiz.map(q => ({
            userId,
            inputId,
            type,
            question: q.question,
            options: q.options,
            answer: q.answer
          }))
        );
      }
      if (Array.isArray(aiJson.revision)) {
        await Revision.insertMany(aiJson.revision.map(r => ({ userId, inputId, type, ...r })));
      }
    } catch (dbErr) {
      console.error('DB save error:', dbErr);
      // Optionally, you can still return the AI response even if DB save fails
    }

    res.json(aiJson);
  } catch (err) {
    console.log(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`);
    console.error('Gemini API error:', err?.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate study plan.' });
  }
};

// Generate quiz from previously stored notes for an input
exports.generateQuiz = async (req, res) => {
  const userId = req.user.userId;
  const { inputId } = req.body;
  if (!inputId) {
    return res.status(400).json({ message: 'inputId is required.' });
  }
  try {
    const inputDoc = await Input.findById(inputId);
    if (!inputDoc) return res.status(404).json({ message: 'Input not found.' });

    // Fetch stored notes for this input
    const notes = await Note.find({ inputId }).lean();
    let notesContent = '';
    if (notes.length > 0) {
      notesContent = notes.map(n => `## ${n.title}\n${n.content}`).join('\n\n');
    }

    let prompt;
    if (notesContent) {
      prompt = `You are an expert AI study assistant.
Based ONLY on the following study notes, generate exactly 10 multiple-choice quiz questions that test understanding of the content.

--- NOTES START ---
${notesContent}
--- NOTES END ---

Return ONLY a JSON object with this exact structure:
{
  "quiz": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}

Rules:
- Each question must have exactly 4 options.
- The "answer" field must be exactly one of the 4 option strings.
- Base all questions strictly on the notes provided above.
- Return ONLY the JSON, no explanation or markdown outside the JSON.`;
    } else {
      prompt = `You are an expert AI study assistant.
Generate exactly 10 multiple-choice quiz questions on the topic: "${inputDoc.value}".

Return ONLY a JSON object with this exact structure:
{
  "quiz": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A"
    }
  ]
}

Rules:
- Each question must have exactly 4 options.
- The "answer" field must be exactly one of the 4 option strings.
- Return ONLY the JSON, no explanation or markdown outside the JSON.`;
    }

    const geminiRes = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    const aiText = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleaned = robustCleanAIResponse(aiText);
    let aiJson;
    try {
      aiJson = JSON.parse(cleaned.replace(/`CODEBLOCK`/g, '```'));
    } catch (e) {
      console.error('Quiz JSON parse error:', e, '\nRaw AI text:', aiText);
      return res.status(500).json({ message: 'AI response could not be parsed.' });
    }

    if (!Array.isArray(aiJson.quiz) || aiJson.quiz.length === 0) {
      return res.status(500).json({ message: 'No quiz questions generated.' });
    }

    // Replace existing quizzes for this user+input
    await Quiz.deleteMany({ userId, inputId });
    const saved = await Quiz.insertMany(
      aiJson.quiz.map(q => ({
        userId,
        inputId,
        type: inputDoc.type || 'topic',
        question: q.question,
        options: q.options,
        answer: q.answer,
      }))
    );

    res.json({ quiz: saved });
  } catch (err) {
    console.error('generateQuiz error:', err?.response?.data || err.message);
    res.status(500).json({ message: 'Failed to generate quiz.' });
  }
};
