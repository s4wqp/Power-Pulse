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

# 2. Add a short plan
print("Adding short plan...")
plan_data = {
    "name": "Short Test Plan",
    "description": "1 minute test",
    "price": 10.0,
    "durationDays": 0,
    "durationHours": 0.02, # about 1.2 minutes
    "features": ["Quick test"],
    "isActive": True
}
make_request("POST", f"/trainers/{trainer_id}/plans", plan_data, trainer_token)

# we need the plan ID. let's fetch plans
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
# trainee needs to subscribe. wait, trainee_repository.dart uses the simple subscribe API
# await _apiClient.dio.post('/api/subscriptions', data: {'traineeId': traineeId, 'trainingPlanId': trainingPlanId});
# Wait, let's use trainee token to hit this endpoint
# Does it return the subscription? Let's just make the request
sub_res = make_request("POST", "/subscriptions", sub_data, trainee_token)

# We need the subscriptionId to add notes, how to get it?
# The trainer repository has: getTrainerSubscriptions(trainerId)
print("Fetching trainer subscriptions to get subscriptionId...")
trainer_subs = make_request("GET", f"/subscriptions/trainer/{trainer_id}", token=trainer_token)
sub_id = trainer_subs[0]["id"]
print(f"Subscription ID: {sub_id}")

# 5. Add notes to the subscription
print("Adding notes...")
note_text = "Client's chest not growing. Back lagging behind significantly. They are not drinking 3L water as prescribed."
note_data = {
    "noteText": note_text,
    "title": "Daily check-in"
}
make_request("POST", f"/subscriptions/{sub_id}/notes", note_data, trainer_token)

# 6. Wait for expiration (about 2 minutes)
print("Waiting for subscription to expire (120 seconds)...")
for i in range(12):
    time.sleep(10)
    print(f"Elapsed: {(i+1)*10}s")

# 7. Check chat messages for the AI report!
print("Checking chat messages...")
chat_res = make_request("GET", f"/chat?userId1={trainee_id}&userId2={trainer_id}", token=trainee_token)
if chat_res:
    for msg in chat_res:
        if msg.get("senderRole") == "System" or "AI Performance Report" in str(msg.get("content")):
            print(f"\nAI Report found:\n{msg.get('content')}")
else:
    print("No chat messages found.")
