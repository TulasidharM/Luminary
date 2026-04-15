const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);
const MOOD_EMOJIS = {
  1: '😢', 2: '😕', 3: '😐', 4: '🙂', 5: '😄'
};

/**
 * Summarizes a single day's entries using Gemini.
 */
async function generateDailySummary(entries) {
  if (!API_KEY || entries.length === 0) return null;

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  const combinedContent = entries.map(e => `- ${e.title}: ${e.content}`).join('\n');
  const prompt = `Below is a list of diary entries for a single day. 
  Summarize the day's events and mood in exactly one concise, meaningful sentence. 
  Do not include any headers or meta-talk.
  
  Entries:
  ${combinedContent}`;

  try {
    console.log("sending request to gemini");
    const result = await model.generateContent(prompt);
    console.log("got result : " + result);
    const response = result.response;
    return response.text().trim();
  } catch (err) {
    console.error('Gemini API Error:', err);
    return "Reflecting on the day's journey...";
  }
}

/**
 * Calculates the average mood emoji for a set of entries.
 */
function calculateAvgMoodEmoji(entries) {
  if (entries.length === 0) return MOOD_EMOJIS[3];
  const avg = entries.reduce((acc, curr) => acc + curr.mood, 0) / entries.length;
  const rounded = Math.round(avg);
  return MOOD_EMOJIS[rounded] || MOOD_EMOJIS[3];
}

/**
 * Summarizes multiple days of entries using Gemini in a single request.
 * entriesByDate: { "YYYY-MM-DD": [entries], ... }
 * Returns: { "YYYY-MM-DD": "Summary text", ... }
 */
async function generateBatchSummaries(entriesByDate) {
  const dates = Object.keys(entriesByDate);
  if (!API_KEY || dates.length === 0) return {};

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  
  let contentToSummarize = "";
  dates.forEach(date => {
    const entries = entriesByDate[date];
    const combined = entries.map(e => `- ${e.title}: ${e.content}`).join('\n');
    contentToSummarize += `Date: ${date}\nEntries:\n${combined}\n\n`;
  });

  const prompt = `Below are diary entries grouped by date. 
  For each date, provide exactly one concise, meaningful sentence summarizing the events and mood.
  Format your response strictly as a JSON object where keys are the dates and values are the summaries.
  Do not include any headers, markdown code blocks, or meta-talk.
  
  Example format:
  {"2024-04-10": "A productive day at work followed by a relaxing evening.", "2024-04-11": "Felt a bit overwhelmed but managed to find peace through meditation."}

  Data:
  ${contentToSummarize}`;

  try {
    console.log("sending batch request to gemini for dates:", dates);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Clean up potential markdown code blocks if Gemini includes them
    const jsonString = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (err) {
    console.error('Gemini Batch API Error:', err);
    return {};
  }
}

module.exports = {
  generateDailySummary,
  generateBatchSummaries,
  calculateAvgMoodEmoji
};