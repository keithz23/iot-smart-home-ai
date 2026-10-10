# IoT Smart Home AI

An intelligent home automation system built with **ESP32**, **Blynk Cloud**, **FastAPI**, **SQLite**, **Next.js**, and an **AI Assistant**. Users can monitor sensor data, review activity history, control devices, and ask questions about the current state of their home through a web interface.

## 1. Features

- User registration, login, and authentication.
- Smart-home device management.
- Sensor data collection from Blynk Cloud.
- Automatic Blynk synchronization every 30 seconds.
- Time-series sensor data storage.
- Sensor status, device status, and history charts.
- Roof, fan, and LED control.
- Vietnamese-language AI Assistant.
- AI responses based on the latest sensor data and system knowledge.
- AI action proposals that require user confirmation before execution.
- Audit logging for important system activities.

## 2. Architecture

```text
ESP32
  ├── Reads sensors
  ├── Controls devices
  └── Local safety fallback
        │
        ▼
Blynk Cloud
  ├── Virtual pins V0-V11
  └── IoT connectivity management
        │
        ▼
FastAPI Backend
  ├── REST API
  ├── Data synchronization every 30 seconds
  ├── Database and migrations
  ├── Authentication
  ├── AI orchestration
  ├── Markdown-based RAG
  └── Audit logs
        │
        ▼
Next.js Frontend
  ├── Dashboard
  ├── Sensor cards
  ├── History charts
  ├── Device controls
  └── AI chat
```

## 3. Technologies

### Backend

- Python 3.14+
- FastAPI
- Async SQLAlchemy
- SQLite and `aiosqlite`
- Alembic
- HTTPX
- Pydantic Settings
- JWT and Argon2

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack React Query
- Axios
- Recharts
- Lucide React

## 4. Repository Structure

```text
backend/
  src/backend/
    api/                 REST API routes
    core/                Settings, security, and dependencies
    databases/           Database engine and sessions
    models/              SQLAlchemy models
    schemas/             Pydantic schemas
    services/            Business logic
    main.py              FastAPI application
  alembic/               Database migrations
  .env.example           Environment template
  pyproject.toml         Python dependencies

frontend/
  app/                   Next.js app shell and global styles
  components/            Shared UI components
  features/
    ai/                  AI Assistant
    auth/                Authentication
    dashboard/           Dashboard and widgets
  lib/                   Utilities
  types/                 TypeScript types

docs/
  AI_RAG_IOT.md          AI, RAG, and safety policy documentation

nginx/                   Reverse proxy configuration
docker-compose.yml       Docker Compose configuration
```

## 5. Blynk Datastream Mapping

| Pin | Data | Category |
|---|---|---|
| V0 | Temperature | Sensor |
| V1 | Humidity | Sensor |
| V2 | Door | Status |
| V3 | Light | Sensor |
| V4 | Rain | Status |
| V5 | Gas | Sensor |
| V6 | Person detected | Status |
| V7 | Vibration | Status |
| V8 | RFID | Text data |
| V9 | Roof | Control |
| V10 | Fan | Control |
| V11 | LED | Control |

## 6. Application Flow

### 6.1. Sensor Synchronization

When the backend starts, it creates a background task that:

1. Finds the active Blynk device.
2. Calls the Blynk API to retrieve the latest data.
3. Stores the data in the `sensor_readings` table.
4. Waits 30 seconds and repeats the process.

Related components:

- `backend/src/backend/services/blynk_service.py`
- `backend/src/backend/services/blynk_sync_service.py`
- `backend/src/backend/services/sensor_reading_service.py`
- `backend/src/backend/main.py`

The system also provides a manual synchronization endpoint:

```text
POST /api/v1/readings/sync
```

### 6.2. AI Assistant

```text
User submits a question
  -> Backend retrieves the latest sensor reading
  -> Related knowledge is retrieved from docs/AI_RAG_IOT.md
  -> The context is sent to the AI provider
  -> The response, sources, and action proposal are returned
```

The AI can answer questions such as:

- What is the current temperature?
- Why is the fan running?
- What is the current door status?
- Has a person or rain been detected?

### 6.3. Device Control

```text
AI proposes an action
  -> User reviews the device, value, and reason
  -> User confirms the action
  -> Backend validates the allowed device
  -> Blynk virtual pin is updated
  -> An audit log is created
```

The supported controllable devices are `roof`, `fan`, and `led`. Valid control values are `0` and `1`.

## 7. Database

Main tables:

| Table | Purpose |
|---|---|
| `users` | User accounts |
| `devices` | Configured devices |
| `sensor_readings` | Sensor data over time |
| `audit_logs` | Activity and control history |
| `ai_conversations` | Conversation records |
| `ai_messages` | User and AI messages |

Default database:

```text
backend/data/iot.db
```

Migrations are managed with Alembic:

```bash
cd backend
uv run alembic upgrade head
```

## 8. Environment Configuration

### Backend

Create `backend/.env` based on `backend/.env.example`:

```env
APP_NAME=IoT AI System
APP_ENV=development
DATABASE_URL=sqlite+aiosqlite:///./data/iot.db
API_V1_PREFIX=/api/v1

BLYNK_BASE_URL=https://blynk.cloud
BLYNK_AUTH_TOKEN=
BLYNK_TEMPLATE_ID=
BLYNK_DEVICE_ID=ESP32-001

AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
AUTH_COOKIE_NAME=access_token
AUTH_COOKIE_SECURE=false
```

One of the following AI providers can be selected:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
```

```env
AI_PROVIDER=groq
GROQ_API_KEY=
GROQ_MODEL=qwen/qwen3.8-27b
```

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 9. Local Installation and Development

### 9.1. Backend

Requirements: Python 3.14+ and `uv`.

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run fastapi dev src/backend/main.py
```

The backend runs at:

- API: `http://localhost:8000/api/v1`
- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/v1/health`

### 9.2. Frontend

Requirements: Node.js 22+ and npm.

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

## 10. Running with Docker Compose

After completing the environment configuration:

```bash
docker compose up --build
```

Services:

| Service | Port | Purpose |
|---|---:|---|
| backend | 8000 | FastAPI API |
| frontend | 3000 | Next.js application |
| nginx | 80/443 | Reverse proxy |

Stop the services:

```bash
docker compose down
```

## 11. Main API Endpoints

### Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Blynk and Sensor Data

```text
GET  /api/v1/blynk/raw
GET  /api/v1/blynk/status
POST /api/v1/blynk/control
POST /api/v1/readings/sync
GET  /api/v1/readings/latest
GET  /api/v1/readings
GET  /api/v1/readings/history
```

### AI

```text
POST /api/v1/ai/chat
POST /api/v1/ai/actions/execute
GET  /api/v1/ai/conversations
GET  /api/v1/ai/conversations/{conversation_id}/messages
```

### Other

```text
GET /api/v1/devices
GET /api/v1/audit-logs
GET /api/v1/health
```

## 12. Dashboard

The dashboard follows a dark IoT/Blynk-inspired style and includes:

- Device selector.
- Online status.
- Sensor cards with `LIVE` indicators.
- Latest sensor data.
- Door, rain, person, and vibration status.
- Temperature and humidity charts.
- Roof, fan, and LED controls.
- Sensor history.
- Audit logs.
- AI Smart Home Assistant.

The main UI code is located in:

```text
frontend/app/
frontend/components/
frontend/features/dashboard/
frontend/features/ai/
```

## 13. Project Validation

Build the frontend:

```bash
cd frontend
npm run build
```

Lint the frontend:

```bash
cd frontend
npm run lint
```

Check backend syntax:

```bash
cd backend
uv run python -m compileall src
```

## 14. Repository Documentation

- [AI, RAG, and IoT documentation](./docs/AI_RAG_IOT.md)
- [Backend environment template](./backend/.env.example)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## 15. Future Development

- Add unit and integration tests for Blynk synchronization.
- Move the scheduler out of the web process for multi-worker production deployments.
- Add retry and exponential backoff for Blynk API requests.
- Add anomaly detection for gas, temperature, and missing data.
- Upgrade keyword-based RAG to embeddings and a vector database.
- Add ESP32 heartbeat and real device online status.
- Add monitoring, structured logging, and database backups.

