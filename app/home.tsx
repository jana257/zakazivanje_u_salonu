import { router } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function HomeScreen() {
  // 🔥 ZAŠTITA RUTE (auth guard)
  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("user");

      if (!user) {
        router.replace("/");
      }
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Studio Kat</Text>

      <Text style={styles.subtitle}>Dobrodošla 👋 Izaberi uslugu</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/zakazi?usluga=Šišanje")}
      >
        <Text style={styles.cardTitle}>Šišanje</Text>
        <Text style={styles.cardText}>Kratka, srednja i duga kosa</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/zakazi?usluga=Feniranje")}
      >
        <Text style={styles.cardTitle}>Feniranje</Text>
        <Text style={styles.cardText}>Ravno, talasi, volumen</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/zakazi?usluga=Farbanje")}
      >
        <Text style={styles.cardTitle}>Farbanje</Text>
        <Text style={styles.cardText}>Izrastak, cela dužina, pramenovi</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push("/zakazi?usluga=Svečane frizure")}
      >
        <Text style={styles.cardTitle}>Svečane frizure</Text>
        <Text style={styles.cardText}>Lokne, punđe i posebne prilike</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/moji-termini")}
      >
        <Text style={styles.buttonText}>Moji termini</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Odjavi se</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5F2",
    paddingHorizontal: 24,
    paddingTop: 70,
  },
  content: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2E2A27",
  },
  subtitle: {
    fontSize: 16,
    color: "#8A817C",
    marginTop: 8,
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 22,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#2E2A27",
  },
  cardText: {
    fontSize: 15,
    color: "#8A817C",
  },
  button: {
    backgroundColor: "#B88A7B",
    padding: 18,
    borderRadius: 18,
    marginTop: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },
  logoutButton: {
    marginTop: 16,
    marginBottom: 80,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#B88A7B",
    backgroundColor: "#FFFFFF",
  },
  logoutText: {
    textAlign: "center",
    color: "#B88A7B",
    fontSize: 16,
    fontWeight: "700",
  },
});