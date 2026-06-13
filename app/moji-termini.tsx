import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://172.20.10.2:3000";

export default function MojiTerminiScreen() {
  const [termini, setTermini] = useState<any[]>([]);

  const ucitajTermine = async () => {
    const user = await AsyncStorage.getItem("user");
    const parsed = user ? JSON.parse(user) : null;

    const res = await fetch(
      `${API_URL}/appointments/${parsed.userId}`
    );

    const data = await res.json();
    setTermini(data);
  };

  useFocusEffect(
    useCallback(() => {
      ucitajTermine();
    }, [])
  );

  const obrisiTermin = async (id: string) => {
    Alert.alert("Otkaži termin", "Da li ste sigurni?", [
      { text: "Ne", style: "cancel" },
      {
        text: "Da",
        onPress: async () => {
          await fetch(`${API_URL}/appointments/${id}`, {
            method: "DELETE",
          });

          ucitajTermine();
        },
      },
    ]);
  };

  // ✅ DODATO - IZMENA TERMINA
  const izmeniTermin = async (item: any) => {
    Alert.prompt(
      "Izmena termina",
      "Unesi novo vreme (npr 14:00)",
      async (novoVreme) => {
        if (!novoVreme) return;

        const res = await fetch(
          `${API_URL}/appointments/${item.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              service: item.service,
              date: item.date,
              time: novoVreme,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          Alert.alert("Greška", data.message);
          return;
        }

        ucitajTermine();
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moji termini</Text>

      <FlatList
        data={termini}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.usluga}>{item.service}</Text>
            <Text style={styles.text}>Datum: {item.date}</Text>
            <Text style={styles.text}>Vreme: {item.time}</Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => obrisiTermin(item.id)}
            >
              <Text style={styles.deleteText}>Otkaži termin</Text>
            </TouchableOpacity>

            {/* ✅ DODATO DUGME */}
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: "#6C8EBF" }]}
              onPress={() => izmeniTermin(item)}
            >
              <Text style={styles.deleteText}>Izmeni termin</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

/* styles OSTAJU ISTI */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5F2",
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2E2A27",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },
  usluga: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2E2A27",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#8A817C",
    marginBottom: 4,
  },
  deleteButton: {
    marginTop: 14,
    backgroundColor: "#E57373",
    padding: 12,
    borderRadius: 14,
  },
  deleteText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
});