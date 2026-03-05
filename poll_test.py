import urllib.request
import urllib.parse
import json
import time
import random

BASE_URL = "http://powerpuls.runasp.net/api"

def make_request(method, url, data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req_data = None
    if data:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(f"{BASE_URL}{url}", data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as res:
            res_str = res.read().decode("utf-8")
            if res_str:
                return json.loads(res_str)
            return None
    except urllib.error.HTTPError as e:
        print(f"HTTPError on {url}: {e.code} {e.reason}")
        err_body = e.read().decode("utf-8")
        print(err_body)
        raise e

rand = random.randint(10000, 99999)
trainer_email = f"trainerai{rand}@example.com"
trainee_email = f"traineeai{rand}@example.com"

# 1. Register Trainer
print("Registering Trainer...")
trainer_data = {
    "name": "Test AI Trainer",
    "email": trainer_email,
    "password": "Password123!",
    "phone": f"1234567{rand}",
    "professionalTitle": "Master Trainer",
    "experienceYears": 5,
    "bio": "I am a test trainer",
    "specializationIds": [],
    "role": "Trainer"
}
trainer_res = make_request("POST", "/auth/signup/trainer", trainer_data)
trainer_token = trainer_res["token"]
trainer_id = trainer_res["userId"]

# 2. Add a short plan - Make it extremely short
print("Adding short plan...")
plan_data = {
    "name": "Short Test Plan",
    "description": "1 minute test",
    "price": 10.0,
    "durationDays": 0,
    "durationHours": 0.005, # roughly 18 seconds
    "features": ["Quick test"],
    "isActive": True
}
make_request("POST", f"/trainers/{trainer_id}/plans", plan_data, trainer_token)

# Fetch plan id
plans = make_request("GET", f"/trainers/{trainer_id}/plans", token=trainer_token)
plan_id = plans[0]["id"]
print(f"Plan ID: {plan_id}")

# 3. Register Trainee
print("Registering Trainee...")
trainee_data = {
    "name": "Test AI Trainee",
    "email": trainee_email,
    "password": "Password123!",
    "phone": f"1234568{rand}",
    "weight": 80,
    "height": 180,
    "role": "Trainee"
}
trainee_res = make_request("POST", "/auth/signup/trainee", trainee_data)
trainee_token = trainee_res["token"]
trainee_id = trainee_res["userId"]

# 4. Subscribe Trainee to Plan
print("Subscribing to plan...")
sub_data = {
    "traineeId": trainee_id,
    "trainingPlanId": plan_id
}
make_request("POST", "/subscriptions", sub_data, trainee_token)

# Get subscription ID
print("Fetching trainer subscriptions to get subscriptionId...")
trainer_subs = make_request("GET", f"/subscriptions/trainer/{trainer_id}", token=trainer_token)
sub_id = trainer_subs[0]["id"]
print(f"Subscription ID: {sub_id}")

# 5. Add multiple notes to the subscription (3 notes to match manual test)
print("Adding notes...")
notes = [
    {"noteText": "Client's chest not growing despite adding incline bench press. Bench press stuck at 60kg for 3 weeks. Need to increase volume.", "title": "Day 1 check-in"},
    {"noteText": "Back lagging behind significantly. Lat pulldown form is poor. Deadlift needs work. Client skipping back day too often.", "title": "Day 2 check-in"},
    {"noteText": "Client is not drinking 3L water as prescribed. Only hitting about 1.5L daily. Sleep is also poor - averaging 5 hours. Body fat around 22%, target is 15%.", "title": "Day 3 check-in"},
]
for note in notes:
    make_request("POST", f"/subscriptions/{sub_id}/notes", note, trainer_token)

# 6. Wait for expiration and poll chat messages directly
print("Polling chat endpoint for AI report...")
found_report = False
for i in range(40): # up to 400 seconds
    time.sleep(10)
    print(f"[{i*10}s] Checking chat messages...")
    chat_res = make_request("GET", f"/chat?userId1={trainee_id}&userId2={trainer_id}", token=trainee_token)
    if chat_res:
        with open("raw_chat.json", "w", encoding="utf-8") as rf:
            json.dump(chat_res, rf, indent=2)
            
        for msg in chat_res:
            content = msg.get('content', '')
            if msg.get("senderRole") == "System" or "AI Performance Report" in content or "Trainer's AI" in content or "AI Debug" in content or "officially ended" in content:
                print("\n======== AI REPORT FOUND ========")
                with open("ai_report.txt", "w", encoding="utf-8") as f:
                    f.write(content)
                found_report = True
                break
    if found_report:
        break
    
    # Check subscription status too just in case
    subs = make_request("GET", f"/subscriptions/trainer/{trainer_id}", token=trainer_token)
    current_sub = next((s for s in subs if s["id"] == sub_id), None)
    if current_sub:
        status = current_sub.get("status", "Unknown")
        print(f"   Sub status: {status}")

if not found_report:
    print("Failed to get AI report within time limit.")
