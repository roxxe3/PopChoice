import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import {GEMENI_API_KEY, SUPERBASE_API_KEY} from './env.js';
import movies from "./content.js";

const privateKey = SUPERBASE_API_KEY;
if (!privateKey) throw new Error(`Expected env var SUPABASE_API_KEY`);
const url = "https://kdpejypwdvwgophpylqm.supabase.co";
if (!url) throw new Error(`Expected env var SUPABASE_URL`);
export const supabase = createClient(url, privateKey);


const genAI = new GoogleGenerativeAI(GEMENI_API_KEY);
const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

async function run(input) {
    try {
        const data = await Promise.all(input.map(async movie => {
            const result = await model.embedContent(movie.content);
            const obj = {
                content: movie.content,
                embedding: result.embedding.values
            };
            return obj;
        }));
        await supabase.from('documents').insert(data);
    } catch (error) {
        console.error("Error during embedding:", error);
    }
}

export async function queryMovies(input) {
    const result = await model.embedContent(input);
    const embedding = result.embedding.values;
    const { data } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.40,
        match_count: 1
      }); 
      console.log(data)
}
