import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

function napraviDatume() {
  const datumi = [];

  for (let i = 0; i < 7; i++) {
    const datum = new Date();
    datum.setDate(datum.getDate() + i);

    const formatiranDatum = datum.toLocaleDateString("sr-RS", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    datumi.push(formatiranDatum);
  }

  return datumi;
}

const datumi = napraviDatume();

const API_URL = "http://192.168.8.8:3000";

export default function ZakaziScreen() {
  const [datum, setDatum] = useState("");
  const [vreme, setVreme] = useState("");
  const [usluge, setUsluge] = useState<string[]>([]);
  const [vremena, setVremena] = useState<string[]>([]);

  useEffect(() => {
    if (!datum) return;

    fetch(`${API_URL}/available-times/${datum}`)
      .then((res) => res.json())
      .then((data) => {
        setVremena(data);
        setVreme("");
      })
      .catch(() => {
        Alert.alert("Greška", "Ne mogu da učitam slobodne termine.");
      });
  }, [datum]);

  const toggleUsluga = (naziv: string) => {
    if (usluge.includes(naziv)) {
      setUsluge(usluge.filter((u) => u !== naziv));
    } else {
      setUsluge([...usluge, naziv]);
    }
  };

  const potvrdiTermin = async () => {
    if (!datum || !vreme || usluge.length === 0) {
      Alert.alert("Greška", "Izaberi usluge, datum i vreme termina.");
      return;
    }

    try {
      const user = await AsyncStorage.getItem("user");
      const parsed = user ? JSON.parse(user) : null;

      const res = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parsed?.userId,
          service: usluge.join(", "),
          date: datum,
          time: vreme,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Greška", data.message);
        return;
      }
      Alert.alert("Uspešno", "Termin je uspešno zakazan.", [
        {
          text: "OK",
          onPress: () => {
            setDatum("");
            setVreme("");
            setUsluge([]);
            setVremena([]);
            router.replace("/home");
          },
        },
      ]);

    } catch (error) {
      Alert.alert("Greška", "Server nije dostupan.");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Zakazivanje</Text>

      <Text style={styles.label}>Izaberi usluge:</Text>

      {["Šišanje", "Feniranje", "Farbanje", "Svečana frizura"].map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.option, usluge.includes(item) && styles.selected]}
          onPress={() => toggleUsluga(item)}
        >
          <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Izaberi datum:</Text>

      {datumi.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.option, datum === item && styles.selected]}
          onPress={() => setDatum(item)}
        >
          <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Izaberi vreme:</Text>

      {datum && vremena.length === 0 && (
        <Text style={styles.noTimes}>Nema slobodnih termina za ovaj datum.</Text>
      )}

      {vremena.map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.option, vreme === item && styles.selected]}
          onPress={() => setVreme(item)}
        >
          <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.button} onPress={potvrdiTermin}>
        <Text style={styles.buttonText}>Potvrdi termin</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5F2",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  content: { paddingBottom: 100 },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2E2A27",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#8A817C",
    marginTop: 10,
    marginBottom: 8,
  },
  option: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  selected: {
    borderColor: "#B88A7B",
    backgroundColor: "#F1DFD9",
  },
  optionText: {
    fontSize: 16,
    color: "#2E2A27",
    fontWeight: "600",
  },
  noTimes: {
    color: "#8A817C",
    fontSize: 15,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#B88A7B",
    padding: 18,
    borderRadius: 18,
    marginTop: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },
});