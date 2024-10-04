// src/types/index.ts
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary_min: number;
  salary_max: number;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}
