import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Send,
  Upload,
} from "lucide-react";

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

const searchJobs = async (
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
        // content_type: "application/json",
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [resumeText, setResumeText] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchJobs = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const newJobs = await searchJobs(query);
      setJobs(newJobs);
    } catch (err) {
      setError("Error fetching jobs. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch jobs. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      fetchJobs(searchTerm);
    }
  }, [searchTerm, fetchJobs]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm) {
      fetchJobs(searchTerm);
    }
  };

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("message") as HTMLInputElement;
    const userMessage = input.value.trim();

    if (userMessage) {
      setSearchTerm(userMessage);
      input.value = "";
    }
  };

  const extractKeywordsFromResume = (text: string): string[] => {
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
        setIsAnalyzing(true);
        const text = await file.text();
        if (text.length < 100) {
          throw new Error(
            "Resume text is too short. Please upload a more detailed resume.",
          );
        }
        setResumeText(text);

        const keywords = extractKeywordsFromResume(text);
        setSearchTerm(keywords.join(" "));
        setError(null);
        toast({
          title: "Resume processed successfully",
          description:
            "Your resume has been analyzed and the job search has been updated.",
        });
      } catch (error) {
        console.error("Error processing resume:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to process resume. Please try again.",
        );
        toast({
          title: "Resume processing failed",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
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
          <TabsTrigger value="chat">Job Search Assistant</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </form>
          <div className="space-y-6">
            {jobs.map((job) => (
              <Card key={job.id}>
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
                        {job.salary_min} - {job.salary_max}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{job.description}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => window.open(job.url, "_blank")}
                  >
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {loading && <p>Loading jobs...</p>}
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </TabsContent>
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Job Search Assistant</CardTitle>
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
              <div className="h-64 overflow-auto border rounded p-2 mb-4">
                {isAnalyzing && (
                  <div className="text-gray-500">
                    <em>Analyzing resume and updating job search...</em>
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
                  placeholder="Type your job search query..."
                  className="flex-grow mr-2"
                  required
                  aria-label="Type your job search query"
                />
                <Button type="submit">
                  <Send className="w-5 h-5" />
                  <span className="sr-only">Search jobs</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
