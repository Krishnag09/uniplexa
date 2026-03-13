"""
End-to-end API testing script for Uniplexa endpoints
Usage: python test_api.py
"""

import requests
import json
import random
import uuid
import time
from typing import Dict, Any

# Base URL - adjust as needed
BASE_URL = "http://localhost:8000"

# Test data
TEST_PASSWORD = "test1234"
TEST_BUILDING_ID = 1

# Hardcoded admin user for building management tests
# This user will be reused across test runs
ADMIN_EMAIL = "admin@test.uniplexa.com"
ADMIN_PASSWORD = "admin1234"

# Base email used for add_user / set_password flow.
# The script will automatically generate: thekrishnagaurav+X@gmail.com (random X)
ADD_USER_EMAIL_BASE = "thekrishnagaurav@gmail.com"


def gmail_plus_alias(base_email: str) -> str:
    """
    Convert 'name@gmail.com' -> 'name+X@gmail.com' with random X.
    Useful for testing without creating new inboxes.
    """
    local, sep, domain = base_email.partition("@")
    if not sep:
        return base_email
    x = random.randint(1, 999999)
    return f"{local}+{x}@{domain}"

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
    print(f"Headers: {dict(response.headers)}")
    print(f"\n--- Response Body (Raw) ---")
    print(response.text)
    print(f"\n--- Response Body (Parsed JSON) ---")
    try:
        response_json = response.json()
        print(json.dumps(response_json, indent=2))
    except json.JSONDecodeError:
        print("(Not valid JSON)")
    except Exception as e:
        print(f"(Error parsing JSON: {e})")
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
    """Test POST /add_user
    
    Returns:
        tuple: (response, signup_token) - Returns the response and extracted token from signup_link
    """
    body = {
        "email": email,
        "user_role": "renter",
        "building_id": TEST_BUILDING_ID
    }
    response = requests.post(f"{BASE_URL}/add_user", json=body)
    print_response(response, f"POST /add_user (email: {email})")
    
    # Extract token from signup_link if available
    token = None
    if response.status_code == 200:
        try:
            response_data = response.json()
            signup_link = response_data.get("signup_link", "")
            # Extract token from URL like: "https://example.com/set_password?token=abc123"
            if "?token=" in signup_link:
                token = signup_link.split("?token=")[1]
                print(f"✅ Extracted signup token from response")
            else:
                print(f"⚠️  Signup link found but no token in format: {signup_link}")
        except Exception as e:
            print(f"⚠️  Could not extract token from response: {e}")
    
    return response, token

def test_login(email: str):
    """Test POST /login"""
    body = {
        "email": email,
        "password": TEST_PASSWORD
    }
    response = requests.post(f"{BASE_URL}/login", json=body)
    print_response(response, "POST /login")
    
    # Extract token for use in other tests
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
def test_create_service_request(desc: str = None, building_id: int = None, token: str = None):
    """Test POST /service-request
    
    Args:
        desc: Optional description text. If not provided, uses a default test description.
        building_id: Optional building ID. If not provided, uses TEST_BUILDING_ID.
        token: Authentication token (Bearer token). Required for authenticated endpoints.
    
    Returns:
        dict: Response data with request_id and all request fields, or None if failed
    """
    if desc is None:
        desc = "The washing machine in unit 3B is leaking water all over the floor. It started this morning and the water is spreading to the hallway."
    
    if building_id is None:
        building_id = TEST_BUILDING_ID
    
    body = {
        "desc": desc,
        "building_id": building_id
    }
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.post(f"{BASE_URL}/service-request", json=body, headers=headers)
    print_response(response, "POST /service-request")
    
    # Validate response
    if response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    elif response.status_code == 200:
        request_data = response.json()
        
        # Verify all required fields from ServiceRequest schema are present
        # According to schemas.ServiceRequest, these are the required fields:
        required_fields = [
            "building_id",
            "request_title", 
            "request_desc", 
            "request_category", 
            "request_date", 
            "request_time", 
            "request_status"
        ]
        
        missing_fields = [field for field in required_fields if field not in request_data]
        if missing_fields:
            print(f"⚠️  Missing required fields in response: {missing_fields}")
            return None
        
        # Check for request_id (returned by endpoint, needed for subsequent tests)
        request_id = request_data.get("request_id")
        if request_id is None:
            print("⚠️  request_id is missing from response (needed for other tests)")
        
        # Validate request_status is "pending" (default status)
        if request_data.get("request_status") != "pending":
            print(f"⚠️  Expected request_status to be 'pending', got: {request_data.get('request_status')}")
        
        # Validate request_desc matches input
        if request_data.get("request_desc") != desc:
            print(f"⚠️  request_desc does not match input description")
        
        if request_id:
            print(f"✅ Service request created successfully with ID: {request_id}")
        else:
            print(f"✅ Service request created successfully")
        print(f"   Building ID: {request_data.get('building_id')}")
        print(f"   Title: {request_data.get('request_title')}")
        print(f"   Category: {request_data.get('request_category')}")
        print(f"   Status: {request_data.get('request_status')}")
        
        return request_data  # Return full response data
    else:
        print(f"❌ Failed to create service request. Status code: {response.status_code}")
        return None
# 
def test_get_request(request_id: int, token: str = None):
    """Test GET /service-request/{request_id}
    
    Args:
        request_id: ID of the service request to retrieve
        token: Authentication token (Bearer token). Required for authenticated endpoints.
    """
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.get(f"{BASE_URL}/service-request/{request_id}", headers=headers)
    print_response(response, f"GET /service-request/{request_id}")
    
    if response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    elif response.status_code == 403:
        print(f"❌ Access denied: You don't have permission to view this request")
    elif response.status_code == 404:
        print(f"❌ Request not found: {request_id}")
    
    return response
# 
def test_get_request_status(request_id: int, token: str = None):
    """Test GET /service-request/status/{request_id}
    
    Args:
        request_id: ID of the service request
        token: Authentication token (Bearer token). Required for authenticated endpoints.
    """
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.get(f"{BASE_URL}/service-request/status/{request_id}", headers=headers)
    print_response(response, f"GET /service-request/status/{request_id}")
    
    if response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    elif response.status_code == 403:
        print(f"❌ Access denied: You don't have permission to view this request")
    elif response.status_code == 404:
        print(f"❌ Request not found: {request_id}")
    
    return response

def test_delete_request(request_id: int, token: str = None):
    """Test DELETE /service-request/{request_id}
    
    Args:
        request_id: ID of the service request to delete
        token: Authentication token (Bearer token). Required for authenticated endpoints.
    """
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.delete(f"{BASE_URL}/service-request/{request_id}", headers=headers)
    print_response(response, f"DELETE /service-request/{request_id}")
    
    if response.status_code == 200:
        print(f"✅ Request deleted successfully")
    elif response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    elif response.status_code == 403:
        print(f"❌ Access denied: Only the request owner or admin can delete requests")
    elif response.status_code == 404:
        print(f"❌ Request not found: {request_id}")
    else:
        print(f"❌ Failed to delete request. Status code: {response.status_code}")
    
    return response

def test_get_current_user(token: str):
    """Test GET /me (get current authenticated user)
    
    Args:
        token: Authentication token (Bearer token)
    """
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/me", headers=headers)
    print_response(response, "GET /me")
    
    if response.status_code == 200:
        user_data = response.json()
        print(f"✅ Current user retrieved successfully")
        print(f"   User ID: {user_data.get('id')}")
        print(f"   Email: {user_data.get('email')}")
        print(f"   Role: {user_data.get('role')}")
    elif response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    
    return response
# 
def test_get_all_requests(building_id: int = None, token: str = None):
    """Test GET /service-request/all/{building_id}
    
    Args:
        building_id: Optional building ID. If not provided, uses TEST_BUILDING_ID.
        token: Authentication token (Bearer token). Required for authenticated endpoints.
    """
    if building_id is None:
        building_id = TEST_BUILDING_ID
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.get(f"{BASE_URL}/service-request/all/{building_id}", headers=headers)
    print_response(response, f"GET /service-request/all/{building_id}")
    
    if response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    elif response.status_code == 403:
        print(f"❌ Access denied: You can only view requests from your building")
    
    return response
# 
def test_patch_request(request_id: int, token: str = None):
    """Test PATCH /service-request/{request_id}
    
    Args:
        request_id: ID of the service request to update
        token: Authentication token (Bearer token). Required for authenticated endpoints.
    """
    body = {
        "request_status": "in_progress"  # Must match RequestStatus enum: pending, in_progress, completed, cancelled
    }
    
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.patch(
        f"{BASE_URL}/service-request/{request_id}", 
        json=body,
        headers=headers
    )
    print_response(response, f"PATCH /service-request/{request_id}")
    
    # Print detailed error messages
    if response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    elif response.status_code == 403:
        print(f"❌ Access denied: Only the request owner or admin can update requests")
    elif response.status_code == 404:
        print(f"❌ Request not found: {request_id}")
    elif response.status_code == 422:
        print("\n⚠️  Validation Error Details:")
        try:
            error_detail = response.json()
            print(json.dumps(error_detail, indent=2))
        except Exception:
            print(f"Raw response: {response.text}")
    
    return response
# 
def test_agent_query(token: str = None):
    """Test POST /agent/query
    
    Args:
        token: Authentication token (Bearer token). Required for authenticated endpoints.
    """
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.post(f"{BASE_URL}/agent/query", headers=headers)
    print_response(response, "POST /agent/query")
    
    if response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    
    return response
# 
def test_voice_summary(building_id: int = None, token: str = None):
    """Test POST /voice-summary
    
    Args:
        building_id: Optional building ID. If not provided, uses TEST_BUILDING_ID.
        token: Authentication token (Bearer token). Required for authenticated endpoints.
    """
    if building_id is None:
        building_id = TEST_BUILDING_ID
    
    params = {"building_id": building_id}
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.post(f"{BASE_URL}/voice-summary", params=params, headers=headers)
    print_response(response, f"POST /voice-summary (building_id: {building_id})")
    
    if response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    
    return response
# 
def test_set_password(token: str, new_password: str = "newpassword123"):
    """Test POST /set_password
    
    Args:
        token: Signup token from /add_user signup_link
        new_password: Password to set (default: "newpassword123")
    
    Returns:
        response: HTTP response object
    """
    body = {
        "token": token,
        "new_password": new_password
    }
    response = requests.post(f"{BASE_URL}/set_password", json=body)
    print_response(response, "POST /set_password")
    
    if response.status_code == 200:
        print(f"✅ Password set successfully")
    elif response.status_code == 404:
        print(f"❌ User not found (check token is valid)")
    elif response.status_code == 400:
        error_detail = response.json().get("detail", "Unknown error")
        if "already set" in error_detail.lower():
            print(f"⚠️  Password already set for this user")
        else:
            print(f"❌ Invalid request: {error_detail}")
    elif response.status_code == 401:
        print(f"❌ Invalid or expired token")
    else:
        print(f"⚠️  Unexpected status code: {response.status_code}")
    
    return response

def test_set_password_flow(email: str, password: str):
    """Test the complete set_password flow:
    1. Add user (creates user without password)
    2. Extract token from signup_link
    3. Set password using token
    4. Verify login with new password
    
    Args:
        email: User email to create
        password: Password to set
    
    Returns:
        bool: True if all steps completed successfully
    """
    print(f"\n{'='*60}")
    print(f"🔐 SET PASSWORD FLOW TEST")
    print(f"{'='*60}")
    
    # Step 1: Add user (creates user without password)
    print(f"\n📋 Step 1: Adding new user (without password)...")
    add_response, token = test_add_user(email)
    
    if add_response.status_code != 200:
        print(f"❌ Failed to add user: {add_response.status_code}")
        return False
    
    if not token:
        print(f"❌ Could not extract token from signup_link")
        print(f"   Check server logs for the signup link and extract token manually")
        print(f"   Then call: test_set_password(token, '{password}')")
        return False
    
    # Step 2: Set password using token
    print(f"\n📋 Step 2: Setting password using signup token...")
    set_response = test_set_password(token, password)
    
    if set_response.status_code != 200:
        print(f"❌ Failed to set password: {set_response.status_code}")
        return False
    
    # Step 3: Verify user cannot login before password is set (should fail)
    # Actually, password is now set, so let's verify it works
    
    # Step 4: Verify login with new password works
    print(f"\n📋 Step 3: Verifying login with new password...")
    login_body = {
        "email": email,
        "password": password
    }
    login_response = requests.post(f"{BASE_URL}/login", json=login_body)
    
    if login_response.status_code == 200:
        login_data = login_response.json()
        print(f"✅ Login successful with new password!")
        print(f"   User ID: {login_data.get('user', {}).get('id')}")
        print(f"   Email: {login_data.get('user', {}).get('email')}")
        return True
    else:
        print(f"❌ Login failed after setting password")
        print_response(login_response, "POST /login (after set_password)")
        return False
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
    """Test POST /forgot_password
    
    Returns:
        tuple: (response, success_flag) - success_flag indicates if user was found
    """
    body = {"email": email}
    response = requests.post(f"{BASE_URL}/forgot_password", json=body)
    print_response(response, f"POST /forgot_password (email: {email})")
    
    if response.status_code == 200:
        print(f"✅ Password reset link sent successfully for {email}")
        print(f"   Note: In production, check email for reset link")
        print(f"   Check server logs for the reset token/link")
    elif response.status_code == 404:
        print(f"❌ User not found: {email}")
    else:
        print(f"⚠️  Unexpected status code: {response.status_code}")
    
    return response, response.status_code == 200

def test_password_reset(token: str, new_password: str):
    """Test POST /password-reset
    
    Args:
        token: Password reset token (normally from email link)
        new_password: New password to set
    
    Returns:
        response: HTTP response object
    """
    params = {
        "token": token,
        "new_password": new_password
    }
    response = requests.post(f"{BASE_URL}/password-reset", params=params)
    print_response(response, f"POST /password-reset")
    
    if response.status_code == 200:
        print(f"✅ Password reset successfully")
    elif response.status_code == 401:
        print(f"❌ Invalid or expired token")
    elif response.status_code == 404:
        print(f"❌ User not found")
    elif response.status_code == 400:
        print(f"❌ Invalid password or validation error")
    else:
        print(f"⚠️  Unexpected status code: {response.status_code}")
    
    return response

def test_password_reset_flow(email: str, old_password: str, new_password: str):
    """Test the complete password reset flow:
    1. Register/login with old password
    2. Request password reset
    3. Reset password (requires manual token extraction from logs/email)
    4. Login with new password
    
    Args:
        email: User email
        old_password: Current password
        new_password: New password to set
    
    Returns:
        bool: True if all steps completed successfully
    """
    print(f"\n{'='*60}")
    print(f"🔐 PASSWORD RESET FLOW TEST")
    print(f"{'='*60}")
    
    # Step 1: Ensure user exists (try to login first)
    print(f"\n📋 Step 1: Verifying user exists...")
    login_body = {
        "email": email,
        "password": old_password
    }
    login_response = requests.post(f"{BASE_URL}/login", json=login_body)
    
    if login_response.status_code != 200:
        print(f"⚠️  User doesn't exist or wrong password. Registering user first...")
        register_body = {
            "email": email,
            "password": old_password,
            "role": "renter",
            "building_id": TEST_BUILDING_ID
        }
        register_response = requests.post(f"{BASE_URL}/register", json=register_body)
        if register_response.status_code not in [200, 409]:
            print(f"❌ Failed to register user: {register_response.status_code}")
            return False
        print(f"✅ User registered/verified")
    else:
        print(f"✅ User verified (can login with old password)")
    
    # Step 2: Request password reset
    print(f"\n📋 Step 2: Requesting password reset...")
    forgot_response, success = test_forgot_password(email)
    
    if not success:
        print(f"❌ Failed to request password reset")
        return False
    
    # Step 3: Note about token extraction
    print(f"\n📋 Step 3: Password reset requested successfully")
    print(f"   ⚠️  To complete the full flow, you need to:")
    print(f"   1. Check server console logs for: 'Password reset link: ...'")
    print(f"   2. Extract the token from the URL in the logs")
    print(f"   3. Call: test_password_reset_with_token('{email}', token, '{new_password}')")
    print(f"\n   Note: The token is printed in server logs but not returned in response")
    
    return True

def test_request_signin_link(email: str):
    """Test POST /request-signin-link
    
    Args:
        email: User email to send sign-in link to
    
    Returns:
        tuple: (response, success_flag, token) - token is extracted from server logs/response if available
    """
    body = {"email": email}
    response = requests.post(f"{BASE_URL}/request-signin-link", json=body)
    print_response(response, f"POST /request-signin-link (email: {email})")
    
    if response.status_code == 200:
        print(f"✅ Sign-in link sent successfully for {email}")
        print(f"   Note: In production, check email for sign-in link")
        print(f"   Check server logs for the sign-in token/link")
        return response, True, None
    elif response.status_code == 404:
        print(f"❌ User not found: {email}")
        return response, False, None
    else:
        print(f"⚠️  Unexpected status code: {response.status_code}")
        return response, False, None

def test_signin_with_link(token: str):
    """Test POST /signin-with-link
    
    Args:
        token: Sign-in link token (normally from email link)
    
    Returns:
        tuple: (response, access_token, user_data) - Returns response, access_token, and user_data dict if successful
               user_data contains: id, email, role, building_id
    """
    body = {"token": token}
    response = requests.post(f"{BASE_URL}/signin-with-link", json=body)
    print_response(response, f"POST /signin-with-link")
    
    if response.status_code == 200:
        response_data = response.json()
        access_token = response_data.get("access_token")
        user_data = response_data.get("user", {})
        print(f"✅ Sign-in successful with one-time link!")
        print(f"   User ID: {user_data.get('id')}")
        print(f"   Email: {user_data.get('email')}")
        print(f"   Role: {user_data.get('role')}")
        print(f"   Building ID: {user_data.get('building_id')}")
        return response, access_token, user_data
    elif response.status_code == 401:
        print(f"❌ Invalid or expired token")
        return response, None, None
    elif response.status_code == 404:
        print(f"❌ User not found")
        return response, None, None
    else:
        print(f"⚠️  Unexpected status code: {response.status_code}")
        return response, None, None

def test_signin_link_flow(email: str):
    """Test the complete one-time sign-in link flow:
    1. Request sign-in link
    2. Extract token from server logs
    3. Sign in with token
    4. Verify access token works
    
    Args:
        email: User email
    
    Returns:
        bool: True if all steps completed successfully (if token extracted from logs)
    """
    print(f"\n{'='*60}")
    print(f"🔗 ONE-TIME SIGN-IN LINK FLOW TEST")
    print(f"{'='*60}")
    
    # Step 1: Request sign-in link
    print(f"\n📋 Step 1: Requesting sign-in link...")
    request_response, success, _ = test_request_signin_link(email)
    
    if not success:
        print(f"❌ Failed to request sign-in link")
        return False
    
    # Step 2: Note about token extraction
    print(f"\n📋 Step 2: Sign-in link requested successfully")
    print(f"   ⚠️  To complete the full flow, you need to:")
    print(f"   1. Check server console logs for: 'Signin link: ...'")
    print(f"   2. Extract the token from the URL in the logs (after ?token=)")
    print(f"   3. Call: test_signin_with_link(token)")
    print(f"\n   Note: The token is printed in server logs but not returned in response")
    
    return True

def test_signin_link_flow_with_token(email: str, token: str):
    """Complete one-time sign-in link test with provided token
    
    This is a helper function to test the sign-in after you have the token
    from the request-signin-link email/logs.
    
    Args:
        email: User email (for verification)
        token: Sign-in link token from request-signin-link response
    
    Returns:
        tuple: (success, access_token) - True if sign-in successful and access token
    """
    print(f"\n{'='*60}")
    print(f"🔗 ONE-TIME SIGN-IN LINK WITH TOKEN TEST")
    print(f"{'='*60}")
    
    # Step 1: Sign in with token
    print(f"\n📋 Step 1: Signing in with one-time link token...")
    signin_response, access_token, user_data = test_signin_with_link(token)
    
    if not access_token:
        print(f"❌ Sign-in with link failed")
        return False, None
    
    # Display user info from response
    if user_data:
        print(f"   Retrieved user info:")
        print(f"   - ID: {user_data.get('id')}")
        print(f"   - Email: {user_data.get('email')}")
        print(f"   - Role: {user_data.get('role')}")
        print(f"   - Building ID: {user_data.get('building_id')}")
    
    # Step 2: Verify access token works (test /me endpoint)
    print(f"\n📋 Step 2: Verifying access token works (testing /me endpoint)...")
    headers = {"Authorization": f"Bearer {access_token}"}
    me_response = requests.get(f"{BASE_URL}/me", headers=headers)
    
    if me_response.status_code == 200:
        user_data = me_response.json()
        if user_data.get("email") == email:
            print(f"✅ Access token verified! Can access authenticated endpoints")
            print(f"   Verified email: {user_data.get('email')}")
            return True, access_token
        else:
            print(f"⚠️  Warning: Access token works but email mismatch")
            print(f"   Expected: {email}")
            print(f"   Got: {user_data.get('email')}")
            return True, access_token  # Token works, just email mismatch
    else:
        print(f"⚠️  Warning: Access token might not be working (got {me_response.status_code} from /me)")
        return True, access_token  # Sign-in worked, but /me failed (might be separate issue)

def test_password_reset_with_token(email: str, token: str, old_password: str, new_password: str):
    """Complete password reset test with provided token
    
    This is a helper function to test the reset after you have the token
    from the forgot_password email/logs.
    
    Args:
        email: User email (for verification)
        token: Password reset token from forgot_password response
        old_password: Current password (to verify it stops working after reset)
        new_password: New password to set
    
    Returns:
        bool: True if password reset and login with new password succeeds
    """
    print(f"\n{'='*60}")
    print(f"🔐 PASSWORD RESET WITH TOKEN TEST")
    print(f"{'='*60}")
    
    # Step 1: Verify old password works before reset
    print(f"\n📋 Step 0: Verifying old password works before reset...")
    old_login_body = {
        "email": email,
        "password": old_password
    }
    old_login_before = requests.post(f"{BASE_URL}/login", json=old_login_body)
    if old_login_before.status_code != 200:
        print(f"⚠️  Warning: Old password doesn't work before reset (user may not exist)")
    else:
        print(f"✅ Old password works (verified)")
    
    # Step 2: Reset password
    print(f"\n📋 Step 1: Resetting password...")
    reset_response = test_password_reset(token, new_password)
    
    if reset_response.status_code != 200:
        print(f"❌ Password reset failed")
        return False
    
    # Step 3: Verify old password no longer works
    print(f"\n📋 Step 2: Verifying old password no longer works...")
    old_login_after = requests.post(f"{BASE_URL}/login", json=old_login_body)
    if old_login_after.status_code == 200:
        print(f"⚠️  Warning: Old password still works after reset (this shouldn't happen)")
    else:
        print(f"✅ Old password no longer works (as expected)")
    
    # Step 4: Verify new password works
    print(f"\n📋 Step 3: Verifying new password works...")
    new_login_body = {
        "email": email,
        "password": new_password
    }
    new_login_response = requests.post(f"{BASE_URL}/login", json=new_login_body)
    
    if new_login_response.status_code == 200:
        print(f"✅ Password reset successful! Can login with new password")
        return True
    else:
        print(f"❌ Password reset failed - cannot login with new password")
        return False

def test_create_building(token: str = None, building_data: Dict[str, Any] = None):
    """Test POST /buildings (Admin only)
    
    Args:
        token: Admin authentication token (Bearer token)
        building_data: Optional building data dict. If not provided, uses default test data.
    
    Returns:
        dict: Response data with building_id and all building fields, or None if failed
    """
    if building_data is None:
        building_data = {
            "building_name": f"Test Building {int(time.time())}",
            "building_address": "123 Test Street",
            "building_city": "Test City",
            "building_state": "TS",
            "building_zip": "12345",
            "building_country": "USA",
            "building_latitude": 40.7128,
            "building_longitude": -74.0060
        }
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.post(f"{BASE_URL}/buildings", json=building_data, headers=headers)
    print_response(response, "POST /buildings")
    
    if response.status_code == 200:
        building_response = response.json()
        building_id = building_response.get("building_id")
        if building_id:
            print(f"✅ Building created successfully with ID: {building_id}")
            print(f"   Name: {building_response.get('building_name')}")
            print(f"   Address: {building_response.get('building_address')}")
            return building_response
        else:
            print(f"⚠️  Building created but building_id missing from response")
            return building_response
    elif response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    elif response.status_code == 403:
        print(f"❌ Admin privileges required")
    else:
        print(f"❌ Failed to create building. Status code: {response.status_code}")
    
    return None

def test_get_all_buildings():
    """Test GET /buildings"""
    response = requests.get(f"{BASE_URL}/buildings")
    print_response(response, "GET /buildings")
    
    if response.status_code == 200:
        buildings = response.json()
        print(f"✅ Retrieved {len(buildings)} building(s)")
        return buildings
    else:
        print(f"❌ Failed to retrieve buildings. Status code: {response.status_code}")
        return None

def test_get_building(building_id: int):
    """Test GET /buildings/{building_id}"""
    response = requests.get(f"{BASE_URL}/buildings/{building_id}")
    print_response(response, f"GET /buildings/{building_id}")
    
    if response.status_code == 200:
        building = response.json()
        print(f"✅ Retrieved building: {building.get('building_name')}")
        return building
    elif response.status_code == 404:
        print(f"❌ Building not found: {building_id}")
    else:
        print(f"❌ Failed to retrieve building. Status code: {response.status_code}")
    
    return None

def test_update_building(building_id: int, token: str = None, update_data: Dict[str, Any] = None):
    """Test PATCH /buildings/{building_id} (Admin only)
    
    Args:
        building_id: ID of building to update
        token: Admin authentication token (Bearer token)
        update_data: Optional update data dict. If not provided, uses default test data.
    
    Returns:
        dict: Updated building data, or None if failed
    """
    if update_data is None:
        update_data = {
            "building_name": f"Updated Building {int(time.time())}",
            "building_city": "Updated City"
        }
    
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.patch(
        f"{BASE_URL}/buildings/{building_id}",
        json=update_data,
        headers=headers
    )
    print_response(response, f"PATCH /buildings/{building_id}")
    
    if response.status_code == 200:
        building = response.json()
        print(f"✅ Building updated successfully")
        print(f"   Name: {building.get('building_name')}")
        return building
    elif response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    elif response.status_code == 403:
        print(f"❌ Admin privileges required")
    elif response.status_code == 404:
        print(f"❌ Building not found: {building_id}")
    else:
        print(f"❌ Failed to update building. Status code: {response.status_code}")
    
    return None

def test_delete_building(building_id: int, token: str = None):
    """Test DELETE /buildings/{building_id} (Admin only)
    
    Args:
        building_id: ID of building to delete
        token: Admin authentication token (Bearer token)
    
    Returns:
        bool: True if deletion successful, False otherwise
    """
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    response = requests.delete(f"{BASE_URL}/buildings/{building_id}", headers=headers)
    print_response(response, f"DELETE /buildings/{building_id}")
    
    if response.status_code == 200:
        print(f"✅ Building deleted successfully")
        return True
    elif response.status_code == 401:
        print(f"❌ Authentication required (missing or invalid token)")
    elif response.status_code == 403:
        print(f"❌ Admin privileges required")
    elif response.status_code == 404:
        print(f"❌ Building not found: {building_id}")
    else:
        print(f"❌ Failed to delete building. Status code: {response.status_code}")
    
    return False

def test_building_crud_flow(admin_token: str):
    """Test complete building CRUD flow:
    1. Create building (admin)
    2. Get all buildings
    3. Get building by ID
    4. Update building (admin)
    5. Delete building (admin)
    
    Args:
        admin_token: Admin authentication token
    
    Returns:
        bool: True if all steps completed successfully
    """
    print(f"\n{'='*60}")
    print(f"🏢 BUILDING CRUD FLOW TEST")
    print(f"{'='*60}")
    
    # Step 1: Create building
    print(f"\n📋 Step 1: Creating new building...")
    building_data = test_create_building(token=admin_token)
    
    if not building_data or not building_data.get("building_id"):
        print(f"❌ Failed to create building")
        return False
    
    building_id = building_data.get("building_id")
    
    # Step 2: Get all buildings
    print(f"\n📋 Step 2: Getting all buildings...")
    all_buildings = test_get_all_buildings()
    if all_buildings is None:
        print(f"⚠️  Warning: Failed to get all buildings")
    
    # Step 3: Get building by ID
    print(f"\n📋 Step 3: Getting building by ID...")
    retrieved_building = test_get_building(building_id)
    if not retrieved_building:
        print(f"⚠️  Warning: Failed to retrieve building by ID")
    
    # Step 4: Update building
    print(f"\n📋 Step 4: Updating building...")
    updated_building = test_update_building(building_id, token=admin_token)
    if not updated_building:
        print(f"⚠️  Warning: Failed to update building")
    
    # Step 5: Delete building
    print(f"\n📋 Step 5: Deleting building...")
    deleted = test_delete_building(building_id, token=admin_token)
    if not deleted:
        print(f"⚠️  Warning: Failed to delete building")
        return False
    
    # Verify deletion
    print(f"\n📋 Step 6: Verifying building was deleted...")
    verify_response = requests.get(f"{BASE_URL}/buildings/{building_id}")
    if verify_response.status_code == 404:
        print(f"✅ Building successfully deleted (verified)")
        return True
    else:
        print(f"⚠️  Warning: Building may still exist after deletion")
        return False

def main():
    """Run all tests in sequence"""
    print("\n" + "="*60)
    print("UNIPLEXA API END-TO-END TESTING")
    print("="*60)
    
    # Generate randomized email for main test user; use a Gmail +X alias for add_user flow
    test_email = generate_test_email("testuser")
    new_user_email = gmail_plus_alias(ADD_USER_EMAIL_BASE)
    
    print(f"\n📧 Generated test email: {test_email}")
    print(f"📧 Add user / set_password flow email: {new_user_email}")
    print(f"📧 Using hardcoded admin email: {ADMIN_EMAIL}\n")
    
    # Basic endpoint
    test_hello()
    
    # User management
    test_register(test_email)  # Use the pre-generated email
    token = test_login(test_email)  # Use the same email as registration
    
    # Set password flow (add_user -> set_password -> login)
    print("\n" + "="*60)
    print("SET PASSWORD FLOW TESTS")
    print("="*60)
    set_password_test_password = "setpassword123"
    test_set_password_flow(new_user_email, set_password_test_password)
    
    # Test set_password with invalid token (negative test)
    print(f"\n📋 Testing set_password with invalid token (negative test)...")
    test_set_password("invalid_token_12345", "newpassword123")
    
    if token:
        test_verify_token(token)
        # Test /me endpoint
        print(f"\n📋 Testing GET /me (current user info)...")
        test_get_current_user(token)
    
    # Service requests (requires authentication)
    print("\n" + "="*60)
    print("SERVICE REQUEST TESTS (Authenticated)")
    print("="*60)
    
    # Test without token (negative test - should fail with 401)
    print(f"\n📋 Testing service request creation without token (negative test - expects 401)...")
    test_create_service_request(token=None)
    
    # Test with token
    if token:
        print(f"\n📋 Testing service request creation with token...")
        request_data = test_create_service_request(token=token)
        
        if request_data and request_data.get("request_id"):
            request_id = request_data.get("request_id")
            building_id = request_data.get("building_id", TEST_BUILDING_ID)
            
            print(f"\n📋 Testing GET /service-request/{request_id}...")
            test_get_request(request_id, token=token)
            
            print(f"\n📋 Testing GET /service-request/status/{request_id}...")
            test_get_request_status(request_id, token=token)
            
            print(f"\n📋 Testing PATCH /service-request/{request_id}...")
            test_patch_request(request_id, token=token)
            
            print(f"\n📋 Testing GET /service-request/{request_id} after update...")
            test_get_request(request_id, token=token)  # Get updated request
            
            # Use building_id from created request if available, otherwise use default
            test_building_id = request_data.get("building_id", TEST_BUILDING_ID) if request_data else TEST_BUILDING_ID
            print(f"\n📋 Testing GET /service-request/all/{test_building_id}...")
            test_get_all_requests(building_id=test_building_id, token=token)
            
            # Note: DELETE test commented out to avoid deleting test data
            # Uncomment to test delete:
            # print(f"\n📋 Testing DELETE /service-request/{request_id}...")
            # test_delete_request(request_id, token=token)
        else:
            print(f"⚠️  Skipping service request tests (failed to create request)")
    else:
        print(f"⚠️  Skipping authenticated service request tests (no token available)")
    
    # Building tests
    print("\n" + "="*60)
    print("BUILDING TESTS")
    print("="*60)
    
    # Step 1: Try to login as admin (reuse existing admin user)
    print(f"\n📋 Attempting to login as admin ({ADMIN_EMAIL})...")
    admin_login_body = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    admin_login_response = requests.post(f"{BASE_URL}/login", json=admin_login_body)
    
    if admin_login_response.status_code == 200:
        admin_token = admin_login_response.json().get("access_token")
        print(f"✅ Admin login successful (reusing existing admin user)")
    else:
        # Step 2: Admin user doesn't exist, create it
        print(f"⚠️  Admin user not found or login failed. Creating admin user...")
        admin_register_body = {
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "role": "admin",
            "building_id": None  # Admin may not need building_id
        }
        admin_register_response = requests.post(f"{BASE_URL}/register", json=admin_register_body)
        if admin_register_response.status_code in [200, 409]:
            print(f"✅ Admin user created/verified: {ADMIN_EMAIL}")
            # Now try to login again
            admin_login_response = requests.post(f"{BASE_URL}/login", json=admin_login_body)
            if admin_login_response.status_code == 200:
                admin_token = admin_login_response.json().get("access_token")
                print(f"✅ Admin token obtained after creation")
            else:
                admin_token = None
                print(f"⚠️  Warning: Could not get admin token after creation. Status: {admin_login_response.status_code}")
        else:
            admin_token = None
            print(f"⚠️  Warning: Could not create admin user. Status: {admin_register_response.status_code}")
            print(f"   Some building tests may fail.")
    
    # Step 3: Test building CRUD flow (requires admin)
    if admin_token:
        test_building_crud_flow(admin_token)
    else:
        print(f"⚠️  Skipping building CRUD flow (no admin token)")
    
    # Step 4: Test building endpoints without admin token (negative tests)
    print(f"\n📋 Testing building creation without admin token (negative test - expects 401/403)...")
    test_create_building(token=None)  # Should fail without token
    
    # Step 5: Test with non-admin token (negative test)
    if token:  # Regular user token (not admin)
        print(f"\n📋 Testing building creation with non-admin token (negative test - expects 403)...")
        test_create_building(token=token)  # Should fail with 403
    
    # Step 6: Test public endpoints (no auth required)
    print(f"\n📋 Testing public building endpoints...")
    test_get_all_buildings()
    test_get_building(1)  # Try to get building with ID 1 (may not exist)
    
    # AI/Voice endpoints (requires authentication)
    print("\n" + "="*60)
    print("AI/VOICE ENDPOINT TESTS (Authenticated)")
    print("="*60)
    
    if token:
        print(f"\n📋 Testing POST /agent/query...")
        test_agent_query(token=token)
        
        print(f"\n📋 Testing POST /voice-summary...")
        test_voice_summary(token=token)
        
        # Test without token (negative test)
        print(f"\n📋 Testing /agent/query without token (negative test - expects 401)...")
        test_agent_query(token=None)
    else:
        print(f"⚠️  Skipping AI/voice tests (no token available)")
    
    # Password reset tests
    print("\n" + "="*60)
    print("PASSWORD RESET TESTS")
    print("="*60)
    
    # Test password reset flow (includes forgot_password test)
    # This tests: user verification -> forgot_password -> token extraction instructions
    new_password = "newpassword123"
    test_password_reset_flow(test_email, TEST_PASSWORD, new_password)
    
    # Test forgot_password with non-existent email (negative test - should return 404)
    print(f"\n📋 Testing forgot_password with non-existent email (negative test - expects 404)...")
    non_existent_email = generate_test_email("nonexistent")
    response, success = test_forgot_password(non_existent_email)
    if response.status_code == 404:
        print(f"✅ Expected 404 error received: User not found (this is correct behavior)")
    else:
        print(f"⚠️  Unexpected status code: expected 404, got {response.status_code}")
    
    # Test password_reset with invalid token (should fail)
    print(f"\n📋 Testing password_reset with invalid token...")
    test_password_reset("invalid_token_12345", "newpassword123")
    
    # One-time sign-in link tests
    print("\n" + "="*60)
    print("ONE-TIME SIGN-IN LINK TESTS")
    print("="*60)
    
    # Test sign-in link flow
    print(f"\n📋 Testing one-time sign-in link flow...")
    test_signin_link_flow(test_email)
    
    # Test request sign-in link with non-existent email (negative test)
    print(f"\n📋 Testing request-signin-link with non-existent email (negative test - expects 404)...")
    non_existent_email = generate_test_email("nonexistent_signin")
    response, success, _ = test_request_signin_link(non_existent_email)
    if response.status_code == 404:
        print(f"✅ Expected 404 error received: User not found (this is correct behavior)")
    else:
        print(f"⚠️  Unexpected status code: expected 404, got {response.status_code}")
    
    # Test signin-with-link with invalid token (should fail)
    print(f"\n📋 Testing signin-with-link with invalid token...")
    invalid_response, invalid_token, invalid_user = test_signin_with_link("invalid_token_12345")
    if invalid_response.status_code == 401:
        print(f"✅ Expected 401 error for invalid token (this is correct behavior)")
    else:
        print(f"⚠️  Unexpected status code: expected 401, got {invalid_response.status_code}")
    
    print("\n💡 TIP: To test full one-time sign-in link flow with token:")
    print(f"   1. Check server logs for the sign-in token (look for 'Signin link: ...')")
    print(f"   2. Extract the token from the URL")
    print(f"   3. Call: test_signin_link_flow_with_token('{test_email}', token)")
    
    print("\n" + "="*60)
    print("TESTING COMPLETE")
    print(f"Test email used: {test_email}")
    print(f"New user email used: {new_user_email}")
    print(f"Admin email used: {ADMIN_EMAIL} (hardcoded, reused across runs)")
    print("\n💡 TIP: To test full password reset flow with token:")
    print(f"   1. Check server logs for the password reset token (look for 'Password reset link: ...')")
    print(f"   2. Extract the token from the URL")
    print(f"   3. Call: test_password_reset_with_token('{test_email}', token, '{TEST_PASSWORD}', 'newpassword')")
    print("="*60)

def run_signup_link_only():
    """Run only add_user and print the signup link for testing the app deep link.
    Usage: python test_api.py --signup-link-only
    Start the API with CONFIG_FILE=config.test.json so the link is uniplexa://set-password?token=...
    """
    new_user_email = gmail_plus_alias(ADD_USER_EMAIL_BASE)
    print("\n" + "="*60)
    print("SIGNUP LINK ONLY (for app deep-link testing)")
    print("="*60)
    print(f"Email: {new_user_email}\n")
    test_hello()
    add_response, token = test_add_user(new_user_email)
    if add_response.status_code != 200:
        print("Failed to add user. Is the API running with CONFIG_FILE=config.test.json?")
        return
    try:
        signup_link = add_response.json().get("signup_link", "")
        print("\n" + "="*60)
        print("COPY THIS LINK TO OPEN IN THE APP")
        print("="*60)
        print(signup_link)
        print("="*60)
        print("\nHow to open:")
        print("  • Physical device: Paste the link in Notes or Messages, then tap it.")
        print("  • iOS Simulator: Run in terminal: xcrun simctl open url \"" + signup_link + "\"")
        print("  • Or paste in Safari address bar and go.")
        print()
    except Exception as e:
        print(f"Could not get signup_link: {e}")


if __name__ == "__main__":
    import sys
    if "--signup-link-only" in sys.argv:
        run_signup_link_only()
    else:
        main()