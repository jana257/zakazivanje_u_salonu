import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SalonBook</Text>
      <Text style={styles.subtitle}>
        {isLogin ? "Prijavi se na svoj nalog" : "Napravi novi nalog"}
      </Text>

      {!isLogin && (
        <TextInput style={styles.input} placeholder="Ime i prezime" />
      )}

      <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" />

      <TextInput style={styles.input} placeholder="Lozinka" secureTextEntry />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          {isLogin ? "Prijavi se" : "Registruj se"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.switchText}>
          {isLogin
            ? "Nemaš nalog? Registruj se"
            : "Imaš nalog? Prijavi se"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7F1",
    justifyContent: "center",
    padding: 24,
  },
  logo: {
    fontSize: 38,
    fontWeight: "800",
    color: "#2B2B2B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#C97B63",
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
  },
  switchText: {
    marginTop: 22,
    textAlign: "center",
    color: "#C97B63",
    fontWeight: "600",
  },
});