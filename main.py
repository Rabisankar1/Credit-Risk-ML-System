from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("Loading ML model...")

    app.state.model = joblib.load("credit_risk_model.pkl")
    app.state.threshold = joblib.load("best_threshold.pkl")

    print("ML model loaded successfully!")
    print("Threshold:", app.state.threshold)

    yield

    print("Shutting down...")


app = FastAPI(
    title="Credit Risk ML API",
    description="AI-powered Credit Risk Prediction System",
    version="1.0.0",
    lifespan=lifespan
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoanApplication(BaseModel):
    person_age: int
    person_income: float
    person_home_ownership: str
    person_emp_length: float
    loan_intent: str
    loan_grade: str
    loan_amnt: float
    loan_int_rate: float
    loan_percent_income: float
    cb_person_default_on_file: str
    cb_person_cred_hist_length: int


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


@app.post("/predict")
def predict(data: LoanApplication):

    input_df = pd.DataFrame([data.model_dump()])

    probability = app.state.model.predict_proba(input_df)[:, 1][0]

    prediction = int(
        probability >= app.state.threshold
    )

    return {
        "default_probability": float(probability),
        "default_prediction": prediction,
        "threshold": float(app.state.threshold),
        "Result": "High Risk" if prediction == 1 else "Low Risk"
    }


# Frontend
app.mount(
    "/",
    StaticFiles(directory="static", html=True),
    name="static"
)