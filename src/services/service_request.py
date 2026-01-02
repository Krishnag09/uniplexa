# src/auth/service.py

import os

import openai
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session


load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI()




def basic_query(db: Session, query: str):
    return db.execute(query).fetchall()

def open_ai_query():
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {
                "role": "user",
                "content": "Write a haiku about recursion in programming."
            }
        ]
    )

    print(completion.choices[0].message)
    
def open_ai_query_with_agent(query: str):
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role":"agent", "content": "what would you like me to do?"},
            {
                "role": "user",
                "content": query
            }
        ]
        
    )

    return completion.choices[0].message

