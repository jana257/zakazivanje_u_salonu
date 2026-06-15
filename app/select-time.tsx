import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://172.20.10.2:3000";

const slots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function SelectTime() {
  const params = useLocalSearchParams();

  const appointmentId = params.appointmentId;
  const date = params.date;
  const services = params.services;

  const [occupied, setOccupied] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOccupied = async () => {
    try {
      const res = await fetch(
        `${API_URL}/appointments/occupied/${date}`
      );

      const data = await res.json();
      setOccupied(data.occupied || []);
    } catch (e) {
      console.log(e);
      setOccupied([]);
    }
  };

  useEffect(() => {
    loadOccupied();
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
          services,
          date,
          time,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Greška", data.message || "Termin zauzet");
        return;
      }

      Alert.alert("Uspeh", "Termin izmenjen");
      router.back();
    } catch (e) {
      Alert.alert("Greška", "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Izaberi novi termin</Text>
      <Text style={styles.subtitle}>📅 {String(date)}</Text>

      <View style={styles.grid}>
        {slots.map((t) => {
          const isTaken = occupied.includes(t);

          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.slot,
                isTaken && styles.disabledSlot,
              ]}
              disabled={isTaken || loading}
              onPress={() => update(t)}
            >
              <Text
                style={[
                  styles.slotText,
                  isTaken && styles.disabledText,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
  disabledSlot: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  disabledText: {
    color: "#666",
  },
});