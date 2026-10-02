# CYBEROPS &bull; Security Intelligence Dashboard

A full-stack, deployment-ready cybersecurity operations (SOC) dashboard built with **React + Vite + Tailwind CSS** on the frontend and **Python + FastAPI + SQLAlchemy + SQLite** on the backend.

Designed with a cybersecurity SOC dark theme, real-time threat monitoring, safe non-intrusive asset reconnaissance scanner, security event logging, asset inventory management, and Docker/AWS EC2 orchestration.

---

## 1. Features

- **SOC Threat Intelligence Dashboard (`/`)**: Real-time asset counts, active alerts, 24-hour event telemetry timeline chart, and recent incident logs.
- **Safe Asset Security Scanner (`/scanner`)**: Linux-style terminal console interface for non-intrusive DNS resolution, port checks, and HTTP header security auditing.
- **Security Events Incident Management (`/events`)**: Severity filtering (LOW, MEDIUM, HIGH, CRITICAL), instant test event generator, custom incident creation, and audit logging.
- **Monitored Asset Inventory (`/assets`)**: Register, monitor, and remove domain names, IP addresses, and web server endpoints.
- **System Diagnostics (`/system`)**: Heartbeat monitor, database connection status, API latency measurements, and runtime metadata.
- **Authentication Gateway (`/login`)**: Demo authentication screen with pre-filled operator credentials (`admin` / `cyberops`).
- **Interactive Terminal Component (`TerminalWindow.jsx`)**: Realistic Linux-style console with animated cursor, scanline filters, clipboard copy, and styled severity tags.
- **Resilient Fallback**: Auto-detects backend connection status and alerts the operator with connection banners and retry controls.

---

## 2. Architecture & Project Structure

All environment configuration is centralized strictly in the **ROOT** directory (`.env`). No nested `.env` files are used in `frontend/`, `backend/`, or subdirectories.

```
cyberops/
│
├── .env                      # Single root environment file (DO NOT COMMIT)
├── .env.example              # Root template with variable placeholders
├── .gitignore                # Ignores .env and .env.* while keeping .env.example
├── docker-compose.yml        # Orchestrates backend & frontend using root .env
├── README.md
│
├── frontend/                 # React + Vite + Tailwind CSS (SPA)
│   ├── src/
│   │   ├── components/       # TerminalWindow, StatCard, SeverityBadge, ActivityChart, etc.
│   │   ├── pages/            # Dashboard, Scanner, Events, Assets, System, Login
│   │   ├── services/api.js   # Axios API client using import.meta.env.VITE_API_URL
│   │   ├── App.jsx           # Routing and layout state
│   │   └── main.jsx          # React entry point
│   ├── vite.config.js        # Configured with envDir: '..' to load root .env
│   ├── Dockerfile            # Multi-stage production build (Node -> Nginx Alpine)
│   ├── nginx.conf            # Reverse proxy + SPA fallback
│   └── package.json
│
└── backend/                  # Python FastAPI application
    ├── app/
    │   ├── routes/           # dashboard.py, events.py, scanner.py, assets.py, system.py
    │   ├── services/         # scanner_service.py (non-intrusive network & HTTP audits)
    │   ├── database.py       # SQLAlchemy engine (loads root .env)
    │   ├── models.py         # Asset & Event database models
    │   ├── schemas.py        # Pydantic data schemas
    │   └── main.py           # FastAPI entry (loads root .env via python-dotenv)
    ├── requirements.txt
    └── Dockerfile            # Python 3.11-slim container
```

---

## 3. Environment Configuration

All environment variables for both frontend and backend are maintained **EXCLUSIVELY in the root `.env` file**.

### Environment Setup Workflow:
1. **Copy the template**:
   ```bash
   # On Linux / macOS / AWS EC2:
   cp .env.example .env

   # On Windows PowerShell:
   Copy-Item .env.example .env
   ```
2. **Edit the root `.env`** to match your target environment (local development vs AWS EC2 production).
3. **Frontend Integration**: Vite is configured via `envDir: '..'` in `frontend/vite.config.js` to read all `VITE_*` variables directly from the project root `.env`. In source code, access variables via `import.meta.env.VITE_API_URL`.
4. **Backend Integration**: FastAPI dynamically locates and loads the root `.env` file using `python-dotenv` and Python's `Path(__file__)` resolution regardless of whether you start the server from `backend/` or the project root.
5. **Docker Compose Integration**: `docker-compose.yml` specifies `env_file: - .env` at the root to inject variables into containers.
6. **Security & Git**: The `.gitignore` is configured to ignore all `.env` and `.env.*` files while keeping `.env.example` safe to commit. **Never commit `.env` containing credentials to GitHub.**

### Root Variables Reference (`.env`):

| Variable | Scope | Default / Local | Description |
|---|---|---|---|
| `VITE_API_URL` | Frontend | `http://localhost:8000` | Backend API base URL (`http://<EC2_IP>:8000` on EC2 or `/api` behind Nginx) |
| `DATABASE_URL` | Backend | `sqlite:///./cyberops.db` | SQLAlchemy SQLite database connection string |
| `CORS_ORIGINS` | Backend | `http://localhost:5173,...` | Allowed CORS origins (comma-separated list or `*`) |
| `HOST` | Backend | `0.0.0.0` | Binding network host |
| `PORT` | Backend | `8000` | Backend listening port |
| `ENVIRONMENT` | Backend | `production` | Deployment environment identifier |

---

## 4. Running Locally

### Option A: Local Native Execution (Without Docker)

#### 1. Configure Environment:
```bash
# In project root:
cp .env.example .env
```

#### 2. Start Backend:
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Linux / macOS:
source venv/bin/activate
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend (loads ../.env automatically)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be live at `http://localhost:8000` (Interactive Swagger Docs at `http://localhost:8000/docs`).

#### 3. Start Frontend:
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server (reads root .env via envDir)
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

### Option B: Running with Docker Compose (Recommended)

To run the full stack locally with containers using the root `.env`:

```bash
# From project root:
docker compose up -d --build

# View logs
docker compose logs -f

# Check container status
docker compose ps

# Stop containers
docker compose down
```

- **Frontend Application**: `http://localhost` (Port 80)
- **Backend API**: `http://localhost:8000` (Port 8000)

---

## 5. AWS EC2 Deployment Guide

Deploying CYBEROPS to an AWS EC2 instance takes less than 5 minutes.

### Step 1: Launch an EC2 Instance
1. Go to **AWS Management Console** &rarr; **EC2** &rarr; **Launch Instance**.
2. **Name**: `cyberops-server`
3. **AMI**: Ubuntu Server 22.04 LTS or 24.04 LTS.
4. **Instance Type**: `t3.micro` or `t2.small` (Free tier eligible).
5. **Key Pair**: Select your `.pem` key pair.

### Step 2: Configure AWS Security Group
In the **Network settings / Security Group**, ensure the following inbound rules are added:

| Type | Protocol | Port Range | Source | Purpose |
|---|---|---|---|---|
| **SSH** | TCP | `22` | `My IP` (or `0.0.0.0/0`) | Secure shell access to instance |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Web Frontend (CYBEROPS Dashboard) |
| **Custom TCP** | TCP | `8000` | `0.0.0.0/0` | Backend API (Direct access / debugging) |

### Step 3: Connect to EC2 and Install Docker
SSH into your instance:
```bash
ssh -i /path/to/your-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

Install Docker & Docker Compose plugin:
```bash
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

### Step 4: Clone & Configure CYBEROPS on EC2
```bash
# Clone the repository
git clone <YOUR_GIT_REPOSITORY_URL> /home/ubuntu/cyberops
cd /home/ubuntu/cyberops

# Create the single root .env file from the template
cp .env.example .env

# Edit .env with your EC2 public IP
nano .env
```
Example `.env` configuration on EC2:
```env
# Frontend Configuration
VITE_API_URL=http://<YOUR_EC2_PUBLIC_IP>:8000

# Backend Configuration
DATABASE_URL=sqlite:///./cyberops.db
CORS_ORIGINS=http://<YOUR_EC2_PUBLIC_IP>,http://<YOUR_EC2_PUBLIC_IP>:8000,http://localhost
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production
```

### Step 5: Launch Containers
```bash
docker compose up -d --build
```

### Step 6: Access the Application
Open your browser and navigate to:
```
http://<YOUR_EC2_PUBLIC_IP>
```
Log in using the operator credentials:
- **Operator ID**: `admin`
- **Access Key**: `cyberops`

---

## 6. Troubleshooting & Verification

### Verify Backend Health:
```bash
curl http://localhost:8000/api/health
# Output: {"status":"online","service":"CYBEROPS Security Intelligence Backend","version":"1.0.0"}
```

### Check Docker Logs:
```bash
# Backend logs
docker logs -f cyberops_backend

# Frontend / Nginx logs
docker logs -f cyberops_frontend
```

### Database Persistence:
The SQLite database is persisted in a named Docker volume (`backend_data`) so data is retained across restarts and updates.
