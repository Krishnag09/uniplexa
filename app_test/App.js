import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For mic icon

const WEBSOCKET_URL = "ws://your-websocket-server-url"; // Replace with your WebSocket server URL

export default function App() {
  const [isMicActive, setIsMicActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const ws = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      setConnectionStatus("Connected");
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (e) => {
      console.log("Message from server:", e.data);
      // You can process incoming messages here
    };

    ws.current.onerror = (e) => {
      console.error("WebSocket error:", e.message);
      setConnectionStatus("Error");
    };

    ws.current.onclose = () => {
      setConnectionStatus("Disconnected");
      console.log("WebSocket disconnected");
    };

    // Cleanup on unmount
    return () => {
      ws.current.close();
    };
  }, []);

  // Handle mic button toggle
  const toggleMic = () => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      Alert.alert("WebSocket not connected", "Please wait for connection.");
      return;
    }

    setIsMicActive((prev) => {
      const newState = !prev;

      if (newState) {
        ws.current.send(JSON.stringify({ event: "mic_on" }));
        console.log("Mic activated");
      } else {
        ws.current.send(JSON.stringify({ event: "mic_off" }));
        console.log("Mic deactivated");
      }

      return newState;
    });
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
        {isMicActive ? "Mic is Active 🎤" : "Tap mic to activate"}
      </Text>
    </View>
  );
}

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
