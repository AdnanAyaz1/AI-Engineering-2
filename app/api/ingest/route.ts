import { NextRequest, NextResponse } from "next/server";
import { loadTextFile, loadDocxFile, loadPdfFile } from "@/lib/rag/loaders";
import { chunkText } from "@/lib/rag/chunk";
import { embedChunks } from "@/lib/rag/embed";
import { storeDocument } from "@/lib/rag/store";

export async function POST(req: NextRequest) {
  try {
    // 1. Get uploaded file
    const formData = await req.formData();
    const file = formData.get("file");

    console.log("file",file)

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. Extract text based on file type
    let content: string;

    switch (file.name.split(".").pop()?.toLowerCase()) {
      case "txt":
        content = await loadTextFile(file);
        break;

      case "docx":
        content = await loadDocxFile(file);
        break;

      case "pdf":
        content = await loadPdfFile(file) as string;
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported file format" },
          { status: 400 },
        );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "Document contains no readable text" },
        { status: 400 },
      );
    }

    // 3. Split extracted text into chunks
    const chunks = await chunkText(content, file.name);

    if (!chunks.length) {
      return NextResponse.json(
        { error: "No chunks generated from document" },
        { status: 400 },
      );
    }

    // 4. Generate embeddings
    const embeddedChunks = await embedChunks(chunks);

    // 5. Store document and embeddings in PostgreSQL
    const result = await storeDocument(file.name, embeddedChunks);

    // 6. Return response
    return NextResponse.json({
      success: true,
      fileName: file.name,
      documentId: result.documentId,
      totalCharacters: content.length,
      totalChunks: result.totalChunks,
      embeddingDimensions: embeddedChunks[0]?.embedding.length,
      message: "Document processed and stored successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process file",
      },
      { status: 500 },
    );
  }
}
