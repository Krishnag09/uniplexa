"""
End-to-end API testing script for Uniplexa endpoints
Usage: python test_api.py
"""

import requests
import json
import uuid
import time
from typing import Dict, Any

# Base URL - adjust as needed
BASE_URL = "http://localhost:8000"

# Test data
TEST_PASSWORD = "test1234"
TEST_BUILDING_ID = 1

# Generate randomized email addresses
def generate_test_email(prefix: str = "test") -> str:
    """Generate a unique test email address with timestamp for better uniqueness"""
    unique_id = str(uuid.uuid4())[:8]  # Use first 8 chars of UUID
    timestamp = int(time.time() * 1000)  # Milliseconds timestamp
    return f"{prefix}_{timestamp}_{unique_id}@example.com"

def print_response(response: requests.Response, title: str):
    """Helper function to print formatted response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print(f"{'='*60}\n")

def test_hello():
    """Test GET /hello"""
    response = requests.get(f"{BASE_URL}/hello")
    print_response(response, "GET /hello")
    return response

def test_register(email: str):
    """Test POST /register"""
    print(f"🔍 Attempting to register email: {email}")
    body = {
        "email": email,  # Use the generated email parameter, not hardcoded
        "password": TEST_PASSWORD,
        "role": "renter",
        "building_id": TEST_BUILDING_ID
    }
    response = requests.post(f"{BASE_URL}/register", json=body)
    print_response(response, f"POST /register (email: {email})")
    
    if response.status_code == 409:
        print(f"⚠️  Email already exists in database: {email}")
    elif response.status_code == 200:
        print(f"✅ Successfully registered: {email}")
    
    return response

def test_add_user(email: str):
    """Test POST /add_user"""
    body = {
        "email": email,
        "user_role": "renter",
        "building_id": TEST_BUILDING_ID
    }
    response = requests.post(f"{BASE_URL}/add_user", json=body)
    print_response(response, f"POST /add_user (email: {email})")
    return response

def test_login(email: str):
    """Test POST /login"""
    body = {
        "email": email,
        "password": TEST_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/login", json=body)
    print_response(response, f"POST /login (email: {email})")
    
    #Extract token for use in other tests
    if response.status_code == 200:
        token_data = response.json()
        return token_data.get("access_token")
    return None

def test_verify_token(token: str):
    """Test POST /verify_token"""
    params = {"token": token}
    response = requests.post(f"{BASE_URL}/verify_token", params=params)
    print_response(response, "POST /verify_token")
    return response
# 
def test_create_service_request():
    """Test POST /service-request"""
    body = {
        "desc": "The washing machine in unit 3B is leaking water all over the floor. It started this morning and the water is spreading to the hallway."
    }
    response = requests.post(f"{BASE_URL}/service-request", json=body)
    print_response(response, "POST /service-request")
    # 
    # Extract request_id for use in other tests
    if response.status_code == 200:
        request_data = response.json()
        return request_data.get("request_id")
    return None
# 
def test_get_request(request_id: int):
    """Test GET /service-request/{request_id}"""
    response = requests.get(f"{BASE_URL}/service-request/{request_id}")
    print_response(response, f"GET /service-request/{request_id}")
    return response
# 
def test_get_request_status(request_id: int):
    """Test GET /service-request/status/{request_id}"""
    response = requests.get(f"{BASE_URL}/service-request/status/{request_id}")
    print_response(response, f"GET /service-request/status/{request_id}")
    return response
# 
def test_get_all_requests():
    """Test GET /service-request/all"""
    response = requests.get(f"{BASE_URL}/service-request/all")
    print_response(response, "GET /service-request/all")
    return response
# 
def test_patch_request(request_id: int):
    """Test PATCH /service-requests/{request_id}"""
    body = {
        "request_status": "in_progress"
    }
    response = requests.patch(f"{BASE_URL}/service-requests/{request_id}", json=body)
    print_response(response, f"PATCH /service-requests/{request_id}")
    return response
# 
def test_agent_query():
    """Test POST /agent/query"""
    response = requests.post(f"{BASE_URL}/agent/query")
    print_response(response, "POST /agent/query")
    return response
# 
def test_voice_summary():
    """Test POST /voice-summary"""
    response = requests.post(f"{BASE_URL}/voice-summary")
    print_response(response, "POST /voice-summary")
    return response
# 
def test_set_password(token: str):
    """Test POST /set_password"""
    params = {
        "token": token,
        "new_password": "newpassword123"
    }
    response = requests.post(f"{BASE_URL}/set_password", params=params)
    print_response(response, "POST /set_password")
    return response
# 
def test_change_password(token: str):
    """Test POST /change_password"""
    params = {
        "token": token,
        "old_password": TEST_PASSWORD,
        "new_password": "newpassword123"
    }
    response = requests.post(f"{BASE_URL}/change_password", params=params)
    print_response(response, "POST /change_password")
    return response
# 
def test_forgot_password(email: str):
    """Test POST /forgot_password"""
    params = {"email": email}
    response = requests.post(f"{BASE_URL}/forgot_password", params=params)
    print_response(response, f"POST /forgot_password (email: {email})")
    return response

def main():
    """Run all tests in sequence"""
    print("\n" + "="*60)
    print("UNIPLEXA API END-TO-END TESTING")
    print("="*60)
    
    # Generate randomized emails once at the start for consistency
    # Using timestamp ensures uniqueness even across multiple runs
    test_email = generate_test_email("testuser")
    new_user_email = generate_test_email("newuser")
    
    print(f"\n📧 Generated test email: {test_email}")
    print(f"📧 Generated new user email: {new_user_email}\n")
    
    # Basic endpoint
    test_hello()
    
    # User management
    test_register(test_email)  # Use the pre-generated email
    test_add_user(new_user_email)  # Use the pre-generated email
    token = test_login(test_email)  # Use the same email as registration
    
    if token:
        test_verify_token(token)
    
    # Service requests
    request_id = test_create_service_request()
    
    if request_id:
        test_get_request(request_id)
        test_get_request_status(request_id)
        test_patch_request(request_id)
        test_get_request(request_id)  # Get updated request
    
    test_get_all_requests()
    
    # Other endpoints
    test_agent_query()
    test_voice_summary()
    
    # Test forgot password with the registered email
    test_forgot_password(test_email)
    
    print("\n" + "="*60)
    print("TESTING COMPLETE")
    print(f"Test email used: {test_email}")
    print("="*60)

if __name__ == "__main__":
    main()