// src/components/JobList.tsximport React, { useCallback, useRef, useEffect } from "react";
import { useCallback, useEffect, useRef } from "react";
import { useJobSearch } from "../contexts/JobSearchContext";
import JobCard from "./JobCard";

const JobList: React.FC = () => {
  const { jobs, loading, hasMore, error, loadMoreJobs } = useJobSearch();
  const observer = useRef<IntersectionObserver | null>(null);

  const lastJobElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log("Last job card is visible, loading more jobs");
          loadMoreJobs();
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, loadMoreJobs],
  );

  useEffect(() => {
    console.log(
      `JobList re-rendered. Jobs count: ${jobs.length}, hasMore: ${hasMore}, loading: ${loading}`,
    );
  }, [jobs, hasMore, loading]);

  return (
    <div className="space-y-4">
      {jobs.map((job, index) => (
        <JobCard
          key={job.id}
          job={job}
          ref={index === jobs.length - 1 ? lastJobElementRef : null}
        />
      ))}
      {loading && <p>Loading more jobs...</p>}
      {error && <p>Error: {error}</p>}
      {!hasMore && jobs.length > 0 && <p>No more jobs to load</p>}
    </div>
  );
};

export default JobList;
