import joblib
import numpy as np
import warnings

warnings.filterwarnings('ignore')
model = joblib.load("risk_model.pkl")

tests = [
  [0, 50],
  [0, 70],
  [0, 200],
  [0, 300],
  [50, 50],
  [120, 50]
]

for t in tests:
    print(f"Probas for {t}:", model.predict_proba(np.array([t])))
