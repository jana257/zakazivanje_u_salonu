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
import api from "../api/client";

export default function MojiTerminiScreen() {
  const [termini, setTermini] = useState<any[]>([]);

  const ucitajTermine = async () => {
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) {
      setTermini([]);
      return;
    }

    const response = await api.get(`/appointments/${userId}`);

    setTermini(response.data);
  };

  useFocusEffect(
    useCallback(() => {
      ucitajTermine();
    }, [])
  );

  const obrisiTermin = async (id: number) => {
    Alert.alert(
      "Otkaži termin",
      "Da li ste sigurni da želite da otkažete termin?",
      [
        {
          text: "Ne",
          style: "cancel",
        },
        {
          text: "Da",
          onPress: async () => {
            await api.delete(`/appointments/${id}`);
            ucitajTermine();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moji termini</Text>

      <FlatList
        data={termini}
        keyExtractor={(item) => String(item.id)}
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
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nemate zakazane termine.</Text>
        }
      />
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

  empty: {
    fontSize: 16,
    color: "#8A817C",
  },
});