// src/components/ResumeUpload.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface ResumeUploadProps {
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resumeText: string;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({
  onUpload,
  resumeText,
}) => {
  return (
    <div className="mb-4">
      <label
        htmlFor="resume"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Upload your resume (TXT format):
      </label>
      <div className="flex items-center">
        <Input
          type="file"
          id="resume"
          accept=".txt"
          onChange={onUpload}
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
          {resumeText ? "Resume uploaded" : "No file chosen"}
        </span>
      </div>
    </div>
  );
};

export default ResumeUpload;
