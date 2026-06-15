import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function HomeScreen() {
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
      <Text style={styles.title}>The Hair Studio</Text>

      <Text style={styles.subtitle}>Dobrodošla</Text>

      {/* jedno zakzivanje */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/zakazi")}
      >
        <Text style={styles.buttonText}>Zakaži termin</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={() => router.push("/moji-termini")}
      >
        <Text style={styles.buttonSecondaryText}>Moji termini</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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

  button: {
    backgroundColor: "#B88A7B",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },

  buttonSecondary: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#B88A7B",
  },
  buttonSecondaryText: {
    color: "#B88A7B",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },

  logoutButton: {
    marginTop: 16,
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