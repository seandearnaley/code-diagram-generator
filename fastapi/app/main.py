"""Main module for FastAPI app."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import folder_report, mermaid

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

app.include_router(mermaid.router)
app.include_router(folder_report.router)
