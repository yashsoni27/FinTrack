import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
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
  const [recurringTransactions, setRecurringTransactions] = useState([]);

  const userId = state.user.userId;

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
      const subscriptions = response.outflowStreams.filter(
        (stream) => stream.category[0] === "Service"
        // && stream.category[1] === "Subscription"
      );
      // console.log("subs:  ", subscriptions);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const recurring = subscriptions
        .filter((transaction) => {
          const nextTransactionDate = new Date(transaction.lastDate);
          nextTransactionDate.setMonth(nextTransactionDate.getMonth() + 1);
          return (
            nextTransactionDate.getMonth() === today.getMonth() &&
            nextTransactionDate.toISOString() >= today.toISOString()
          );
        })
        .sort((a, b) => {
          const dateA = new Date(a.lastDate);
          const dateB = new Date(b.lastDate);

          // Move to the next month
          dateA.setMonth(dateA.getMonth() + 1);
          dateB.setMonth(dateB.getMonth() + 1);

          return dateA - dateB; // Sort by the next transaction date
        });

      console.log("recurring: ", recurring);
      setRecurringTransactions(recurring);
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
        <DefaultText>Testing card stack</DefaultText>
      </View>
    </View>
  );
};

export default Recurring;

const styles = StyleSheet.create({});
