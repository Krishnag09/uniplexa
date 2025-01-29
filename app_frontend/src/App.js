import React, { useState, useRef } from "react";

function App() {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [message, setMessage] = useState("");

  // Use a ref to store mediaRecorder so it persists between renders
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  const handleMicClick = async () => {
    if (recording) {
      // Stop recording
      mediaRecorderRef.current?.stop(); // Stop the recorder
      setRecording(false);
      setMessage("Processing...");
      return;
    }

    try {
      // Request access to the user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Initialize MediaRecorder and store it in the ref
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Start recording
      mediaRecorder.start();
      setRecording(true);
      setMessage("Listening...");

      // Collect audio chunks
      audioChunks.current = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      // On recording stop, combine chunks and send to backend
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
        setAudioUrl(URL.createObjectURL(audioBlob)); // Optional playback
        await sendAudioToBackend(audioBlob);
        setMessage("Audio processed successfully!");
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setMessage("Error accessing microphone");
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob);

    try {
      const response = await fetch("http://localhost:8000/api/process-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      const result = await response.json();
      console.log("Response from server:", result);
    } catch (error) {
      console.error("Error sending audio:", error);
      setMessage("Error sending audio");
    }
  };

  return (
    <div className="app">
      <div className="content">
        <h1 className="prompt">What would you like to do today?</h1>
        <div
          className={`mic-container ${recording ? "recording" : ""}`}
          onClick={handleMicClick}
        >
          <span className="mic-icon">🎤</span>
        </div>
        <p className="status-message">{message}</p>
        {audioUrl && (
          <div className="audio-playback">
            <h3>Recorded Audio:</h3>
            <audio src={audioUrl} controls></audio>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
