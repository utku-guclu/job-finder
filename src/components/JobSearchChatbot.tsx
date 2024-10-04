import React, { useState, useEffect, useRef, useCallback } from "react";
import { load } from "@tensorflow-models/universal-sentence-encoder";
import * as tf from "@tensorflow/tfjs";
import { HfInference } from "@huggingface/inference";
import ReactMarkdown from "react-markdown";
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Send,
  Upload,
} from "lucide-react";

import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary_min: number;
  salary_max: number;
}

const ADZUNA_APP_ID = import.meta.env.VITE_ADZUNA_APP_ID;
const ADZUNA_API_KEY = import.meta.env.VITE_ADZUNA_API_KEY;
const ADZUNA_API_URL = "https://api.adzuna.com/v1/api/jobs/us/search/1";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

// Simulated job data fetching function
const fetchJobs = async (page: number, query: string = ""): Promise<Job[]> => {
  try {
    const jobs = await allJobs(query);
    return jobs.slice((page - 1) * 10, page * 10);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

const allJobs = async (
  query: string,
  location: string = "remote",
): Promise<Job[]> => {
  try {
    const response = await axios.get(ADZUNA_API_URL, {
      params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
        results_per_page: 10,
        what: query,
        where: location,
      },
    });

    return response.data.results.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      description: job.description,
      url: job.redirect_url,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
    }));
  } catch (error) {
    console.error("Error fetching jobs from Adzuna API:", error);
    throw error;
  }
};

export default function EnhancedJobSearch() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [resumeEmbedding, setResumeEmbedding] = useState<tf.Tensor | null>(
    null,
  );
  const [resumeText, setResumeText] = useState<string>("");
  const [model, setModel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastJobElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await load();
        setModel(loadedModel);
        console.log("TensorFlow model loaded successfully");
      } catch (err) {
        console.error("Error loading TensorFlow model:", err);
        setError(
          "Failed to load TensorFlow model. Please refresh the page and try again.",
        );
      }
    };
    loadModel();
  }, []);

  useEffect(() => {
    const fetchJobsData = async () => {
      setLoading(true);
      setError(null);
      try {
        const newJobs = await fetchJobs(page, searchTerm);
        if (page === 1) {
          setJobs(newJobs);
        } else {
          setJobs((prevJobs) => [...prevJobs, ...newJobs]);
        }
        setHasMore(newJobs.length === 10);
      } catch (err) {
        setError("Error fetching jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobsData();
  }, [page, searchTerm]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setJobs([]);
    setPage(1);
    setHasMore(true);
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("searchInput") as HTMLInputElement;
    setSearchTerm(input.value);
  };

  const analyzeResumeAndUpdateJobs = async (resumeText: string) => {
    if (!model) {
      setError(
        "TensorFlow model not loaded. Please refresh the page and try again.",
      );
      return;
    }

    try {
      console.log("Analyzing resume...");
      const embedding = await model.embed(resumeText);
      setResumeEmbedding(embedding);

      // Extract keywords from resume
      const keywords = extractKeywords(resumeText);
      console.log("Extracted keywords:", keywords);

      // Update search term with extracted keywords
      const newSearchTerm = keywords.join(" ");
      setSearchTerm(newSearchTerm);

      // Reset jobs and fetch new ones based on the updated search term
      setJobs([]);
      setPage(1);
      setHasMore(true);

      setMessages((prev) => [
        ...prev,
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

  const extractKeywords = (text: string): string[] => {
    // This is a simple keyword extraction. In a real application, you'd use a more sophisticated NLP approach.
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
    ]);
    const words = text.toLowerCase().match(/\b(\w+)\b/g) || [];
    const wordFrequency: { [key: string]: number } = {};

    words.forEach((word) => {
      if (!commonWords.has(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    return Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
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
        if (!model) {
          throw new Error("TensorFlow model not loaded");
        }

        if (!resumeEmbedding) {
          throw new Error("Resume not uploaded");
        }

        const inputEmbedding = await model.embed(userMessage);
        const similarity = tf
          .matMul(resumeEmbedding, inputEmbedding.transpose())
          .dataSync()[0];

        const prompt = `Based on the user's resume and their input: "${userMessage}", provide relevant job search advice. The similarity score between the input and the resume is ${similarity.toFixed(2)}. Respond in a helpful and friendly manner.`;

        console.log("Sending request to Hugging Face API");
        const response = await hf.textGeneration({
          model: "gpt2",
          inputs: prompt,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            top_p: 0.95,
            repetition_penalty: 1.2,
            return_full_text: false,
          },
        });

        console.log("Received response from Hugging Face API:", response);

        if (response.generated_text) {
          let processedText = response.generated_text.trim();

          if (
            !processedText.endsWith(".") &&
            !processedText.endsWith("!") &&
            !processedText.endsWith("?")
          ) {
            processedText += "...";
          }

          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: processedText },
          ]);
        } else {
          throw new Error("Empty response from Hugging Face API");
        }
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
              "I apologize, but I'm having trouble generating a complete response right now. Based on your resume and question, I recommend focusing on highlighting your skills and tailoring your applications to specific job requirements. Is there a particular aspect of your job search you'd like advice on?",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "text/plain") {
        setError("Please upload a .txt file.");
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 1024 * 1024) {
        // 1MB limit
        setError("File size exceeds 1MB limit.");
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 1MB.",
          variant: "destructive",
        });
        return;
      }

      try {
        const text = await file.text();
        console.log("Resume text loaded:", text.substring(0, 100) + "...");
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
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Enhanced Job Search Platform
      </h1>
      <Tabs defaultValue="jobs">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs">Job Listings</TabsTrigger>
          <TabsTrigger value="chat">Resume Chatbot</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                name="searchInput"
                placeholder="Search jobs..."
                defaultValue={searchTerm}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </form>
          <div className="space-y-6">
            {jobs.map((job, index) => (
              <Card
                key={job.id}
                ref={index === jobs.length - 1 ? lastJobElementRef : null}
              >
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">
                    {job.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="w-5 h-5 mr-2" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-5 h-5 mr-2" />
                      <span>
                        {job.salary_min && job.salary_max
                          ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                          : 'Salary not specified'}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{job.description}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Apply Now</Button>
                </CardFooter>
              </Card>
            ))}
            {loading && <p>Loading more jobs...</p>}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </TabsContent>
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Resume Chatbot</CardTitle>
            </CardHeader>
            <CardContent>
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
                    onChange={handleResumeUpload}
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
              <div
                className="h-64 overflow-auto border rounded p-2 mb-4"
                ref={chatContainerRef}
              >
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${message.role === "assistant" ? "text-blue-600" : "text-green-600"}`}
                  >
                    <strong>
                      {message.role === "assistant" ? "Chatbot: " : "You: "}
                    </strong>
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-gray-500">
                    <em>Chatbot is thinking...</em>
                  </div>
                )}
                {error && (
                  <div className="text-red-500">
                    <strong>Error:</strong> {error}
                  </div>
                )}
              </div>
              <form onSubmit={handleChatSubmit} className="flex items-center">
                <Input
                  type="text"
                  name="message"
                  placeholder="Type your message..."
                  className="flex-grow mr-2"
                  required
                  aria-label="Type your message"
                />
                <Button type="submit" disabled={isLoading || !resumeEmbedding}>
                  <Send className="w-5 h-5" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
