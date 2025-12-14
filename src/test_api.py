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
def test_create_service_request(desc: str = None):
    """Test POST /service-request
    
    Args:
        desc: Optional description text. If not provided, uses a default test description.
    
    Returns:
        dict: Response data with request_id and all request fields, or None if failed
    """
    if desc is None:
        desc = "The washing machine in unit 3B is leaking water all over the floor. It started this morning and the water is spreading to the hallway."
    
    body = {
        "desc": desc
    }
    response = requests.post(f"{BASE_URL}/service-request", json=body)
    print_response(response, "POST /service-request")
    
    # Validate response
    if response.status_code == 200:
        request_data = response.json()
        
        # Verify all required fields from ServiceRequest schema are present
        # According to schemas.ServiceRequest, these are the required fields:
        required_fields = [
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
        print(f"   Title: {request_data.get('request_title')}")
        print(f"   Category: {request_data.get('request_category')}")
        print(f"   Status: {request_data.get('request_status')}")
        
        return request_data  # Return full response data
    else:
        print(f"❌ Failed to create service request. Status code: {response.status_code}")
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
    """Test PATCH /service-request/{request_id}"""
    body = {
        "request_status": "in_progress"  # Must match RequestStatus enum: pending, in_progress, completed, cancelled
    }
    response = requests.patch(
        f"{BASE_URL}/service-request/{request_id}", 
        json=body,
        headers={"Content-Type": "application/json"}
    )
    print_response(response, f"PATCH /service-request/{request_id}")
    
    # Print detailed error if 422
    if response.status_code == 422:
        print(f"\n⚠️  Validation Error Details:")
        try:
            error_detail = response.json()
            print(json.dumps(error_detail, indent=2))
        except:
            print(f"Raw response: {response.text}")
    
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
    
    # Service requests
    request_data = test_create_service_request()
    
    if request_data and request_data.get("request_id"):
        request_id = request_data.get("request_id")
        test_get_request(request_id)
        test_get_request_status(request_id)
        test_patch_request(request_id)
        test_get_request(request_id)  # Get updated request
    
    # test_get_all_requests()
    
    # # Other endpoints
    # test_agent_query()
    # test_voice_summary()
    
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
    
    print("\n" + "="*60)
    print("TESTING COMPLETE")
    print(f"Test email used: {test_email}")
    print(f"New user email used: {new_user_email}")
    print("\n💡 TIP: To test full password reset flow with token:")
    print(f"   1. Check server logs for the password reset token (look for 'Password reset link: ...')")
    print(f"   2. Extract the token from the URL")
    print(f"   3. Call: test_password_reset_with_token('{test_email}', token, '{TEST_PASSWORD}', 'newpassword')")
    print("="*60)

if __name__ == "__main__":
    main()