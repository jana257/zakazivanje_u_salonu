import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Studio Kat</Text>

      <Text style={styles.subtitle}>
        Dobrodošla 👋 Izaberi uslugu
      </Text>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>💇‍♀️ Šišanje</Text>
        <Text style={styles.cardText}>
          Kratka, srednja i duga kosa
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>🌸 Feniranje</Text>
        <Text style={styles.cardText}>
          Ravno, talasi, volumen
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>🎨 Farbanje</Text>
        <Text style={styles.cardText}>
          Izrastak, cela dužina, pramenovi
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card}>
        <Text style={styles.cardTitle}>✨ Svečane frizure</Text>
        <Text style={styles.cardText}>
          Lokne, punđe i posebne prilike
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Moji termini</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.logoutText}>Odjavi se</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F1",
    padding: 24,
    paddingTop: 70,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2B2B2B",
  },

  subtitle: {
    fontSize: 16,
    color: "#777",
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
    color: "#2B2B2B",
  },

  cardText: {
    fontSize: 15,
    color: "#777",
  },

  button: {
    backgroundColor: "#C97B63",
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
    marginBottom: 50,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C97B63",
  },

  logoutText: {
    textAlign: "center",
    color: "#C97B63",
    fontSize: 16,
    fontWeight: "700",
  },
});