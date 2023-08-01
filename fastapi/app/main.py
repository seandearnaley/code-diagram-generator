"""Main module for FastAPI app."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import (
    diagram_routes,
    directory_analysis_routes,
    llm_routes,
    mermaid_routes,
)

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mermaid_routes.router)
app.include_router(directory_analysis_routes.router)
app.include_router(diagram_routes.router)
app.include_router(llm_routes.router)
