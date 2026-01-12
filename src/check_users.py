#!/usr/bin/env python3
"""Script to check all users in the database and add new users"""

import sys
import argparse
from common.database import SessionLocal
from models.models import UserModel
from models.enums import UserRole
from services.signup import get_password_hash

def check_users():
    db = SessionLocal()
    try:
        users = db.query(UserModel).all()
        
        if not users:
            print("No users found in the database.")
            return
        
        print(f"\n{'='*80}")
        print(f"Found {len(users)} user(s) in the database:")
        print(f"{'='*80}\n")
        
        for user in users:
            print(f"📧 Email:    {user.email}")
            print(f"🆔 ID:       {user.id}")
            print(f"👤 Role:     {user.role}")
            print(f"🏢 Building: {user.building_id if user.building_id else 'None'}")
            if user.password:
                print(f"🔒 Password: Set (hashed - cannot display original)")
            else:
                print(f"🔒 Password: Not set yet")
            print(f"{'-'*80}\n")
            
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        db.close()

def add_user(email: str, password: str, role: str = "renter", building_id: int = None):
    """Add a new user to the database"""
    db = SessionLocal()
    try:
        # Normalize email
        email_norm = email.strip().lower()
        
        # Validate email
        if not email_norm or "@" not in email_norm:
            print("❌ Error: Invalid email address")
            return False
        
        # Validate password length
        if len(password) < 8:
            print("❌ Error: Password must be at least 8 characters long")
            return False
        
        # Validate role
        try:
            user_role = UserRole(role.lower())
        except ValueError:
            print(f"❌ Error: Invalid role. Must be one of: {', '.join([r.value for r in UserRole])}")
            return False
        
        # Check if user already exists
        existing_user = db.query(UserModel).filter(UserModel.email == email_norm).first()
        if existing_user:
            print(f"❌ Error: User with email '{email_norm}' already exists (ID: {existing_user.id})")
            return False
        
        # Hash password
        hashed_password = get_password_hash(password)
        
        # Create new user
        new_user = UserModel(
            email=email_norm,
            password=hashed_password,
            role=user_role,
            building_id=building_id
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"\n{'='*80}")
        print(f"✅ SUCCESSFULLY CREATED USER")
        print(f"{'='*80}")
        print(f"\n📋 LOGIN CREDENTIALS (use these to test login):")
        print(f"{'─'*80}")
        print(f"   Email:    {new_user.email}")
        print(f"   Password: {password}")
        print(f"{'─'*80}")
        print(f"\n📝 User Details:")
        print(f"   ID:           {new_user.id}")
        print(f"   Role:         {new_user.role}")
        print(f"   Building ID:  {new_user.building_id if new_user.building_id else 'None'}")
        print(f"{'='*80}\n")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating user: {e}")
        return False
    finally:
        db.close()

def create_test_user():
    """Create a quick test user with default credentials"""
    test_email = "test@example.com"
    test_password = "testpass123"
    test_role = "renter"
    
    print(f"\n🧪 Creating test user with default credentials...\n")
    success = add_user(test_email, test_password, test_role)
    
    if success:
        print(f"💡 Tip: You can also create custom users with:")
        print(f"   python3 check_users.py add --email 'your@email.com' --password 'yourpassword' --role 'renter'\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Manage users in the database",
        epilog="""
Examples:
  python3 check_users.py                    # List all users (default)
  python3 check_users.py list                # List all users
  python3 check_users.py test                # Create a test user (test@example.com / testpass123)
  python3 check_users.py add --email "user@example.com" --password "password123"
  python3 check_users.py add --email "admin@example.com" --password "admin123" --role "admin"
        """,
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("action", nargs="?", default="list", choices=["list", "add", "test"], 
                       help="Action: 'list' to show users (default), 'add' to create a user, 'test' to create a test user")
    
    # Arguments for adding a user
    parser.add_argument("--email", type=str, help="Email address for the new user (required for 'add')")
    parser.add_argument("--password", type=str, help="Password for the new user (required for 'add')")
    parser.add_argument("--role", type=str, default="renter", choices=["renter", "manager", "admin"], 
                       help="Role for the new user (default: renter)")
    parser.add_argument("--building-id", type=int, default=None, 
                       help="Building ID for the new user (optional)")
    
    args = parser.parse_args()
    
    if args.action == "list":
        check_users()
    elif args.action == "test":
        create_test_user()
    elif args.action == "add":
        if not args.email or not args.password:
            print("❌ Error: --email and --password are required when adding a user")
            print("\nUsage:")
            print("  python3 check_users.py add --email 'user@example.com' --password 'password123'")
            sys.exit(1)
        add_user(args.email, args.password, args.role, args.building_id)

