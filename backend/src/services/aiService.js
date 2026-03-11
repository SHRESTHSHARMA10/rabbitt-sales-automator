const Groq = require('groq-sdk');

// ─── Initialize the Groq client with our API key ───
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ─── Generate an AI-powered sales summary from parsed data ───
// Takes: an array of sales objects (from fileParser.js)
// Returns: a text summary string from Llama 3
const generateSummary = async (salesData) => {
  // Convert the sales data array into a readable string for the AI prompt
  const dataString = JSON.stringify(salesData, null, 2);

  // ─── The prompt tells the AI exactly what we want ───
  const prompt = `
You are a professional business analyst. Analyze the following sales data and provide a comprehensive summary report.

SALES DATA:
${dataString}

Please provide the following in your analysis:

1. **Executive Summary** — A brief overview of the overall sales performance.
2. **Top Performing Region** — Which region generated the most revenue and why.
3. **Best Product Category** — Which product category performed best.
4. **Revenue Insights** — Key observations about revenue trends, patterns, or anomalies.
5. **Recommendations** — 2-3 actionable suggestions to improve future sales.

Format your response in clean, professional markdown with headers and bullet points.
Keep the tone professional but easy to understand.
  `.trim();

  // ─── Call the Groq API with Llama 3 ───
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama-3.1-8b-instant',  // Llama 3.1 8B — fast and free on Groq
    temperature: 0.7,          // slightly creative but still factual
    max_tokens: 1500,          // enough for a detailed summary
  });

  // Extract the AI's response text
  const summary = chatCompletion.choices[0]?.message?.content;

  // Safety check: make sure we got a response
  if (!summary) {
    throw new Error('AI failed to generate a summary. Please try again.');
  }

  return summary;
};

module.exports = { generateSummary };
