"""
FastAPI Application Factory

Creates and configures the FastAPI application instance.
"""

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.api.v1.router import router as api_v1_router
from app.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler
)
from app.middleware.request_logger import RequestLoggerMiddleware

# Setup logging
setup_logging()
logger = get_logger(__name__)


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application
    
    Returns:
        Configured FastAPI application instance
    """
    
    # Create FastAPI app
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="Blockchain-based Land Registry System API",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add request logging middleware
    app.add_middleware(RequestLoggerMiddleware)
    
    # Register exception handlers
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
    
    # Register startup/shutdown events
    @app.on_event("startup")
    async def startup_event():
        """Run on application startup"""
        logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
        await connect_to_mongo()
        logger.info("Application startup complete")
    
    @app.on_event("shutdown")
    async def shutdown_event():
        """Run on application shutdown"""
        logger.info("Shutting down application...")
        await close_mongo_connection()
        logger.info("Application shutdown complete")
    
    # Include API routers
    app.include_router(api_v1_router, prefix="/api/v1")
    
    return app


# Create the app instance
app = create_application()
