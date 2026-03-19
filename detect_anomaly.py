import joblib
import numpy as np

model = joblib.load("models/anomaly_model.pkl")
scaler = joblib.load("models/scaler.pkl")

def get_user_input():

    tasks = float(input("Tasks completed per day: "))
    task_time = float(input("Average task time (minutes): "))
    distance = float(input("Distance travelled (km): "))
    payout = float(input("Payout amount: "))
    rating = float(input("Customer rating: "))
    login_hours = float(input("Login hours per day: "))
    device_changes = float(input("Device changes: "))
    location_changes = float(input("Location changes: "))
    cancel_rate = float(input("Cancellation rate: "))
    late_rate = float(input("Late delivery rate: "))

    return np.array([[tasks, task_time, distance, payout, rating,
                      login_hours, device_changes, location_changes,
                      cancel_rate, late_rate]])

def risk_level(score):

    if score > -0.1:
        return "LOW"
    elif score > -0.3:
        return "MEDIUM"
    else:
        return "HIGH"

while True:

    print("\nEnter Gig Worker Activity Data\n")

    data = get_user_input()

    data_scaled = scaler.transform(data)

    prediction = model.predict(data_scaled)
    score = model.decision_function(data_scaled)[0]

    if prediction[0] == -1:
        result = "Suspicious Behavior"
    else:
        result = "Normal Behavior"

    print("\nGig Worker Activity Analysis")
    print("----------------------------")
    print("Prediction:", result)
    print("Anomaly Score:", round(score,3))
    print("Risk Level:", risk_level(score))

    cont = input("\nTest another transaction? (y/n): ")

    if cont.lower() != "y":
        break