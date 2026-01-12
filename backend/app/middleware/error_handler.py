"""
Global Error Handler Middleware

Provides consistent error responses across the API.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.logging import get_logger

logger = get_logger(__name__)


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handler for HTTP exceptions
    
    Args:
        request: The incoming request
        exc: The HTTP exception
        
    Returns:
        JSON response with error details
    """
    logger.warning(
        f"HTTP {exc.status_code} on {request.method} {request.url.path}: {exc.detail}"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "message": exc.detail,
                "status_code": exc.status_code,
                "path": str(request.url.path)
            }
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handler for request validation errors
    
    Args:
        request: The incoming request
        exc: The validation error
        
    Returns:
        JSON response with validation error details
    """
    logger.warning(
        f"Validation error on {request.method} {request.url.path}: {exc.errors()}"
    )
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "message": "Validation error",
                "status_code": status.HTTP_422_UNPROCESSABLE_ENTITY,
                "path": str(request.url.path),
                "details": exc.errors()
            }
        },
    )


async def general_exception_handler(request: Request, exc: Exception):
    """
    Handler for general unhandled exceptions
    
    Args:
        request: The incoming request
        exc: The exception
        
    Returns:
        JSON response with generic error message
    """
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}: {exc}",
        exc_info=True
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "message": "Internal server error",
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "path": str(request.url.path)
            }
        },
    )
