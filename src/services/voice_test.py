import os

import openai
from dotenv import load_dotenv
from openai import OpenAI
import base64
import requests
from src.utils.utils import  detect_category , get_date_time, summarize_request

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI()

url = "https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav"
response = requests.get(url)
response.raise_for_status()
wav_data = response.content
encoded_string = base64.b64encode(wav_data).decode('utf-8')

path = "/Users/krishnagaurav/uniplexa/app/src/audio/LG-turbowash-audio.mp3"

def consume_local_audio(path):
    encoded__audio = base64.b64encode(open(path, "rb").read()).decode('utf-8')
    return encoded__audio

def consume_audio_api_local():
        
        completion = client.chat.completions.create(
            model="gpt-4o-audio-preview",
            modalities=["text", "audio"],
            audio={"voice": "alloy", "format": "mp3"},
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
                                "data": consume_local_audio(path),
                                "format": "mp3"
                            }
                        }
                    ]
                },
            ]
        )
        
        message = completion.choices[0].message.audio.transcript
        retry_count = 0

        try:
            title = summarize_request(message)
            category = detect_category(message)
            date_time = get_date_time()
            date = date_time["date"]
            time = date_time["time"]
            return {"request_title": title, "request_category": category, "request_date": date, "request_time": time, "request_desc": message}
        except Exception as e:
            print(e)
            if retry_count < 3:
                retry_count += 1
                return consume_audio_api_local()
            else:
                return {
                    "retry": "false",
                    "error_code": "PROCESSING_ERROR",
                    "error_message": "An error occurred while processing your request. Please try again later."
                }

        # front end to have retry message and button

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
    
    message2 = completion.choices[0].message.audio.transcript

    return message2

