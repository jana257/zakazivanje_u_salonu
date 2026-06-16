import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://192.168.8.8:3000";

type Termin = {
  id: number;
  userId: number;
  services: string;
  date: string;
  time: string;
};

/* =========================
   HELPER - PROŠLI TERMINI
========================= */
const isPastDate = (dateStr:any) => {
  const today = new Date().toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const [d1, m1, y1] = dateStr.split(".");
  const [d2, m2, y2] = today.split(".");

  const date1 = new Date(`${y1}-${m1}-${d1}`);
  const date2 = new Date(`${y2}-${m2}-${d2}`);

  return date1 < date2;
};

export default function MojiTerminiScreen() {
  const [termini, setTermini] = useState<Termin[]>([]);
  
  const ucitajTermine = async () => {
    const user = await AsyncStorage.getItem("user");
    const parsed = user ? JSON.parse(user) : null;

    if (!parsed?.userId) return;

    try {
      const res = await fetch(
        `${API_URL}/appointments/${parsed.userId}`
      );

      const data = await res.json();

      setTermini(data.appointments || []);
    } catch (err) {
      console.log(err);
      setTermini([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      ucitajTermine();
    }, [])
  );

  const obrisiTermin = async (id: any, date: any) => {
    const today = new Date().toLocaleDateString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    if (date === today) {
      Alert.alert("Greška", "Ne možeš otkazati termin na isti dan.");
      return;
    }

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

 const izmeniTermin = (item: Termin) => {
  const today = new Date().toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (item.date === today) {
    Alert.alert("Greška", "Ne možeš menjati termin na isti dan.");
    return;
  }

  router.push({
    pathname: "/select-time",
    params: {
      appointmentId: item.id,
      date: item.date,
      services: item.services,
    },
  });
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moji termini</Text>

      {termini.length === 0 ? (
        <Text style={styles.empty}>Nema zakazanih termina</Text>
      ) : (
        <FlatList
          data={termini}
          keyExtractor={(item: Termin) => item.id.toString()}
          renderItem={({ item }: { item: Termin }) => {
            const expired = isPastDate(item.date);

            return (
              <View
                style={[
                  styles.card,
                  expired && styles.expiredCard,
                ]}
              >
                <Text
                  style={[
                    styles.usluga,
                    expired && styles.expiredText,
                  ]}
                >
                  {item.services}
                </Text>

                <View style={styles.row}>
                  <Text
                    style={[
                      styles.text,
                      expired && styles.expiredText,
                    ]}
                  >
                    📅 {item.date}
                  </Text>

                  <Text
                    style={[
                      styles.text,
                      expired && styles.expiredText,
                    ]}
                  >
                    🕒 {item.time}
                  </Text>
                </View>

                {expired ? (
                  <Text style={styles.pastLabel}>
                    ✔ Završeni termin
                  </Text>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() =>
                        obrisiTermin(item.id, item.date)
                      }
                    >
                      <Text style={styles.deleteText}>
                        Otkaži termin
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => izmeniTermin(item)}
                    >
                      <Text style={styles.deleteText}>
                        Izmeni termin
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

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
  empty: {
    textAlign: "center",
    marginTop: 50,
    color: "#8A817C",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },
  usluga: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E2A27",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    color: "#8A817C",
    fontWeight: "600",
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: "#E57373",
    padding: 12,
    borderRadius: 14,
  },
  editButton: {
    marginTop: 10,
    backgroundColor: "#6C8EBF",
    padding: 12,
    borderRadius: 14,
  },
  deleteText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
  },

  expiredCard: {
    backgroundColor: "#EDEDED",
    opacity: 0.7,
  },
  expiredText: {
    color: "#A0A0A0",
  },
  pastLabel: {
    marginTop: 10,
    textAlign: "center",
    color: "#6B6B6B",
    fontWeight: "700",
  },
});