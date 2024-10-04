// src/components/JobCard.tsx
import React from "react";
import { Job } from "../types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, DollarSign } from "lucide-react";

interface JobCardProps {
  job: Job;
}

const JobCard = React.forwardRef<HTMLDivElement, JobCardProps>(
  ({ job }, ref) => {
    return (
      <Card ref={ref}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{job.title}</CardTitle>
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
                  : "Salary not specified"}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{job.description}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => window.open(job.url, "_blank")}
            className="w-full"
          >
            Apply Now
          </Button>
        </CardFooter>
      </Card>
    );
  },
);

export default JobCard;
