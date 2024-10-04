import * as tf from "@tensorflow/tfjs";
import { HfInference } from "@huggingface/inference";
import { HUGGINGFACE_API_KEY } from "../constants/api";

const hf = new HfInference(HUGGINGFACE_API_KEY);

export const generateChatResponse = async (
  userMessage: string,
  model: any,
  resumeEmbedding: tf.Tensor | null,
): Promise<string> => {
  if (!model || !resumeEmbedding) {
    throw new Error("Model or resume embedding not available");
  }

  const inputEmbedding = await model.embed(userMessage);
  const similarity = tf
    .matMul(resumeEmbedding, inputEmbedding.transpose())
    .dataSync()[0];

  const prompt = `Based on the user's resume and their input: "${userMessage}", provide relevant job search advice. The similarity score between the input and the resume is ${similarity.toFixed(2)}. Respond in a helpful and friendly manner.`;

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

  if (response.generated_text) {
    let processedText = response.generated_text.trim();
    if (
      !processedText.endsWith(".") &&
      !processedText.endsWith("!") &&
      !processedText.endsWith("?")
    ) {
      processedText += "...";
    }
    return processedText;
  } else {
    throw new Error("Empty response from Hugging Face API");
  }
};
