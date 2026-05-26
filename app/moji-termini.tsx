import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function MojiTerminiScreen() {
  const [termini, setTermini] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const ucitajTermine = async () => {
        const sacuvani = await AsyncStorage.getItem("termini");
        setTermini(sacuvani ? JSON.parse(sacuvani) : []);
      };

      ucitajTermine();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moji termini</Text>

      <FlatList
        data={termini}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.usluga}>{item.usluga}</Text>
            <Text style={styles.text}>Datum: {item.datum}</Text>
            <Text style={styles.text}>Vreme: {item.vreme}</Text>
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
    padding: 24,
    paddingTop: 70,
    backgroundColor: "#F8F5F2",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 24,
    color: "#2E2A27",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },
  usluga: {
    fontSize: 21,
    fontWeight: "800",
    color: "#2E2A27",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: "#8A817C",
  },
  empty: {
    fontSize: 16,
    color: "#8A817C",
  },
});