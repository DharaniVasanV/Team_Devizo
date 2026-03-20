# Adversarial Defense & Anti-Spoofing Strategy

This repository contains the core logic and machine learning architecture for detecting anomalous gig worker activity, specifically focusing on identifying coordinated fraud rings and spoofing. 

## 1. The Differentiation: Genuine vs. Bad Actor

To distinguish between a genuinely stranded delivery partner (e.g., facing vehicle breakdown, bad weather, or network drop) and a bad actor spoofing their location, our ML architecture employs an **Isolation Forest** anomaly detection model. Instead of relying on a single threshold or rule-based system, the model looks at the multidimensional context of the worker's behavior. 

A genuinely stranded partner might display an expected anomaly, such as a sudden spike in `late_delivery_rate` or a drop in `tasks_completed_per_day`. However, their hardware and foundational app interaction patterns remain consistent. In contrast, a bad actor utilizing GPS spoofing or automated botting will display hyper-efficient but technically anomalous and physically impossible behavior. For instance, completing an unrealistic number of tasks (`tasks_completed_per_day` jumping to 60-100), completing tasks in impossibly short durations (`average_task_time_minutes`), or exhibiting sudden, radical shifts in device parameters (`device_changes` and `location_changes`). The model flags these multivariate deviations—where physical constraints are violated alongside sudden technical shifts—as coordinated spoofing.

## 2. The Data: Beyond Basic GPS Coordinates

While basic GPS coordinates are easily manipulated by bad actors, our system analyzes a rich matrix of behavioral and technical data points to detect coordinated fraud rings:

*   **Device & Hardware Footprint (`device_changes`, `location_changes`)**: Frequent switching between devices or unrealistic teleportation between disparate geographic zones in short time frames strongly indicates spoofing software or account sharing.
*   **Temporal Improbabilities (`average_task_time_minutes`, `login_hours_per_day`)**: Consistently completing deliveries in 1-5 minutes or staying uniformly active and moving for 16-24 hours without realistic human pauses suggests bot automation or location spoofing.
*   **Operational Metrics (`tasks_completed_per_day`, `distance_travelled_km`)**: Completing an excessive number of tasks combined with abnormally high or disjointed travel distances (e.g., teleporting across zones) highlights synthetic activity.
*   **Financial & Quality Indicators (`payout_amount`, `customer_rating`, `cancellation_rate`)**: Fraud rings often maximize volume over quality, leading to massive, disproportionate payouts coupled with unusual cancellation behaviors and extremely low customer ratings (e.g., 1.0 - 2.5).

By feeding these combined data points into the Isolation Forest model, we create a robust fingerprint of normal behavior that coordinated fraud networks cannot easily mimic without losing their efficiency and economic incentive.

## 3. The UX Balance: Fair Handling of Flagged Claims

Our workflow is designed to investigate flags without automatically suspending or penalizing honest gig workers who might just be experiencing bad weather or a dead phone battery. 

1.  **Risk Stratification**: The system outputs a continuous "Anomaly Score" rather than a rigid binary block. Scores are categorized into `LOW`, `MEDIUM`, and `HIGH` risk levels. 
2.  **Frictionless Verification for Medium Risk**: For `MEDIUM` risk anomalies (e.g., strange network drops or delayed GPS syncs causing brief location jumps), the system does not suspend the worker. Instead, it might trigger a lightweight, frictionless verification step (e.g., a simple in-app confirmation or a brief pause in accepting new high-value orders until the signal stabilizes).
3.  **Human-in-the-Loop for High Risk**: `HIGH` risk scores—characterized by impossible metrics like 5 device changes, 80 tasks, and zero travel time—temporarily flag the account but trigger an automated deep-dive review. The claim is routed to a specialized Trust & Safety team dashboard before irreversible action is taken. 
4.  **Context-Aware Grace Periods**: If a worker has a historically strong profile (consistent normal behavior over months) and is in a region currently experiencing known severe weather or network outages, the system dynamically weights their temporary anomalies differently, defaulting to a presumption of "genuine distress" rather than "spoofing."

By utilizing an anomaly score with tiered, context-aware interventions, we ensure the platform remains aggressively secure against fraud rings while maintaining a supportive, fair, and seamless user experience for honest partners.
