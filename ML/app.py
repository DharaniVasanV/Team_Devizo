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
    rainfall: float
    temperature: float
    aqi: float
    delivery_hours: float

@app.post("/predict")
def predict(data: ClaimData):
    try:
        # 1. Convert exactly 4 input features to a list and pad with 6 zeros (model expects 10 features)
        base_features = [data.rainfall, data.temperature, data.aqi, data.delivery_hours]
        padded_features = base_features + [0.0] * 6
        input_data = np.array([padded_features])
        
        # 2. Apply scaler.transform()
        scaled_data = scaler.transform(input_data)
        
        # 3. Pass scaled data into anomaly_model.predict()
        prediction = int(model.predict(scaled_data)[0])
        
        # 4. Return prediction
        status = "normal" if prediction == 1 else "anomaly"
        
        return {
            "prediction": prediction,
            "status": status
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/predict-risk")
def predict_risk(data: ClaimData):
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
