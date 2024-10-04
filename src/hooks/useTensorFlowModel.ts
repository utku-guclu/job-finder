// src/hooks/useTensorFlowModel.ts
import { useState, useEffect } from "react";
import { load } from "@tensorflow-models/universal-sentence-encoder";

export const useTensorFlowModel = () => {
  const [model, setModel] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await load();
        setModel(loadedModel);
      } catch (err) {
        console.error("Error loading TensorFlow model:", err);
        setError(
          "Failed to load TensorFlow model. Please refresh the page and try again.",
        );
      }
    };
    loadModel();
  }, []);

  return { model, error };
};
