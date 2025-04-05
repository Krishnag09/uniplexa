# src/auth/utils.py

import os

from datetime import datetime

import openai
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")




def display_menu():
    print("\n What would you like to do?")
    print("1. Log a service request")
    print("2. Check the status of a service request")
    print("3. Book an amenity")
    print("4. Access a document")
    print("5. Look up a policy")
    choice = input("Enter your choice: ")
    return choice

def add_context_from_menu(choice):
    if choice == "1":
        return "Describe the issue you are experiencing"
    elif choice == "2":
        return "What was the service request about?"
    elif choice == "3":
        return "What amenity would you like to book?"
    elif choice == "4":
        return "What document would you like to access?"
    elif choice == "5":
        return "What policy would you like to look up?"
    else:
        return "Invalid choice. Please try again."

def summarize_request(request_text):
    res = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are an assistant that summarizes text into a concise description of less than 25 words.",
            },
            {"role": "user", "content": f"Summarize the following request: {request_text}"},
        ],
    )
    summary_text = res.choices[0].message.content
    print(f"Summary: {res.choices[0].message.content}")
    print(res.choices[0].message.content)
    
    return summary_text

def detect_category(request_text):
    res = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are an assistant that categorizes text into one of the following categories: service request, amenity booking, document access, policy lookup.",
            },
            {"role": "user", "content": f"Detect the category of the following request: {request_text}"},
        ],
    )
    category = res.choices[0].message.content
    print(f"Category: {res.choices[0].message.content}")
    return category

def get_date_time():
    now = datetime.now()
    current_date = now.date()  # Returns a `date` object
    current_time = now.time()  # Returns a `time` object
    # current_time = current_time.strftime("%H:%M:%S")
    return {"date": current_date, "time": current_time}