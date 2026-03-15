const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate a recipe suggestion using Groq AI
 * @param {string} dishName - Name of the dish
 * @returns {Promise<object>} - Parsed recipe data
 */
const generateRecipeSuggestion = async (dishName) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Generate a detailed recipe for "${dishName}" in JSON format with these exact fields: description (string), cookingTime (number in minutes), prepTime (number in minutes), difficulty (Easy/Medium/Hard), ingredients (array of strings), steps (array of strings), tags (array of strings). Return ONLY valid JSON, no markdown, no explanation.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const content = response.choices[0].message.content;
    const cleanContent = content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error("Groq AI Error:", error);
    throw error;
  }
};

/**
 * Get a chat response from UmamiBot AI
 * @param {string} userMessage - The message from the user
 * @returns {Promise<string>} - The AI's response
 */
const getAIChatResponse = async (userMessage) => {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are UmamiBot, a friendly cooking assistant for UmamiCircle, a food social media platform. You ONLY answer questions about food, cooking, recipes, ingredients, kitchen techniques, nutrition, and food culture. If the user asks about anything unrelated to food or cooking (such as programming, politics, relationships, math, etc.), politely decline and redirect them back to cooking topics. Always be helpful, friendly and encouraging about cooking."
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Groq AI Chat Error:", error);
    throw error;
  }
};

module.exports = {
  generateRecipeSuggestion,
  getAIChatResponse,
};
