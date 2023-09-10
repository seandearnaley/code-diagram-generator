# Code Diagram Generator

This monorepo contains a code diagram generator application built using FastAPI on the backend and Next.js 13 on the frontend.

![Code Diagram Generator](fullcapture.png?raw=true)

## Table of Contents

- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Backend (FastAPI)](#backend-fastapi)
  - [Routes](#routes)
  - [Services](#services)
- [Frontend (Next.js)](#frontend-nextjs)
  - [Components](#components)
  - [Hooks](#hooks)
  - [Styles](#styles)
- [Docker Compose](#docker-compose)
- [License](#license)

## Folder Structure

The folder structure of this monorepo is organized as follows:

```
code-diagram-generator/
|-- fastapi/
|   |-- ...
|-- nextjs/
|   |-- ...
|-- docker-compose.yml
|-- LICENSE
|-- README.md
```

- `fastapi/`: Contains the FastAPI backend application code.
- `nextjs/`: Contains the Next.js frontend application code.
- `docker-compose.yml`: Configuration for running the FastAPI and Next.js services together using Docker Compose.
- `LICENSE`: License information for the application.
- `README.md`: This readme file.

## Installation

1. Clone this repository to your local machine.
2. Navigate to the `fastapi/` directory and set up the FastAPI backend.
3. Navigate to the `nextjs/` directory and set up the Next.js frontend.
4. Configure Docker Compose if you want to run the services using Docker containers.

## Running the Application

To run the application locally, follow these steps:

1. Start the FastAPI backend:

   - Navigate to the `fastapi/` directory.
   - Install the Python dependencies using `poetry install`.
   - Run the FastAPI server using `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`.

2. Start the Next.js frontend:

   - Navigate to the `nextjs/` directory.
   - Install the Node.js dependencies using `npm install`.
   - Run the Next.js development server using `npm run dev`.

3. Access the application:
   - The FastAPI backend will be running at `http://localhost:8000`.
   - The Next.js frontend will be accessible at `http://localhost:3000`.

## Backend (FastAPI)

### Routes

The FastAPI backend includes the following route modules:

- `diagram_generation_routes.py`: Routes for generating code diagrams.
- `diagram_routes.py`: Routes related to diagram configurations.
- `directory_analysis_routes.py`: Routes for analyzing source code directories.
- `llm_routes.py`: Routes for interacting with language models.
- `mermaid_routes.py`: Routes for generating Mermaid diagrams.

### Services

The backend services are organized as follows:

- `diagram_service.py`: Services for handling diagrams and categories.
- `directory_analysis_service.py`: Services for analyzing source code directories.
- `llm_service.py`: Services for interacting with language models.
- `mermaid_service.py`: Services for generating Mermaid diagrams.
- `utils/`: Utility functions used across services.

## Frontend (Next.js)

The Next.js frontend includes the following:

### Components

The frontend is built using various React components, including:

- `components/`: Reusable UI components used in the application.
- `config/`: Configuration data for forms and components.
- `hooks/`: Custom hooks used to manage state and functionality.
- `lib/`: Utility functions and helper scripts.
- `styles/`: Global styles and CSS configuration.
- `types/`: TypeScript type definitions used throughout the frontend.

### Hooks

Custom hooks are used to manage state and functionality. Some notable hooks include:

- `useDesignDirectives.ts`: Hook for managing design directives.
- `useGitIgnore.ts`: Hook for managing Gitignore patterns.
- `useLocalStorage.ts`: Hook for managing local storage data.

### Styles

The global styles are defined in `styles/globals.css`. Tailwind CSS is used for styling components.

## Docker Compose

The `docker-compose.yml` file defines services for both the FastAPI backend and the Next.js frontend. It allows you to run both services together using Docker containers.

To run the application using Docker Compose:

1. Make sure you have Docker installed.
2. Open a terminal and navigate to the root of the project directory.
3. Run the command `docker-compose up` to start both services.
4. Access the application:
   - The FastAPI backend will be accessible at `http://localhost:8000`.
   - The Next.js frontend will be accessible at `http://localhost:3000`.

## License

This application is open-source and distributed under the [LICENSE](LICENSE) file included in this repository.

---

This README provides an overview of the folder structure, installation, running the application, backend and frontend components, and Docker Compose setup. For more detailed information, refer to the respective code files and documentation in each directory.
