export function splitText(text: string, chunksize = 500) {
  const chunks = [];
  for (let i = 0; i < text.length; i++) {
    chunks.push(text.slice(i, i + chunksize));
  }

  return chunks;
}
