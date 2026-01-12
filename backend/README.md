# Land Registry Backend API

A modern, industry-grade FastAPI backend for a blockchain-based land registry system.

## Features

- ✅ **Modern Architecture**: Clean separation of concerns with services, models, schemas, and API layers
- ✅ **Security**: JWT authentication, password hashing with bcrypt
- ✅ **Database**: MongoDB with async Motor driver
- ✅ **API Versioning**: Structured for future API versions (v1, v2, etc.)
- ✅ **Error Handling**: Global error handlers with consistent responses
- ✅ **Logging**: Structured logging with request tracking
- ✅ **CORS**: Configurable cross-origin resource sharing
- ✅ **Validation**: Pydantic schemas for request/response validation
- ✅ **API Documentation**: Auto-generated OpenAPI/Swagger docs

## Project Structure

```
backend/
├── app/
│   ├── core/              # Configuration, security, logging
│   ├── db/                # Database connection management
│   ├── models/            # Database models
│   ├── schemas/           # Pydantic request/response schemas
│   ├── api/               # API endpoints
│   │   └── v1/           # API version 1
│   │       └── endpoints/ # Individual endpoint modules
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   └── utils/             # Utility functions
├── main.py               # Application entry point
├── requirements.txt      # Production dependencies
└── .env                  # Environment variables (not in git)
```

## Installation

### Prerequisites

- Python 3.10 or higher
- MongoDB instance (local or cloud)

### Setup

1. **Clone the repository**

2. **Navigate to backend directory**
   ```bash
   cd backend
   ```

3. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

4. **Activate virtual environment**
   - Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

5. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

6. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values with your configuration

## Configuration

Edit the `.env` file with your settings:

```env
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=land_registry

# Security
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Server (optional)
HOST=0.0.0.0
PORT=8000
DEBUG=False
```

## Running the Application

### Development Mode

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## API Endpoints

### Health Check
- `GET /api/v1/` - Basic health check
- `GET /api/v1/db` - Database health check

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get access token
- `GET /api/v1/auth/me` - Get current user info (requires auth)

## Development

### Adding New Endpoints

1. Create endpoint file in `app/api/v1/endpoints/`
2. Add router to `app/api/v1/router.py`
3. Create service logic in `app/services/`
4. Define schemas in `app/schemas/`

### Code Style

- Follow PEP 8 guidelines
- Use type hints for all functions
- Add docstrings to functions and classes
- Keep functions focused and single-purpose

## Security Notes

⚠️ **Important Security Practices**:

1. Never commit `.env` files to version control
2. Use strong, random `JWT_SECRET_KEY` in production
3. Use HTTPS in production
4. Regularly update dependencies
5. Review CORS settings for production use

## License

[Your License Here]
