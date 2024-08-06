import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect } from "react";
import { useTheme } from "../context/themeContext";
import DefaultText from "../components/defaultText";
import { getRecurringTransactionsDb } from "../../api/db";
import { AuthContext } from "../context/auth";

const RecurringScreen = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();

  const userId = state.user.userId;

  const getRecurringDb = async () => {
    try {
      const response = await getRecurringTransactionsDb(userId);
      // console.log("recurring DB success");
      const subscriptions = response.outflowStreams.filter(
        (stream) => stream.category[0] === "Service"
        // && stream.category[1] === "Subscription"
      );
      console.log("subs:  ", subscriptions.length);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const totalToPay = subscriptions.reduce((acc, transaction) => {
        return acc + Number(transaction.averageAmount.amount);
      }, 0);

      console.log("totalToPay:  ", totalToPay);

      const upcomingTransactions = [];
      const paidTransactions = [];
      const overdueTransactions = [];

      subscriptions.forEach((transaction) => {
        const lastTransactionDate = new Date(transaction.lastDate);

        if (
          lastTransactionDate.toISOString() < today.toISOString() &&
          lastTransactionDate.getMonth() === today.getMonth()
        ) {
          paidTransactions.push(transaction);          
        }

        lastTransactionDate.setMonth(lastTransactionDate.getMonth() + 1);

        if (lastTransactionDate.getMonth() === today.getMonth()) {
          if (lastTransactionDate.toISOString() >= today.toISOString()) {
            upcomingTransactions.push(transaction);
          } else {
            overdueTransactions.push(transaction);
          }
        }
      });

      console.log("upcomingTransactions: ", upcomingTransactions.length);
      console.log("paidTransactions: ", paidTransactions.length);
      console.log("overdueTransactions: ", overdueTransactions.length);

    } catch (error) {
      console.log("Error in fetching recurring DB: ", error);
    }
  };

  useEffect(() => {
    // getRecurring();
    getRecurringDb();
  }, []);

  return (
    <View
      style={{
        padding: 10,
        backgroundColor: theme.background,
      }}
    >
      <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
        Recurring Screen
      </DefaultText>
      <View style={{ margin: 10 }}></View>
    </View>
  );
};

export default RecurringScreen;

const styles = StyleSheet.create({});
