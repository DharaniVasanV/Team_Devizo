from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and scaler with relative paths
model = joblib.load("anomaly_model.pkl")
scaler = joblib.load("scaler.pkl")
risk_model = joblib.load("risk_model.pkl")
class ClaimData(BaseModel):
    tasks_completed_per_day: float
    average_task_time_minutes: float
    distance_travelled_km: float
    payout_amount: float
    customer_rating: float
    login_hours_per_day: float
    device_changes: int
    location_changes: int
    cancellation_rate: float
    late_delivery_rate: float

class RiskData(BaseModel):
    rainfall: float
    temperature: float
    aqi: float
    delivery_hours: float

@app.post("/predict")
def predict(data: ClaimData):
    try:
        input_data = np.array([[
            data.tasks_completed_per_day,
            data.average_task_time_minutes,
            data.distance_travelled_km,
            data.payout_amount,
            data.customer_rating,
            data.login_hours_per_day,
            data.device_changes,
            data.location_changes,
            data.cancellation_rate,
            data.late_delivery_rate
        ]])
        
        scaled_data = scaler.transform(input_data)
        prediction = int(model.predict(scaled_data)[0])
        
        return {
            "prediction": prediction,
            "status": "anomaly" if prediction == -1 else "normal"
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/predict-risk")
def predict_risk(data: RiskData):
    try:
        # Pass 2 features: rainfall and temperature (assuming these are the 2 the risk_model needs)
        input_data = np.array([[data.rainfall, data.temperature]])
        
        # Get probability of class 1 for risk_score
        probas = risk_model.predict_proba(input_data)[0]
        risk_score = float(probas[1]) if len(probas) > 1 else float(probas[0])
        
        if risk_score < 0.3:
            risk_level = "low"
            premium = 100
        elif risk_score < 0.7:
            risk_level = "medium"
            premium = 200
        else:
            risk_level = "high"
            premium = 300
            
        return {
            "risk_score": round(risk_score, 3),
            "risk_level": risk_level,
            "recommended_premium": premium
        }
    except Exception as e:
        return {"error": str(e)}
