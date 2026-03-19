import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

# Load dataset
data = pd.read_csv("data/gig_worker_dataset.csv")

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(data)

# Train Isolation Forest
model = IsolationForest(
    contamination=0.03,
    random_state=42
)

model.fit(X_scaled)

# Save model and scaler
joblib.dump(model, "models/anomaly_model.pkl")
joblib.dump(scaler, "models/scaler.pkl")

print("Model trained and saved successfully.")