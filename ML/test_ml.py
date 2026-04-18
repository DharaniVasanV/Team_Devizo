import joblib
import numpy as np

model = joblib.load("risk_model.pkl")
probas = model.predict_proba(np.array([[0, 28]]))
print("Probas for [0, 28]:", probas)
