import { Text, View } from "react-native";

import styles from "../styles";

export default function ReviewDetails({ route }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{route.params.title}</Text>
      <Text style={styles.text}>{route.params.body}</Text>
      <Text style={styles.text}>{route.params.rating}</Text>
    </View>
  );
}
