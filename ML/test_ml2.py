import joblib
import numpy as np
import warnings

warnings.filterwarnings('ignore')

model = joblib.load("risk_model.pkl")

# We can inspect the feature names from the model if available
if hasattr(model, "feature_names_in_"):
    print("Feature names:", model.feature_names_in_)

print("Probas for [0, 28]:", model.predict_proba(np.array([[0, 28]])))
print("Probas for [28, 0]:", model.predict_proba(np.array([[28, 0]])))
