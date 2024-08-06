import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect } from "react";
import DefaultText from "./defaultText";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";
import { getRecurringTransactionsDb } from "../../api/db";
import { getRecurringTransactions } from "../../api/plaidAPI";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";

const Recurring = () => {
  const navigation = useNavigation();
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();

  const userId = state.user.userId;
  // const currentMonth = new Date().getMonth();
  // console.log("currentMonth: ", currentMonth);

  const getRecurring = async () => {
    try {
      const response = await getRecurringTransactions(userId);
      // console.log("recurring: ", response);
      const subscriptions = response.outflowStreams.filter(
        (stream) => stream.category[0] === "Service"
        // && stream.category[1] === "Subscription"
      );
      // console.log("Subscriptions: ", subscriptions);
    } catch (error) {
      console.log("Error in fetching recurring: ", error);
    }
  };

  const getRecurringDb = async () => {
    try {
      const response = await getRecurringTransactionsDb(userId);
      // console.log("recurring DB: ", response);
      // console.log("recurring DB success");
      const subscriptions = response.outflowStreams.filter(
        (stream) => stream.category[0] === "Service"
        // && stream.category[1] === "Subscription"
      );
      // console.log("subs:  ", subscriptions);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // console.log("today: ", today.toISOString());
      // console.log("oldDate: ", subscriptions[0].lastDate);
      // const newDate = new Date(subscriptions[0].lastDate);
      // newDate.setMonth(newDate.getMonth() + 1)
      // console.log("newDate: ", newDate.toISOString());

      const upcomingTransactions = subscriptions.filter((transaction) => {
        const nextTransactionDate = new Date(transaction.lastDate);
        nextTransactionDate.setMonth(nextTransactionDate.getMonth() + 1);
        return (
          nextTransactionDate.getMonth() === today.getMonth() &&
          nextTransactionDate.toISOString() >= today.toISOString()
        );
      });
      console.log("upcomingTransactions: ", upcomingTransactions.length);
    } catch (error) {
      console.log("Error in fetching recurring DB: ", error);
    }
  };

  useEffect(() => {
    // getRecurring();
    getRecurringDb();
  }, []);

  return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate("Recurring")}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <DefaultText>Recurring</DefaultText>
          <FontAwesome5Icon style={{}} name="angle-right" size={20} color="" />
        </View>
      </TouchableOpacity>
      <View>
        <Text>Testing card stack</Text>
      </View>
    </View>
  );
};

export default Recurring;

const styles = StyleSheet.create({});
