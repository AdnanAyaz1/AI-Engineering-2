import { NextRequest, NextResponse } from "next/server";
import { loadTextFile, loadDocxFile, loadPdfFile } from "@/lib/rag/loaders";
import { chunkText } from "@/lib/rag/chunk";
import { embedChunks } from "@/lib/rag/embed";
import { storeDocument } from "@/lib/rag/store";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let content: string;

    switch (file.name.split(".").pop()?.toLowerCase()) {
      case "txt":
        content = await loadTextFile(file);
        break;

      case "docx":
        content = await loadDocxFile(file);
        break;

      case "pdf":
        content = await loadPdfFile(file);
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported file format" },
          { status: 400 },
        );
    }

    const chunks = await chunkText(content, file.name);

    const embeddedChunks = await embedChunks(chunks);

    console.log("embedded chubks", embeddedChunks?.slice(0, 2));

    // const result = await storeDocument(file.name, embeddedChunks);

    // return NextResponse.json({
    //   success: true,
    //   fileName: file.name,
    //   documentId: result.documentId,
    //   totalCharacters: content.length,
    //   totalChunks: result.totalChunks,
    //   message: "Document processed and stored successfully",
    // });
  } catch (error) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 },
    );
  }
}
