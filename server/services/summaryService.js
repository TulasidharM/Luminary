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

module.exports = {
  generateDailySummary,
  calculateAvgMoodEmoji
};