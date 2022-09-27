import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

import styles from "../styles";

export default function Home({ navigation }) {
  const [reviews, setReviews] = useState([
    {
      title: "Hello, World",
      body: "djb sjbgsjbjjsb sbdj bsj",
      rating: 2,
      key: 1,
    },
    {
      title: "The One Thing",
      body: "djb sjbgsjbjjsb sbdj bsj",
      rating: 3,
      key: 2,
    },
    {
      title: "The Pilgrim's Progress",
      body: "djb sjbgsjbjjsb sbdj bsj",
      rating: 4,
      key: 3,
    },
  ]);

  const seeDetails = (item) => navigation.push("ReviewDetails", item);

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => seeDetails(item)}>
            <Text>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
