# Job Assistant App

A web application that provides personalized job search advice based on user resumes and input messages using TensorFlow and the Universal Sentence Encoder.

## Features

- Upload your resume to get tailored job recommendations.
- Chat interface to ask questions related to job searching.
- Text embedding using TensorFlow's Universal Sentence Encoder for similarity matching.

## Technologies Used

- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Node.js (Express)
- **Machine Learning**: TensorFlow.js
- **Deployment**: Vercel
  
## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/utku-guclu/job-finder.git

2. Navigate to the project directory:

    ```bash
    cd job-finder

3. Install the dependencies:

    ```bash
    npm install

4. Create a .env file in the root directory and copy the contents from .env.example.
    ```bash
    VITE_HUGGINGFACE_API_KEY=
    VITE_ADZUNA_APP_ID=
    VITE_ADZUNA_API_KEY=
   
6. Run the application:

    ```bash
    npm run dev
