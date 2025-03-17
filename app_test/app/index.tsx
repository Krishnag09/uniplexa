import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For mic icon
import { Audio } from "expo-av";

const WEBSOCKET_URL = "ws://192.168.1.154:8000/ws"; // Replace with your WebSocket server URL

const WebSocketComponent = () => {
  const [isMicActive, setIsMicActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [silenceTimer, setSilenceTimer] = useState(null);
  const ws = useRef<WebSocket | null>(null);
  const recording = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      setConnectionStatus("Connected");
    };

    ws.current.onmessage = (e) => {
      console.log("Message from server:", e.data);
    };

    ws.current.onerror = (e) => {
      console.error("WebSocket error:", e.message);
      setConnectionStatus("Error");
      Alert.alert(
        "WebSocket error",
        "An error occurred with the WebSocket connection."
      );
    };

    ws.current.onclose = () => {
      setConnectionStatus("Disconnected");
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const startRecording = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      allowsMetering: true,
    });

    const { recording: rec } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    rec.setOnRecordingStatusUpdate((status) => {
      if (!status.canMeasureSilence) return;
      const rms = status.metering;
      if (rms < -50) {
        if (!silenceTimer) {
          const timer = setTimeout(() => autoStopMic(), 1500);
          setSilenceTimer(timer);
        }
      } else {
        if (silenceTimer) {
          clearTimeout(silenceTimer);
          setSilenceTimer(null);
        }
      }
    });

    recording.current = rec;
    setIsMicActive(true);
    ws.current?.send(JSON.stringify({ event: "mic_on" }));
  };

  const stopRecording = async () => {
    if (recording.current) {
      await recording.current.stopAndUnloadAsync();
      recording.current = null;
    }
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
    ws.current?.send(JSON.stringify({ event: "mic_off" }));
    setIsMicActive(false);
  };

  const toggleMic = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      Alert.alert("WebSocket not connected", "Please wait for connection.");
      return;
    }
    isMicActive ? stopRecording() : startRecording();
  };

  const autoStopMic = () => {
    console.log("Silence detected. Auto-stopping mic.");
    stopRecording();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WebSocket Mic Integration 🎙️</Text>
      <Text style={styles.status}>WebSocket Status: {connectionStatus}</Text>

      <TouchableOpacity style={styles.micButton} onPress={toggleMic}>
        <Ionicons
          name={isMicActive ? "mic" : "mic-off"}
          size={80}
          color={isMicActive ? "red" : "gray"}
        />
      </TouchableOpacity>

      <Text style={styles.instruction}>
        {isMicActive
          ? "Mic is Active 🎤 (Auto-stop enabled)"
          : "Tap mic to activate"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 30,
  },
  micButton: {
    marginBottom: 20,
  },
  instruction: {
    fontSize: 18,
    color: "#555",
  },
});

export default WebSocketComponent;
