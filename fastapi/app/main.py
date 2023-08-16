"""Main module for FastAPI app."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import (
    diagram_generation_routes,
    diagram_routes,
    directory_analysis_routes,
    llm_routes,
    mermaid_routes,
)
from .services.diagram_service import load_diagram_config
from .services.llm_service import load_llm_config

app = FastAPI(debug=True)


@app.on_event("startup")
async def startup_event():
    """Load configs on startup."""
    app.state.diagram_config = await load_diagram_config()
    app.state.llm_config = await load_llm_config()


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
app.include_router(diagram_generation_routes.router)
app.include_router(diagram_routes.router)
app.include_router(llm_routes.router)
