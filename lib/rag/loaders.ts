import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export async function loadTextFile(file: File) {
  const content = await file.text();
  return content;
}

export async function loadDocxFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  //  file.arrayBuffer() reads the uploaded file as binary data.
  // Buffer.from() converts that binary data into a Node.js Buffer.

  const result = await mammoth.extractRawText({ buffer });

  return result.value;
}

export async function loadPdfFile(file: File) {
  try {
    const buffer = await file.arrayBuffer();

    const pdf = await getDocumentProxy(new Uint8Array(buffer));

    const result = await extractText(pdf, {
      mergePages: true,
    });

    return result.text;
  } catch (error) {
    console.log("PDF ERROR", error);
  }
}
