import base64
import io
import os

import openai
import speech_recognition as sr
from dotenv import load_dotenv
from fastapi import WebSocket
from openai import OpenAI
from pydub import AudioSegment

from config.config import config
from utils.utils import detect_category, get_date_time, summarize_request

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI()


AUDIO_DIR = os.path.join(config.base_dir, "audio")
audio_path = os.path.join(AUDIO_DIR, "LG-turbowash-audio.mp3")

# currently consuming audio from local file
recognizer = sr.Recognizer()

def convert_audio_to_wav(audio_path):
    # Input MP3 file path
    mp3_path = audio_path

    # Output WAV file path
    wav_path = os.path.splitext(mp3_path)[0] + ".wav"
    # Convert MP3 to WAV
    audio = AudioSegment.from_file(mp3_path, format="mp3")
    audio.export(wav_path, format="wav")

    return wav_path


def consume_local_audio(audio_wav_path):
    # print ("Audio path: ", audio_wav_path)
    # Convert the audio file to WAV format
    wav_audio= convert_audio_to_wav(audio_wav_path)
    # with sr.AudioFile(output_path) as source:
    #     audio_wav_path = recognizer.record(source)
    # # Save the AudioData object to a WAV file
    # with open(output_path, "wb") as f:
    #     f.write(audio_wav_path).get_wav_data()  # Extract raw WAV data from AudioData

    # Encode the saved WAV file in Base64
    with open(wav_audio, "rb") as f:
        encoded_audio = base64.b64encode(f.read()).decode("utf-8")

    return encoded_audio

# acts as the main function for the audio to text conversion

def audio_to_text(audio_path):
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
                            "data": consume_local_audio(audio_path),
                            "format": "wav"
                        }
                    }
                ]
            },
        ]
    )
    
    message = completion.choices[0].message.audio.transcript
    return message



def summarize_message(text):
    retry_count = 0
    try:
        title = summarize_request(text)
        category = detect_category(text)
        date_time = get_date_time()
        date = date_time["date"]
        time = date_time["time"]
        return {"request_title": title, "request_category": category, "request_date": date, "request_time": time, "request_desc": text, "request_status": "pending"}
    except Exception as e:
        print(e)
        if retry_count < 3:
            retry_count += 1
            return consume_local_audio()
        else:
            return {
                "retry": "false",
                "error_code": "PROCESSING_ERROR",
                "error_message": "An error occurred while processing your request. Please try again later."
            }

async def websocket_audio(websocket: WebSocket):
    """
    Receives streaming audio from a mobile app via WebSockets and transcribes it in real time.
    """
    await websocket.accept()  # Accept WebSocket connection
    recognizer = sr.Recognizer()

    while True:
        try:
            # Receive raw audio data as bytes
            audio_chunk = await websocket.receive_bytes()

            # Convert bytes into an in-memory audio file
            audio_file = io.BytesIO(audio_chunk)

            with sr.AudioFile(audio_file) as source:
                audio = recognizer.record(source)  # Process the chunk

            # Convert speech to text
            transcript = audio_to_text(audio)

            # Send the transcript back to the mobile app
            await websocket.send_text(transcript)

        except Exception as e:
            await websocket.send_text(f"Error: {str(e)}")
