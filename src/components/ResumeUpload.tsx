import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { convertPdfToText } from "@/utils/pdfToText"; // Import the utility function

interface ResumeUploadProps {
  onUpload: (text: string) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload }) => {
  const [fileName, setFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    try {
      if (file.type === "application/pdf") {
        const text = await convertPdfToText(file);
        onUpload(text);
      } else if (file.type === "text/plain") {
        const text = await file.text();
        onUpload(text);
      } else {
        alert("Please upload a PDF or TXT file.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      alert("An error occurred while processing the file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="resume"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Upload your resume (PDF or TXT format):
      </label>
      <div className="flex items-center">
        <Input
          type="file"
          id="resume"
          accept=".pdf,.txt"
          onChange={handleFileUpload}
          className="sr-only"
        />
        <label
          htmlFor="resume"
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-l flex items-center"
        >
          <Upload className="w-5 h-5 mr-2" />
          Choose File
        </label>
        <span className="border border-gray-300 rounded-r px-4 py-2 w-full">
          {isLoading ? "Processing..." : fileName || "No file chosen"}
        </span>
      </div>
    </div>
  );
};

export default ResumeUpload;
