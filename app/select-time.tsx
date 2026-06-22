import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://192.168.1.65:3000";

export default function SelectTime() {
  const params = useLocalSearchParams();

  const appointmentId = params.appointmentId;
  const date = String(params.date || "");
  const services = String(params.services || "");

  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAvailableTimes = async () => {
    try {
      const res = await fetch(`${API_URL}/available-times/${date}`);
      const data = await res.json();

      setAvailableTimes(data || []);
    } catch (e) {
      console.log(e);
      setAvailableTimes([]);
    }
  };

  useEffect(() => {
    if (date) {
      loadAvailableTimes();
    }
  }, [date]);

  const update = async (time: string) => {
    if (!appointmentId) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service: services,
          date,
          time,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Greška", data.message || "Termin je zauzet.");
        return;
      }

      if (Platform.OS === "web") {
        window.alert("Termin je uspešno izmenjen.");
        router.replace("/home");
      } else {
        Alert.alert("Uspeh", "Termin je uspešno izmenjen.", [
          {
            text: "OK",
            onPress: () => router.replace("/home"),
          },
        ]);
      }
    } catch (e) {
      Alert.alert("Greška", "Server nije dostupan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Izaberi novi termin</Text>
      <Text style={styles.subtitle}>📅 {date}</Text>

      {availableTimes.length === 0 && (
        <Text style={styles.noTimes}>Nema slobodnih termina za ovaj datum.</Text>
      )}

      <View style={styles.grid}>
        {availableTimes.map((t) => (
          <TouchableOpacity
            key={t}
            style={styles.slot}
            disabled={loading}
            onPress={() => update(t)}
          >
            <Text style={styles.slotText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F5F2",
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
    color: "#2E2A27",
  },
  subtitle: {
    marginBottom: 20,
    color: "#666",
    fontWeight: "600",
  },
  noTimes: {
    color: "#8A817C",
    fontSize: 15,
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slot: {
    backgroundColor: "#B88A7B",
    padding: 15,
    borderRadius: 12,
    width: "30%",
    marginBottom: 10,
  },
  slotText: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },
});