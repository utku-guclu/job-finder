import pdfParse from "pdf-parse";

export const pdfToText = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const pdfData = await pdfParse(buffer);

  // The extracted text will be available in pdfData.text
  return pdfData.text;
};
