import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Generate synthetic training data
np.random.seed(42)
n_samples = 1000

# Features: rainfall_mm, AQI
rain = np.random.uniform(0, 150, n_samples)
aqi = np.random.uniform(20, 400, n_samples)

X = pd.DataFrame({'rainfall_mm': rain, 'AQI': aqi})

# Labels: 1 if high risk, 0 if low risk
# High risk if rain > 40 or AQI > 200
y = ((rain > 40) | (aqi > 200)).astype(int)

# Add some strict 0-rain cases to enforce 0 probability
X.loc[0:100, 'rainfall_mm'] = 0.0
X.loc[0:100, 'AQI'] = np.random.uniform(20, 100, 101)
y[0:101] = 0

# Train model
model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X, y)

# Overwrite the old broken model
joblib.dump(model, 'risk_model.pkl')
print("Successfully trained and replaced risk_model.pkl")

# Test it
print("Probas for [0, 70]:", model.predict_proba(np.array([[0, 70]])))
print("Probas for [60, 50]:", model.predict_proba(np.array([[60, 50]])))
