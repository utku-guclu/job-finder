import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface ResumeUploadProps {
  onUpload: (file: File) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUpload }) => {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onUpload(file);
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
          onChange={handleFileChange}
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
          {fileName || "No file chosen"}
        </span>
      </div>
    </div>
  );
};

export default ResumeUpload;
