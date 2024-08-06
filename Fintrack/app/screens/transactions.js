import { View, SafeAreaView, Text } from "react-native";
import React, { useContext, useEffect } from "react";
import FooterList from "../components/footer/footerList";
import { AuthContext } from "../context/auth";
import { getRecurringTransactions } from "../../api/plaidAPI";
import { getRecurringTransactionsDb } from "../../api/db";
import DefaultText from "../components/defaultText";

const Transactions = () => {
  const [state, setState] = useContext(AuthContext);

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
      // console.log("recurring DB: ", response);
      console.log("recurring DB success");
    } catch (error) {
      console.log("Error in fetching recurring DB: ", error);
    }
  };

  useEffect(() => {
    // getRecurring();
    getRecurringDb();
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, alignItems: "center" }}
    >
      <View>
        <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
          Transactions Screen
        </DefaultText>
      </View>
      <View>
        <View>
          <DefaultText>Recurring Transactions</DefaultText>
        </View>
        <View></View>
      </View>
      <FooterList />
    </SafeAreaView>
  );
};

export default Transactions;
