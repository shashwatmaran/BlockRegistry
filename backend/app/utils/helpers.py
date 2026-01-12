"""
Utility Helper Functions

Common utility functions used across the application.
"""

from datetime import datetime, timezone
from typing import Any, Dict


def utc_now() -> datetime:
    """
    Get current UTC datetime
    
    Returns:
        Current datetime in UTC timezone
    """
    return datetime.now(timezone.utc)


def format_datetime(dt: datetime, format: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Format datetime to string
    
    Args:
        dt: Datetime to format
        format: Format string (default: ISO-like format)
        
    Returns:
        Formatted datetime string
    """
    return dt.strftime(format)


def sanitize_dict(data: Dict[str, Any], exclude_keys: list[str] = None) -> Dict[str, Any]:
    """
    Remove specified keys from dictionary
    
    Args:
        data: Dictionary to sanitize
        exclude_keys: List of keys to remove
        
    Returns:
        Sanitized dictionary
    """
    if exclude_keys is None:
        exclude_keys = []
    
    return {k: v for k, v in data.items() if k not in exclude_keys}


def safe_get(dictionary: Dict[str, Any], *keys, default=None) -> Any:
    """
    Safely get nested dictionary value
    
    Args:
        dictionary: The dictionary to search
        *keys: Keys to traverse
        default: Default value if key not found
        
    Returns:
        The value at the nested key or default
        
    Example:
        safe_get({'a': {'b': {'c': 1}}}, 'a', 'b', 'c')  # Returns 1
        safe_get({'a': {'b': {}}}, 'a', 'b', 'c', default=0)  # Returns 0
    """
    current = dictionary
    for key in keys:
        if isinstance(current, dict) and key in current:
            current = current[key]
        else:
            return default
    return current
