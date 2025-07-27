import asyncio
import os
from io import BytesIO

import websockets
from pydub import AudioSegment

from config.config import config

AUDIO_DIR = os.path.join(config.base_dir, "audio")
audio_path = os.path.join(AUDIO_DIR, "LG-turbowash-audio.mp3")
    

async def send_audio():
    uri = "ws://192.168.1.154:8000/ws"  # Replace with your WebSocket server URL

    # Convert MP3 to WAV in memory
    mp3_audio = AudioSegment.from_file(audio_path, format="mp3")
    wav_buffer = BytesIO()
    mp3_audio.export(wav_buffer, format="wav")
    wav_buffer.seek(0)

    # Open the WebSocket connection
    async with websockets.connect(uri) as websocket:
        print("Connected to WebSocket")

        # Send WAV data in chunks
        chunk_size = 4096
        while chunk := wav_buffer.read(chunk_size):
            await websocket.send(chunk)
            print(f"Sent chunk of size: {len(chunk)} bytes")
            await asyncio.sleep(0.1)  # Simulate real-time streaming

        print("Finished sending audio")

# Run the script
asyncio.run(send_audio())