"""NetResQ Backend Application Entry Point.

Configures FastAPI, CORS middleware, routes, and application lifecycle events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router as api_router
from app.config import CORS_ORIGINS

app = FastAPI(
    title="NetResQ: Adaptive Self-Healing Network API",
    description="Adaptive routing, failure detection, failover, and telemetry API using NetworkX and FastAPI.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
# Restricted to local frontend origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router)


@app.get("/", summary="Root Endpoint")
def read_root():
    """Provides high-level project metadata and link to interactive API docs."""
    return {
        "project": "NetResQ",
        "description": "An Adaptive Self-Healing Network Using Quality-Aware Routing",
        "docs": "/docs",
        "health": "/api/health",
        "status": "/api/status",
        "topology": "/api/topology"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
