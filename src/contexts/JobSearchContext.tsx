import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { Job } from "../types";
import { fetchJobs } from "../utils/jobSearch";

interface JobSearchContextType {
  jobs: Job[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setInitialKeywords: (keywords: string[]) => void;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  loadMoreJobs: () => Promise<void>;
}

const JobSearchContext = createContext<JobSearchContextType | undefined>(
  undefined,
);

export const JobSearchProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const loadJobs = useCallback(
    async (term: string, pageNum: number): Promise<Job[]> => {
      if (!term) return [];
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching jobs for term: ${term}, page: ${pageNum}`);
        const newJobs = await fetchJobs(term, pageNum);
        console.log(`Fetched ${newJobs.length} new jobs`);
        return newJobs;
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError("Error fetching jobs. Please try again.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    const fetchInitialJobs = async () => {
      const initialJobs = await loadJobs(searchTerm, 1);
      setJobs(initialJobs);
      setHasMore(initialJobs.length === 10);
      setPage(1);
    };
    if (searchTerm) {
      fetchInitialJobs();
    }
  }, [searchTerm, loadJobs]);

  const loadMoreJobs = async () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    console.log(`Loading more jobs for page ${nextPage}`);
    const newJobs = await loadJobs(searchTerm, nextPage);
    if (newJobs.length > 0) {
      setJobs((prevJobs) => [...prevJobs, ...newJobs]);
      setPage(nextPage);
      setHasMore(newJobs.length === 10);
    } else {
      setHasMore(false);
    }
  };

  const setInitialKeywords = (keywords: string[]) => {
    const newSearchTerm = keywords.join(" ");
    setSearchTerm(newSearchTerm);
  };

  const value: JobSearchContextType = {
    jobs,
    loading,
    hasMore,
    error,
    searchTerm,
    setJobs,
    setPage,
    setSearchTerm,
    setInitialKeywords,
    loadMoreJobs,
  };

  return (
    <JobSearchContext.Provider value={value}>
      {children}
    </JobSearchContext.Provider>
  );
};

export const useJobSearch = () => {
  const context = useContext(JobSearchContext);
  if (context === undefined) {
    throw new Error("useJobSearch must be used within a JobSearchProvider");
  }
  return context;
};
