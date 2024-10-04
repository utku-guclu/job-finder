import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useJobSearch } from "../contexts/JobSearchContext";
import debounce from "lodash/debounce";

const SearchBar: React.FC = () => {
  const { setSearchTerm } = useJobSearch();
  const [inputValue, setInputValue] = useState("");

  // Debounce the setSearchTerm function
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => setSearchTerm(value), 300),
    [setSearchTerm],
  );

  useEffect(() => {
    const storedKeywords = localStorage.getItem("resumeKeywords");
    if (storedKeywords) {
      const keywords = JSON.parse(storedKeywords);
      const initialSearchTerm = keywords.join(" ");
      setInputValue(initialSearchTerm);
      setSearchTerm(initialSearchTerm);
    }
  }, [setSearchTerm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedSetSearchTerm(newValue);
  };

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <Input
        type="text"
        name="searchInput"
        placeholder="Search jobs..."
        value={inputValue}
        onChange={handleInputChange}
        className="pl-10 pr-4 py-2 w-full"
      />
    </div>
  );
};

export default SearchBar;
