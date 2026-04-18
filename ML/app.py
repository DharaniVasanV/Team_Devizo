from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

from fastapi.responses import HTMLResponse

app = FastAPI(
    title="PayProtect AI Engine 🚀",
    description="AI-powered fraud detection and payout simulation for gig worker insurance",
    version="1.0.0",
    docs_url=None,
    redoc_url=None
)

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui():
    return HTMLResponse(f"""
<!DOCTYPE html>
<html>
<head>
    <title>PayProtect AI Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
    <style>
        body {{
            background: #ffffff;
            font-family: 'Inter', sans-serif;
        }}
        .topbar {{
            background-color: #0b1f3a !important; /* PayProtect theme dark blue for header */
        }}
        .swagger-ui .info hgroup.main h2 {{
            color: #2563eb; /* Deeper blue for contrast on white */
            font-size: 30px;
            font-weight: bold;
        }}
        .swagger-ui .btn.execute {{
            background-color: #2563eb;
            color: white;
            border-radius: 10px;
            font-weight: bold;
        }}
        .swagger-ui .opblock-tag {{
            color: #16a34a; /* Darker green for contrast on white */
            font-weight: bold;
            font-size: 16px;
        }}
        .swagger-ui .opblock {{
            border-radius: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05); /* Softer shadow for white theme */
            margin-bottom: 12px;
        }}
        .swagger-ui .opblock-summary-method {{
            border-radius: 8px;
        }}
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
        SwaggerUIBundle({{
            url: "{app.openapi_url}",
            dom_id: '#swagger-ui',
        }});
    </script>
</body>
</html>
""")

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

@app.post("/fraud-detection", tags=["Fraud Detection 🚨"])
def fraud_detection(data: ClaimData):
    """
    Detects anomalous or suspicious worker behavior using machine learning.
    """
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

@app.post("/payout-simulation", tags=["Payout Simulation 💰"])
def payout_simulation(data: RiskData):
    """
    Calculates risk level and determines payout amount based on environmental conditions.
    """
    try:
        # Pass 2 features: rainfall and temperature (assuming these are the 2 the risk_model needs)
        input_data = np.array([[data.rainfall, data.temperature]])
        
        # Get probability of class 1 for risk_score
        probas = risk_model.predict_proba(input_data)[0]
        risk_score = float(probas[1]) if len(probas) > 1 else float(probas[0])
        
        if risk_score < 0.3:
            risk_level = "low"
            payout = 0
        elif risk_score < 0.7:
            risk_level = "medium"
            payout = 200
        else:
            risk_level = "high"
            payout = 300
            
        return {
            "risk_score": round(risk_score, 3),
            "risk_level": risk_level,
            "recommended_payout": payout
        }
    except Exception as e:
        return {"error": str(e)}
