TOKEN=$(curl -s -X POST http://powerpuls.runasp.net/api/Auth/login -H "Content-Type: application/json" -d '{"email":"youseef@gmail.com","password":"yousef12345"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
USERID=$(curl -s -X POST http://powerpuls.runasp.net/api/Auth/login -H "Content-Type: application/json" -d '{"email":"youseef@gmail.com","password":"yousef12345"}' | grep -o '"userId":[0-9]*' | cut -d':' -f2)

echo "Token: $TOKEN"
echo "UserId: $USERID"

echo "Fetching subscriptions..."
SUBS=$(curl -s -H "Authorization: Bearer $TOKEN" http://powerpuls.runasp.net/api/Trainers/$USERID/subscriptions)
echo $SUBS

SUBID=$(echo $SUBS | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Sub ID: $SUBID"

echo "Attempting to POST note..."
curl -v -X POST "http://powerpuls.runasp.net/api/Subscriptions/$SUBID/notes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Bash Note","noteText":"Testing 123"}'
