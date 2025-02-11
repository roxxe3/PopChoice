import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { GEMENI_API_KEY, SUPERBASE_API_KEY } from "./env.js";
import movies from "./content.js";

const privateKey = SUPERBASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_API_KEY`);
const url = "https://kdpejypwdvwgophpylqm.supabase.co";
if (!url) throw new Error(`Expected env var SUPABASE_URL`);
export const supabase = createClient(url, privateKey);

const genAI = new GoogleGenerativeAI(GEMENI_API_KEY);
const emb_model = genAI.getGenerativeModel({ model: "text-embedding-004" });
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function run(input) {
  try {
    const data = await Promise.all(
      input.map(async (movie) => {
        const result = await emb_model.embedContent(movie.content);
        const obj = {
          content: movie.content,
          embedding: result.embedding.values,
        };
        return obj;
      })
    );
    await supabase.from("documents").insert(data);
  } catch (error) {
    console.error("Error during embedding:", error);
  }
}

export async function queryMovies(input) {
  const result = await emb_model.embedContent(input);
  const embedding = result.embedding.values;
  const { data } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_threshold: 0.4,
    match_count: 1,
  });
  return data[0].content;
}

const chatMessages = [
    {
      role: "model", // Changed role to "model" for the system message
      parts: [
        { text: `You are an enthusiastic movies expert who loves recommending movies to people. You will be given three pieces of information - some context about the movies and three question answers : the user favorite movie and why , is he in mood for somthing new or classic and if the user wanna have fun or want somthing serious. Your main job is to formulate a short answer to the question using the provided context. If you are unsure and cannot find the answer in the context, say, "Sorry, I don't know the answer." Please do not make up the answer.` }
      ],
    },
  ];
  
  export default async function getChatCompletion(data) {
    const query = data.movie + " " + data.mood + " " + data.preference;
    try {
      const text = await queryMovies(query);
      chatMessages.push({
        role: "user",
        parts: [{ text: `Context: ${text} Question: ${query}` }],
      });
  
      const response = await model.generateContent({
        contents: chatMessages,
        generationConfig: {
          maxOutputTokens: 150,
        },
      });
  
      const responseText = response.response.text();
      console.log("Gemini Response:", responseText);
      return responseText;
  
    } catch (error) {
      console.error("Error in getChatCompletion:", error);
      return "Sorry, I encountered an error while generating a movie recommendation."; // Handle errors in main function
    }
  }
