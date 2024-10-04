import React, { useState, useEffect, useRef } from 'react';
import { load } from '@tensorflow-models/universal-sentence-encoder';
import * as tf from '@tensorflow/tfjs';
import { HfInference } from '@huggingface/inference';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

export default function JobSearchChatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [resumeEmbedding, setResumeEmbedding] = useState<tf.Tensor | null>(null);
  const [model, setModel] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadModel = async () => {
      const loadedModel = await load();
      setModel(loadedModel);
    };
    loadModel();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    const userMessage = input.value.trim();

    if (userMessage) {
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
      input.value = '';
      setIsLoading(true);

      try {
        if (model && resumeEmbedding) {
          const inputEmbedding = await model.embed(userMessage);
          const similarity = tf.matMul(resumeEmbedding, inputEmbedding.transpose()).dataSync()[0];

          const prompt = `Based on the user's resume and their input: "${userMessage}", provide relevant job search advice. The similarity score between the input and the resume is ${similarity.toFixed(2)}. Respond in a helpful and friendly manner.`;

          const response = await hf.textGeneration({
            model: 'gpt2',
            inputs: prompt,
            parameters: {
              max_new_tokens: 100,
              temperature: 0.7,
              top_p: 0.95,
              repetition_penalty: 1.2,
            },
          });

          if (response.generated_text) {
            setMessages((prev) => [...prev, { role: 'assistant', content: response.generated_text }]);
          }
        }
      } catch (error) {
        console.error('Error generating response:', error);
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && model) {
      try {
        const text = await file.text();
        const embedding = await model.embed(text);
        setResumeEmbedding(embedding);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Resume uploaded and processed. How can I help you with your job search?' },
        ]);
      } catch (error) {
        console.error('Error processing resume:', error);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, I encountered an error processing your resume. Please try again.' },
        ]);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Job Search Chatbot</h1>
      <div className="flex-grow overflow-auto mb-4 border rounded p-2" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === 'assistant' ? 'text-blue-600' : 'text-green-600'}`}>
            <strong>{message.role === 'assistant' ? 'Chatbot: ' : 'You: '}</strong>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500">
            <em>Chatbot is thinking...</em>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex mb-4">
        <label htmlFor="message" className="sr-only">Type your message</label>
        <input
          type="text"
          id="message"
          name="message"
          placeholder="Type your message..."
          className="flex-grow border rounded-l p-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r" disabled={isLoading}>
          Send
        </button>
      </form>
      <div>
        <label htmlFor="resume" className="block mb-2">
          Upload your resume (TXT format):
        </label>
        <input type="file" id="resume" accept=".txt" onChange={handleResumeUpload} className="mb-4" />
      </div>
    </div>
  );
}