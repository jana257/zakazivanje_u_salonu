import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
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

const vremena = ["10:00", "12:00", "14:00", "16:00", "18:00"];

export default function ZakaziScreen() {
  const { usluga } = useLocalSearchParams();

  const [datum, setDatum] = useState("");
  const [vreme, setVreme] = useState("");

  const potvrdiTermin = async () => {
    if (!datum || !vreme) {
      Alert.alert("Greška", "Izaberi datum i vreme termina.");
      return;
    }

    const noviTermin = {
      id: Date.now().toString(),
      usluga: String(usluga),
      datum,
      vreme,
    };

    const sacuvani = await AsyncStorage.getItem("termini");

    const termini = sacuvani ? JSON.parse(sacuvani) : [];

    const zauzetTermin = termini.find(
      (termin: any) =>
        termin.datum === datum && termin.vreme === vreme
    );

    if (zauzetTermin) {
      Alert.alert(
        "Termin je zauzet",
        "Izaberi drugi datum ili vreme."
      );

      return;
    }

    termini.push(noviTermin);

    await AsyncStorage.setItem(
      "termini",
      JSON.stringify(termini)
    );

    router.push("/moji-termini");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>Zakazivanje</Text>

      <Text style={styles.label}>Izabrana usluga:</Text>

      <Text style={styles.service}>{usluga}</Text>

      <Text style={styles.label}>Izaberi datum:</Text>

      {datumi.map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.option,
            datum === item && styles.selected,
          ]}
          onPress={() => setDatum(item)}
        >
          <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Izaberi vreme:</Text>

      {vremena.map((item) => (
        <TouchableOpacity
          key={item}
          style={[
            styles.option,
            vreme === item && styles.selected,
          ]}
          onPress={() => setVreme(item)}
        >
          <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={potvrdiTermin}
      >
        <Text style={styles.buttonText}>
          Potvrdi termin
        </Text>
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

  content: {
    paddingBottom: 100,
  },

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

  service: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E2A27",
    marginBottom: 10,
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