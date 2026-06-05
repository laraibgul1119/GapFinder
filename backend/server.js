import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { parse } from 'csv-parse/sync';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const elasticUrl = process.env.ELASTIC_URL || "https://gapfinder-hackathon-b278e4.es.us-central1.gcp.elastic.cloud";
const elasticApiKey = process.env.ELASTIC_API_KEY || "SjFlUGdwNEJMcURjOFNxMDJUVzE6YlpZU1NOUGZ2Sk1ucjVLdzl5LVVwZw==";

// Initialize Google GenAI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Route to handle CSV upload and ingestion
app.post('/api/upload', async (req, res) => {
  try {
    const { csvText } = req.body;
    if (!csvText) {
      return res.status(400).json({ error: 'No CSV data provided' });
    }

    console.log("Parsing CSV data...");
    let records;
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
    } catch (parseErr) {
      console.error("CSV parse error:", parseErr);
      return res.status(400).json({ error: 'Failed to parse CSV data: ' + parseErr.message });
    }

    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    console.log(`Parsed ${records.length} records. Normalizing headers...`);
    const normalizedRecords = records.map((record) => {
      const getVal = (possibleKeys, defaultVal = "") => {
        for (const key of Object.keys(record)) {
          if (possibleKeys.includes(key.toLowerCase().trim())) {
            return record[key];
          }
        }
        return defaultVal;
      };

      const studentName = getVal(["student_name", "studentname", "student_id", "studentid", "name", "student"]);
      const questionId = getVal(["question_id", "questionid", "qid", "question"]);
      const questionText = getVal(["question_text", "questiontext", "question_description", "description", "text"], `Question ${questionId}`);
      const studentAnswer = getVal(["student_answer", "studentanswer", "response", "answer", "student_response"]);
      const correctAnswer = getVal(["correct_answer", "correctanswer", "correct_response", "correct"]);
      const scoreVal = getVal(["score", "points", "correct", "is_correct", "status"]);
      
      let score = 0;
      if (scoreVal !== undefined && scoreVal !== null) {
        const s = String(scoreVal).toLowerCase().trim();
        if (s === "true" || s === "1" || s === "correct" || s === "yes") {
          score = 1;
        } else if (s === "false" || s === "0" || s === "incorrect" || s === "no") {
          score = 0;
        } else {
          const parsed = parseInt(s, 10);
          score = isNaN(parsed) ? 0 : parsed;
        }
      }

      const topic = getVal(["topic", "category", "subject", "learning_objective", "skill"], "general");

      return {
        student_name: studentName || "Unknown Student",
        question_id: questionId || "Unknown QID",
        question_text: questionText,
        student_answer: studentAnswer || "No Answer",
        student_answer_semantic: studentAnswer || "No Answer",
        correct_answer: correctAnswer || "No Correct Answer Provided",
        score: score,
        topic: topic
      };
    });

    // 1. Clear the quiz_data index
    console.log("Clearing existing documents in quiz_data...");
    const clearResponse = await fetch(`${elasticUrl}/quiz_data/_delete_by_query`, {
      method: "POST",
      headers: {
        "Authorization": `ApiKey ${elasticApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: {
          match_all: {}
        }
      })
    });

    if (!clearResponse.ok) {
      const errText = await clearResponse.text();
      console.error("Failed to clear index:", clearResponse.status, errText);
      // We can continue indexing even if clear fails (e.g. index doesn't exist yet, although it does)
    } else {
      console.log("Index cleared successfully.");
    }

    // 2. Ingest documents via _bulk
    console.log("Bulk indexing documents to quiz_data...");
    const bulkPayload = normalizedRecords.flatMap(doc => [
      { index: { _index: 'quiz_data' } },
      doc
    ]).map(item => JSON.stringify(item)).join('\n') + '\n';

    const bulkResponse = await fetch(`${elasticUrl}/quiz_data/_bulk`, {
      method: "POST",
      headers: {
        "Authorization": `ApiKey ${elasticApiKey}`,
        "Content-Type": "application/x-ndjson"
      },
      body: bulkPayload
    });

    if (!bulkResponse.ok) {
      const errText = await bulkResponse.text();
      console.error("Bulk ingestion failed:", bulkResponse.status, errText);
      return res.status(500).json({ error: 'Failed to ingest data into Elasticsearch' });
    }

    const bulkResult = await bulkResponse.json();
    console.log(`Successfully ingested ${normalizedRecords.length} records.`);

    res.json({
      success: true,
      recordsCount: normalizedRecords.length
    });
  } catch (err) {
    console.error("Upload handler error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Helper functions to talk directly to Elasticsearch
async function searchElasticsearch(queryBody) {
  try {
    const response = await fetch(`${elasticUrl}/quiz_data/_search`, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${elasticApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(queryBody)
    });
    if (!response.ok) {
      return { error: `HTTP ${response.status}: ${await response.text()}` };
    }
    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}

async function runEsqlQuery(queryStr) {
  try {
    const response = await fetch(`${elasticUrl}/_query`, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${elasticApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: queryStr })
    });
    if (!response.ok) {
      return { error: `HTTP ${response.status}: ${await response.text()}` };
    }
    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}

// Structured schema for Gemini response
const responseSchema = {
  type: 'OBJECT',
  properties: {
    totalStudents: {
      type: 'INTEGER',
      description: 'The total number of unique students in the quiz data.'
    },
    totalAffected: {
      type: 'INTEGER',
      description: 'The total number of unique students who are affected by at least one learning gap (i.e. had a score of 0 on one or more questions).'
    },
    learningGaps: {
      type: 'ARRAY',
      description: 'The identified learning gaps (usually 3 main gaps).',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'INTEGER' },
          title: { type: 'STRING', description: 'Clear, concise title of the learning gap (e.g. topic name or conceptual gap).' },
          strugglingCount: { type: 'INTEGER', description: 'Number of unique students struggling with this specific gap.' },
          totalStudents: { type: 'INTEGER', description: 'Total number of students in the class.' },
          misconception: { type: 'STRING', description: 'Detailed description of the key student misconception identified from the incorrect answers.' },
          activities: {
            type: 'OBJECT',
            properties: {
              struggling: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING', description: 'Name of the activity for struggling students.' },
                  bullets: {
                    type: 'ARRAY',
                    items: { type: 'STRING' },
                    description: 'Exactly 4 specific, actionable bullet points for the teacher to execute.'
                  }
                },
                required: ['title', 'bullets']
              },
              onTrack: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING', description: 'Name of the activity for on-track students.' },
                  bullets: {
                    type: 'ARRAY',
                    items: { type: 'STRING' },
                    description: 'Exactly 4 specific, actionable bullet points for the teacher to execute.'
                  }
                },
                required: ['title', 'bullets']
              },
              advanced: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING', description: 'Name of the activity for advanced students.' },
                  bullets: {
                    type: 'ARRAY',
                    items: { type: 'STRING' },
                    description: 'Exactly 4 specific, actionable bullet points for the teacher to execute.'
                  }
                },
                required: ['title', 'bullets']
              }
            },
            required: ['struggling', 'onTrack', 'advanced']
          }
        },
        required: ['id', 'title', 'strugglingCount', 'totalStudents', 'misconception', 'activities']
      }
    }
  },
  required: ['totalStudents', 'totalAffected', 'learningGaps']
};

// Route to run Gemini Flash AI Agent analysis
app.post('/api/analyze', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in .env' });
    }

    console.log("Starting Gemini Flash AI Agent analysis...");

    const systemPrompt = `You are an expert educator, curriculum designer, and pedagogical AI agent.
Your goal is to analyze the student quiz data stored in Elasticsearch to find the primary learning gaps and misconceptions in the class, and then build a targeted, differentiated re-teaching plan.

You must follow these rules:
1. Use the provided tools (search_quiz_data, run_esql_query) to understand the quiz results.
2. Query the data to identify:
   - What topics or questions had the highest failure rates (score = 0).
   - What incorrect answers (student_answer) students gave. Use semantic search to cluster similar incorrect student answers together and find common misconceptions.
   - Which specific students are struggling with which topics.
3. Group the learning gaps into exactly 3 distinct conceptual learning gaps.
4. For each learning gap:
   - Define a clear title.
   - Calculate how many unique students are struggling (score = 0 on questions related to this gap).
   - Write a clear description of the misconception (the "why" behind the wrong answers).
   - Provide concrete, actionable, and differentiated re-teaching activities for three tiers of learners:
     - Struggling: High-scaffolding, direct support, concrete models, or diagrams.
     - On-Track: Independent practice, sorting cards, data tables, or peer review.
     - Advanced: Research challenges, design an investigation, deep dive, or teaching others.
     - Each tier must have a specific activity title and EXACTLY 4 bullet points outlining instructions.
5. Provide the output in the requested JSON structure. Do not return any other text besides the JSON.`;

    const tools = [
      {
        functionDeclarations: [
          {
            name: 'search_quiz_data',
            description: 'Perform an Elasticsearch search query on the quiz_data index using Query DSL. Useful for finding matches, filtering by student_name or topic, or performing semantic search on student_answer_semantic.',
            parameters: {
              type: 'OBJECT',
              properties: {
                query_body: {
                  type: 'OBJECT',
                  description: 'The Elasticsearch query DSL object.'
                }
              },
              required: ['query_body']
            }
          },
          {
            name: 'run_esql_query',
            description: 'Run an ES|QL query against Elasticsearch. Useful for aggregations, counting errors by topic, or summarising scores.',
            parameters: {
              type: 'OBJECT',
              properties: {
                query: {
                  type: 'STRING',
                  description: 'The ES|QL query string.'
                }
              },
              required: ['query']
            }
          }
        ]
      }
    ];

    // Create the chat session
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: systemPrompt,
        tools: tools,
      }
    });

    let message = "Start your analysis on the quiz data in Elasticsearch to find the 3 key learning gaps and generate a structured JSON teaching plan.";
    let response = await chat.sendMessage({ message });

    let iterations = 0;
    const maxIterations = 15;

    while (response.functionCalls && response.functionCalls.length > 0 && iterations < maxIterations) {
      iterations++;
      console.log(`Agent Iteration ${iterations}: processing function calls...`);
      const toolResults = [];

      for (const call of response.functionCalls) {
        const { name, args } = call;
        console.log(`Executing tool: ${name} with args:`, args);

        let result;
        if (name === 'search_quiz_data') {
          result = await searchElasticsearch(args.query_body);
        } else if (name === 'run_esql_query') {
          result = await runEsqlQuery(args.query);
        } else {
          result = { error: `Tool ${name} not found` };
        }

        toolResults.push({
          functionResponse: {
            name,
            response: { result }
          }
        });
      }

      console.log(`Sending tool results back to agent...`);
      response = await chat.sendMessage({ message: toolResults });
    }

    console.log("AI Agent finished tool calling. Requesting final structured JSON output...");
    
    // Now request the final structured output
    const finalResponse = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: await chat.getHistory(),
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    });

    const resultJson = JSON.parse(finalResponse.text);
    console.log("Analysis generation success!");
    res.json(resultJson);

  } catch (err) {
    console.error("Analysis handler error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`GapFinder backend running at http://localhost:${port}`);
});
