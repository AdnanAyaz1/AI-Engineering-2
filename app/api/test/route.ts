import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Insert a document
    const document = await prisma.document.create({
      data: {
        fileName: "database-test.txt",
      },
    });

    // 2. Retrieve the document
    const retrievedDocument = await prisma.document.findUnique({
      where: {
        id: document.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      document: retrievedDocument,
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database operation failed",
      },
      { status: 500 },
    );
  }
}
