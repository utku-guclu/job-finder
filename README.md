# Job Assistant App

A web application that provides personalized job search advice based on user resumes and input messages using TensorFlow and the Universal Sentence Encoder.

## Features

- Upload your resume to get tailored job recommendations.
- Chat interface to ask questions related to job searching.
- Text embedding using TensorFlow's Universal Sentence Encoder for similarity matching.

## Technologies Used

- **Frontend**: 
  - **React**: A JavaScript library for building user interfaces, allowing for a component-based architecture.
  - **TypeScript**: A superset of JavaScript that adds static types, helping to catch errors early and improve code maintainability.
  - **Material-UI**: A popular React UI framework that provides pre-designed components for building responsive and aesthetically pleasing interfaces.

- **Backend**: 
  - **API**: The application uses a RESTful API to handle data communication between the frontend and the machine learning models.

- **Machine Learning**: 
  - **TensorFlow.js**: A JavaScript library for training and deploying machine learning models in the browser and on Node.js. It utilizes the Universal Sentence Encoder for embedding user input and matching it against job descriptions.

- **Deployment**: 
  - **Vercel**: A cloud platform for static sites and Serverless Functions, providing seamless deployment and hosting for the application.

  
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
