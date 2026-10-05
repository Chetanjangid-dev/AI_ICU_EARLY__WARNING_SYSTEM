# AI ICU Early Warning System

An AI-powered ICU monitoring dashboard that simulates live patient vitals, sends clinical inputs to a machine-learning service, and displays deterioration risk predictions in a responsive web interface.

The project is built as a full-stack, multi-service system:

- Static frontend deployed on Vercel
- Spring Boot backend deployed on Render
- Python Flask ML inference service deployed on Render
- Trained scikit-learn/joblib model artifacts for prediction

---

## Live Demo

### Frontend

https://aiicuearlywarningsystem-frontend.vercel.app/

### Backend API

https://ai-icu-backend.onrender.com

### ML Service

https://ai-icu-early-warning-system.onrender.com

---

## Features

- ICU-style live monitoring dashboard
- Multi-bed patient simulation
- Animated vital and waveform-style displays
- AI mortality/deterioration risk gauge
- Manual vital input form for real backend predictions
- Backend wake-up waiting screen for Render cold starts
- Vercel API proxy for frontend-to-backend communication
- Spring Boot backend API
- Python Flask ML prediction service
- Docker and Docker Compose support
- Responsive layout for desktop and mobile

---

## Architecture

```text
Browser
  |
  | Loads frontend
  v
Vercel Frontend
  |
  | /api/health
  | /api/predict
  v
Vercel Serverless API Proxy
  |
  | GET /health
  | POST /predict
  v
Render Spring Boot Backend
  |
  | POST /predict
  v
Render Python Flask ML Service
  |
  v
scikit-learn / joblib models
```

The browser talks to the Vercel frontend and same-origin Vercel API routes. Those API routes call the Render backend. The Spring Boot backend then forwards prediction requests to the Python ML service.

This keeps browser-side networking simple and avoids CORS issues.

---

## Project Structure

```text
AI_ICU_EARLY__WARNING_SYSTEM/
|
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── api/
│       ├── health.js
│       └── predict.js
|
├── backend/
│   ├── src/main/java/com/icu/earlywarning/
│   │   ├── Application.java
│   │   └── MainController.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── static/
│   │   └── templates/
│   ├── pom.xml
│   └── Dockerfile
|
├── ml_service/
│   ├── app.py
│   ├── predict.py
│   ├── requirements.txt
│   ├── logistic_model.pkl
│   ├── random_forest_model.pkl
│   ├── scaler.pkl
│   ├── feature_columns.pkl
│   └── admission_map.pkl
|
├── docker-compose.yml
├── .gitignore
└── Readme.md
```

---

## Main Components

### Frontend

The `frontend/` folder contains the Vercel-deployed dashboard.

It includes:

- ICU monitoring UI
- Waiting screen while the backend wakes up
- Manual input workflow
- Mobile responsive dashboard layout
- Vercel API routes for backend proxying

The frontend calls:

```text
GET  /api/health
POST /api/predict
```

These routes are implemented inside:

```text
frontend/api/
```

### Spring Boot Backend

The `backend/` folder contains the main Java API service.

It provides:

- `GET /health`
- `POST /predict`
- Backend-to-ML-service communication
- Optional bundled Spring Boot static/template frontend resources

The backend reads the ML service URL from:

```text
ML_SERVICE_URL
```

### ML Service

The `ml_service/` folder contains the Python Flask inference service.

It:

1. Receives patient vitals and clinical values
2. Builds the model feature set
3. Loads the trained model artifacts
4. Returns prediction probabilities and final risk output

The ML service exposes:

```text
GET  /health
POST /predict
```

---

## Prediction Flow

```text
User enters vitals
  |
  v
Frontend Manual Input form
  |
  v
Vercel /api/predict
  |
  v
Spring Boot /predict
  |
  v
Flask ML Service /predict
  |
  v
ML model prediction
  |
  v
Dashboard risk update
```

Example prediction response:

```json
{
  "success": true,
  "prediction": {
    "logistic_prob": 1.0,
    "rf_prob": 0.01993940605284524,
    "final_prob": 0.39743183180945085,
    "final_pred": 1
  }
}
```

---

## Running Locally

### 1. Start the ML Service

```bash
cd ml_service
python -m pip install -r requirements.txt
python app.py
```

Default local URL:

```text
http://localhost:5001
```

### 2. Start the Spring Boot Backend

```bash
cd backend
mvn clean package
java -jar target/early-warning-system-0.0.1-SNAPSHOT.jar
```

Default local URL:

```text
http://localhost:7860
```

### 3. Run the Frontend

For the Vercel-style frontend, run the `frontend/` folder with Vercel tooling:

```bash
cd frontend
vercel dev
```

The frontend needs its API routes because `/api/health` and `/api/predict` proxy requests to the backend.

---

## Docker Compose

The project also includes a root-level Docker Compose file:

```bash
docker compose up --build
```

This is useful for running the backend and ML service together during local development.

---

## Deployment

### Frontend on Vercel

```text
Root Directory:
frontend/
```

The frontend includes serverless API routes:

```text
frontend/api/health.js
frontend/api/predict.js
```

These routes use:

```text
BACKEND_URL=https://ai-icu-backend.onrender.com
```

If `BACKEND_URL` is not configured, the frontend API routes default to the deployed Render backend URL.

### Backend on Render

```text
Root Directory:
backend/

Environment:
Docker / Java Spring Boot
```

Required environment variable:

```text
ML_SERVICE_URL=https://ai-icu-early-warning-system.onrender.com
```

### ML Service on Render

```text
Root Directory:
ml_service/

Build Command:
pip install -r requirements.txt

Start Command:
python app.py
```

---

## Environment Variables

### Frontend API Routes

```text
BACKEND_URL
```

### Spring Boot Backend

```text
PORT
ML_SERVICE_URL
```

### Local defaults

```properties
server.port=${PORT:7860}
ml.service.url=${ML_SERVICE_URL:http://localhost:5001}
```

---

## ML Model Files

The ML service requires these files at runtime:

```text
logistic_model.pkl
random_forest_model.pkl
scaler.pkl
feature_columns.pkl
admission_map.pkl
```

They should remain committed to the repository because the deployed ML service loads them when it starts.

---

## API Reference

### Backend Health

```http
GET /health
```

Example:

```json
{
  "status": "ok"
}
```

### Backend Prediction

```http
POST /predict
```

Example request:

```json
{
  "heart_rate": 160,
  "spo2_pct": 78,
  "systolic_bp": 82,
  "diastolic_bp": 44,
  "respiratory_rate": 33,
  "temperature_c": 39.1,
  "oxygen_flow": 14,
  "mobility_score": 0,
  "nurse_alert": 1,
  "wbc_count": 21000,
  "lactate": 4.5,
  "creatinine": 2.4,
  "crp_level": 27,
  "hemoglobin": 8.9,
  "sepsis_risk_score": 8,
  "age": 80,
  "comorbidity_index": 4,
  "hour_from_admission": 2,
  "gender": "F",
  "oxygen_device": "ventilator",
  "admission_type": "emergency"
}
```

---

## Notes on Render Cold Starts

Render services may sleep after inactivity depending on the hosting plan. The frontend includes a waiting screen that checks the backend on a controlled schedule and opens the dashboard once the backend is ready.

This improves the first-load experience when the backend is waking up.

---

## Technology Stack

### Frontend

- HTML
- CSS
- JavaScript
- Vercel Serverless Functions

### Backend

- Java
- Spring Boot
- Spring Web
- Thymeleaf
- Maven

### Machine Learning

- Python
- Flask
- NumPy
- Pandas
- scikit-learn
- Joblib

### Deployment

- Vercel
- Render
- Docker
- Docker Compose
- GitHub

---

## Project Highlights

This project demonstrates a practical multi-service AI application architecture:

- A responsive frontend for ICU monitoring
- A Spring Boot backend for API orchestration
- A Python ML microservice for inference
- Real prediction flow from manual clinical input
- Separate deployments for frontend, backend, and ML service
- Production-friendly environment variable configuration
- Improved user experience around hosted-service cold starts
