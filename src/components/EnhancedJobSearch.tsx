// src/components/EnhancedJobSearch.tsx
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { JobSearchProvider, useJobSearch } from "../contexts/JobSearchContext";
import { useTensorFlowModel } from "../hooks/useTensorFlowModel";
import { extractKeywords } from "../utils/resumeAnalysis";
import { generateChatResponse } from "../utils/chatbot";
import JobList from "./JobList";
import SearchBar from "./SearchBar";
import ChatInterface from "./ChatInterface";
import ResumeUpload from "./ResumeUpload";
import { Message } from "../types";

import { pdfToText } from "@/utils/pdfToText"; // Make sure to import this

const EnhancedJobSearch: React.FC = () => {
  // Chat-related state
  const [messages, setMessages] = useState<Message[]>([]);
  const [resumeEmbedding, setResumeEmbedding] = useState<any>(null);
  const [, setResumeText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { model } = useTensorFlowModel();

  const handleResumeUpload = async (file: File) => {
    if (file.type !== "text/plain" && file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt or .pdf file.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 1MB.",
        variant: "destructive",
      });
      return;
    }
    try {
      let text: string;
      if (file.type === "application/pdf") {
        text = await pdfToText(file);
      } else {
        text = await file.text();
      }
      setResumeText(text);
      await analyzeResumeAndUpdateJobs(text);
    } catch (error) {
      console.error("Error processing resume:", error);
      setError(
        `Failed to process resume: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your resume. Please try again.",
        },
      ]);
    }
  };
  const analyzeResumeAndUpdateJobs = async (resumeText: string) => {
    if (!model) {
      setError(
        "TensorFlow model not loaded. Please refresh the page and try again.",
      );
      return;
    }

    try {
      setMessages([{ role: "assistant", content: "Analyzing resume..." }]);

      const embedding = await model.embed(resumeText);
      setResumeEmbedding(embedding);

      // Extract keywords from the resume text
      const keywords = extractKeywords(resumeText);

      // Store keywords in localStorage
      localStorage.setItem("resumeKeywords", JSON.stringify(keywords));

      // Update chat messages to reflect the extracted keywords
      setMessages([
        {
          role: "assistant",
          content: `Resume analyzed. I've updated the job listings based on your skills and experience. Here are some keywords I found: ${keywords.join(", ")}. Let me know if you have any questions about the job listings or your job search!`,
        },
      ]);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setError(
        `Failed to analyze resume: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const userMessage = input.value.trim();

    if (userMessage) {
      setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
      input.value = "";
      setIsLoading(true);
      setError(null);

      try {
        const response = await generateChatResponse(
          userMessage,
          model,
          resumeEmbedding,
        );
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: response },
        ]);
      } catch (error) {
        console.error("Error generating response:", error);
        setError(
          `Failed to generate response: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I apologize, but I'm having trouble generating a complete response right now. Here are some general tips: ...",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const JobSearchTab: React.FC = () => {
    const { setInitialKeywords } = useJobSearch();

    useEffect(() => {
      // Retrieve keywords from local storage
      const storedKeywords = localStorage.getItem("resumeKeywords");
      if (storedKeywords) {
        setInitialKeywords(JSON.parse(storedKeywords));
      }
    }, [setInitialKeywords]);

    return (
      <>
        <SearchBar />
        <JobList />
      </>
    );
  };

  return (
    <JobSearchProvider>
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Job Search Platform
        </h1>
        <Tabs defaultValue="jobs">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="jobs">Job Listings</TabsTrigger>
            <TabsTrigger value="chat">Resume Chatbot</TabsTrigger>
          </TabsList>
          <TabsContent value="jobs">
            <JobSearchTab />
          </TabsContent>
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle>Resume Chatbot</CardTitle>
              </CardHeader>
              <CardContent>
                <ResumeUpload onUpload={handleResumeUpload} />
                <ChatInterface
                  messages={messages}
                  isLoading={isLoading}
                  error={error}
                  onSubmit={handleChatSubmit}
                  resumeEmbedding={resumeEmbedding}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </JobSearchProvider>
  );
};

export default EnhancedJobSearch;
