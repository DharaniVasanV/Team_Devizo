import pandas as pd
import numpy as np

np.random.seed(42)

records = 10000

data = {
    "tasks_completed_per_day": np.random.randint(5, 40, records),
    "average_task_time_minutes": np.random.randint(10, 40, records),
    "distance_travelled_km": np.random.randint(10, 80, records),
    "payout_amount": np.random.randint(500, 3000, records),
    "customer_rating": np.round(np.random.uniform(3.5, 5.0, records), 2),
    "login_hours_per_day": np.random.randint(4, 12, records),
    "device_changes": np.random.randint(0, 2, records),
    "location_changes": np.random.randint(0, 3, records),
    "cancellation_rate": np.round(np.random.uniform(0.01, 0.15, records), 2),
    "late_delivery_rate": np.round(np.random.uniform(0.02, 0.20, records), 2)
}

df = pd.DataFrame(data)

# Inject anomalies
anomaly_count = int(0.03 * records)

for i in np.random.choice(records, anomaly_count):
    df.loc[i] = [
        np.random.randint(60,100),
        np.random.randint(1,5),
        np.random.randint(150,300),
        np.random.randint(7000,12000),
        np.random.uniform(1,2.5),
        np.random.randint(16,24),
        np.random.randint(3,6),
        np.random.randint(5,10),
        np.random.uniform(0.40,0.80),
        np.random.uniform(0.40,0.80)
    ]

df.to_csv("data/gig_worker_dataset.csv", index=False)

print("Synthetic dataset generated successfully.")