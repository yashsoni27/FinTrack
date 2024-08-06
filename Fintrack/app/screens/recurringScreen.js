import { StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useTheme } from "../context/themeContext";
import DefaultText from "../components/defaultText";
import { getRecurringTransactionsDb } from "../../api/db";
import { AuthContext } from "../context/auth";
import { PieChart } from "react-native-gifted-charts";

const RecurringScreen = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  const [amount, setAmount] = useState({ paid: 0, unpaid: 0 });

  const userId = state.user.userId;

  const getRecurringDb = async () => {
    try {
      const response = await getRecurringTransactionsDb(userId);      
      const subscriptions = response.outflowStreams.filter(
        (stream) => stream.category[0] === "Service"
        // && stream.category[1] === "Subscription"
      );
      // console.log("subs:  ", subscriptions.length);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

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

      const totalToPay = subscriptions.reduce((acc, transaction) => {
        return acc + Number(transaction.averageAmount.amount);
      }, 0);
      // console.log("totalToPay:  ", totalToPay);

      const paidTotal = paidTransactions.reduce((acc, transaction) => {
        return acc + Number(transaction.averageAmount.amount);
      }, 0);
      // console.log("paidTotal", paidTotal);

      const unpaidTotal = totalToPay - paidTotal;
      // console.log("unpaidTotal", unpaidTotal);

      setAmount({ paid: paidTotal, unpaid: unpaidTotal });
    } catch (error) {
      console.log("Error in fetching recurring DB: ", error);
    }
  };

  const pieData = [
    { value: amount.paid, color: "#177AD5" },
    { value: amount.unpaid, color: "#79D2DE" },
  ];

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
      <View style={{ margin: 10 }}>
        <View
          style={{
            margin: 20,
            borderColor: "#000",
            borderWidth: 1,
            padding: 10,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "column", justifyContent: "space-between"}}>
            <DefaultText style={{ fontSize: 20 }}>£ {amount.unpaid.toFixed(2)}</DefaultText>
            <DefaultText >
              left to pay
            </DefaultText>
          </View>
          <View style={{paddingVertical: 20, alignItems: "center"}}>
            <PieChart
              data={pieData}
              donut
              // showGradient
              sectionAutoFocus
              // focusOnPress
              semiCircle
              radius={70}
              innerRadius={50}
              innerCircleColor={"#000"}
              // centerLabelComponent={() => {
              //   return (
              //     <View
              //       style={{ justifyContent: "center", alignItems: "center" }}
              //     >
              //       <Text
              //         style={{
              //           fontSize: 22,
              //           color: "white",
              //           fontWeight: "bold",
              //         }}
              //       >
              //         47%
              //       </Text>
              //     </View>
              //   );
              // }}
            />
          </View>
          <View style={{ flexDirection: "column", justifyContent: "space-between"}}>
            <DefaultText style={{ fontSize: 20 }}>£ {amount.paid.toFixed(2)}</DefaultText>
            <DefaultText >
              paid so far
            </DefaultText>
          </View>
        </View>

        <View style={{margin: 20}}>
          <Text>THIS MONTH</Text>
          <View>
            <DefaultText>card stack</DefaultText>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RecurringScreen;

const styles = StyleSheet.create({});
