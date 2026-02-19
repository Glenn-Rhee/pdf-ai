import ollama from "ollama";
export async function createEmbedding(text: string) {
  const res = await ollama.embeddings({
    model: "nomic-embed-text",
    prompt: text,
  });

  return res.embedding;
}