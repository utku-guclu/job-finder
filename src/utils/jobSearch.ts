// src/utils/jobSearch.ts
import axios from "axios";
import { Job } from "../types";
import {
  ADZUNA_APP_ID,
  ADZUNA_API_KEY,
  ADZUNA_API_URL,
} from "../constants/api";

export const fetchJobs = async (
  query: string,
  _page: number = 1,
  location: string = "remote",
): Promise<Job[]> => {
  try {
    const response = await axios.get(ADZUNA_API_URL, {
      params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_API_KEY,
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
