import os

import openai
from dotenv import load_dotenv
from openai import OpenAI
import base64
import requests
import json

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI()

url = "https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode('utf-8')

def consume_voice_api():
    completion = client.chat.completions.create(
        model="gpt-4o-audio-preview",
        modalities=["text", "audio"],
        audio={"voice": "alloy", "format": "wav"},
        messages=[
            {
                "role": "user",
                "content": [
                    { 
                        "type": "text",
                        "text": "What is in this recording?"
                    },
                    {
                        "type": "input_audio",
                        "input_audio": {
                            "data": encoded_string,
                            "format": "wav"
                        }
                    }
                ]
            },
        ]
    )
    
    message1 = completion.choices[0].message.content
    message2 = completion.choices[0].message.audio.transcript

    return message2

