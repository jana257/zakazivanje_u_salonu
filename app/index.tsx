import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://172.20.10.2:3000";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  async function handleSubmit() {
    try {
      /* =========================
         BASIC VALIDACIJE
      ========================= */
      if (!email || !password) {
        Alert.alert("Greška", "Unesite email i lozinku.");
        return;
      }

      if (!email.includes("@")) {
        Alert.alert("Greška", "Unesite ispravan email.");
        return;
      }

      if (password.length < 6) {
        Alert.alert("Greška", "Lozinka mora imati najmanje 6 karaktera.");
        return;
      }

      /* =========================
         LOGIN
      ========================= */
      if (isLogin) {
        const res = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            Alert.alert("Greška", "Nalog ne postoji ili lozinka nije tačna.");
          } else {
            Alert.alert("Greška", data?.message || "Došlo je do greške.");
          }
          return;
        }

        // 🔥 KLJUČNO - čuvamo user-a
        await AsyncStorage.setItem(
          "user",
          JSON.stringify({
            userId: data.userId,
            email,
          })
        );

        Alert.alert("Uspeh", "Uspešno ste prijavljeni.");

        // 🔥 prebacivanje na home
        router.replace("/home");
      }

      /* =========================
         REGISTER
      ========================= */
      else {
        if (!fullName || !phone || !repeatPassword) {
          Alert.alert("Greška", "Popunite sva polja za registraciju.");
          return;
        }

        if (password !== repeatPassword) {
          Alert.alert("Greška", "Lozinke se ne poklapaju.");
          return;
        }

        const res = await fetch(`${API_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          Alert.alert("Greška", data?.message || "Greška pri registraciji.");
          return;
        }

        Alert.alert("Uspešno ste se registrovali.");
        setIsLogin(true);
      }
    } catch {
      Alert.alert("Greška", "Server nije dostupan.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.logo}>Studio Kat</Text>

          <Text style={styles.subtitle}>
            {isLogin ? "Prijavi se na svoj nalog" : "Kreiraj svoj nalog"}
          </Text>

          {!isLogin && (
            <>
              <Text style={styles.label}>Ime i prezime</Text>
              <TextInput
                style={styles.input}
                placeholder="Unesi ime i prezime"
                placeholderTextColor="#8A817C"
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.label}>Broj telefona</Text>
              <TextInput
                style={styles.input}
                placeholder="Unesi broj telefona"
                placeholderTextColor="#8A817C"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Unesi email adresu"
            placeholderTextColor="#8A817C"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Lozinka</Text>
          <TextInput
            style={styles.input}
            placeholder="Unesi lozinku"
            placeholderTextColor="#8A817C"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {!isLogin && (
            <>
              <Text style={styles.label}>Ponovi lozinku</Text>
              <TextInput
                style={styles.input}
                placeholder="Ponovi lozinku"
                placeholderTextColor="#8A817C"
                secureTextEntry
                value={repeatPassword}
                onChangeText={setRepeatPassword}
              />
            </>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {isLogin ? "Prijavi se" : "Registruj se"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin
                ? "Nemaš nalog? Registruj se"
                : "Već imaš nalog? Prijavi se"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* =========================
   STYLES (NE DIRAMO DIZAJN)
========================= */
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F5F2",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
  },

  logo: {
    fontSize: 38,
    fontWeight: "900",
    color: "#2E2A27",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#8A817C",
    textAlign: "center",
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E2A27",
    marginBottom: 6,
    marginLeft: 4,
  },

  input: {
    backgroundColor: "#F8F5F2",
    padding: 15,
    borderRadius: 16,
    marginBottom: 14,
    fontSize: 16,
    color: "#2E2A27",
  },

  button: {
    backgroundColor: "#B88A7B",
    padding: 17,
    borderRadius: 17,
    marginTop: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "800",
  },

  switchText: {
    marginTop: 22,
    textAlign: "center",
    color: "#B88A7B",
    fontWeight: "700",
  },
});