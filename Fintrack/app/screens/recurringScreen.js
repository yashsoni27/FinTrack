import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTheme } from "../context/themeContext";
import DefaultText from "../components/defaultText";
import { getRecurringTransactionsDb } from "../../api/db";
import { AuthContext } from "../context/auth";
// import { PieChart } from "react-native-gifted-charts";
import CircularProgress from "react-native-circular-progress-indicator";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { getRecurringTransactions } from "../../api/plaidAPI";

const RecurringScreen = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  const [amount, setAmount] = useState({
    paid: 0,
    unpaid: 0,
    totalToPay: 0,
    percent: 0,
  });
  const [subscription, setSubscription] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const styles = createStyles(theme);
  const userId = state.user.userId;

  const getRecurring = async () => {
    try {
      setRefreshing(true);
      const response = await getRecurringTransactions(userId);
      // console.log("recurring: ", response);
      const subscriptions = response.outflowStreams.filter(
        (stream) => stream.category[0] === "Service"
        // && stream.category[1] === "Subscription"
      );
      // console.log("Subscriptions: ", subscriptions);
      console.log("subscriptions Plaid");
      getRecurringDb();
    } catch (error) {
      console.log("Error in fetching recurring: ", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getRecurringDb = async () => {
    try {
      const response = await getRecurringTransactionsDb(userId);
      const subscriptions = response.outflowStreams.filter(
        (stream) => stream.category[0] === "Service"
        // && stream.category[1] === "Subscription"
      );
      // console.log("subs: ", subscriptions);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // const upcomingTransactions = [];
      // const paidTransactions = [];
      // const overdueTransactions = [];

      subscriptions.forEach((transaction) => {
        const lastTransactionDate = new Date(transaction.lastDate);

        if (
          lastTransactionDate.toISOString() < today.toISOString() &&
          lastTransactionDate.getMonth() === today.getMonth()
        ) {
          transaction.paidThisMonth = true;
          // paidTransactions.push(transaction);
        }

        lastTransactionDate.setMonth(lastTransactionDate.getMonth() + 1);

        if (lastTransactionDate.getMonth() === today.getMonth()) {
          if (lastTransactionDate.toISOString() >= today.toISOString()) {
            transaction.paidThisMonth = false;
            // upcomingTransactions.push(transaction);
          } else {
            transaction.paidThisMonth = false;
            // overdueTransactions.push(transaction);
          }
        }
      });

      // console.log("upcomingTransactions: ", upcomingTransactions.length);
      // console.log("paidTransactions: ", paidTransactions.length);
      // console.log("overdueTransactions: ", overdueTransactions.length);

      const totalToPay = subscriptions
        .reduce((acc, transaction) => {
          return acc + Number(transaction.averageAmount.amount);
        }, 0)
        .toFixed(2);
      // console.log("totalToPay: ", totalToPay);

      const paidTotal = subscriptions.reduce((acc, transaction) => {
        if (transaction.paidThisMonth) {
          return acc + Number(transaction.averageAmount.amount);
        } else {
          return acc;
        }
      }, 0);
      // console.log("paidTotal: ", paidTotal);
      const unpaidTotal = totalToPay - paidTotal;

      setAmount({
        paid: Math.round(paidTotal * 100) / 100,
        unpaid: Math.round(unpaidTotal * 100) / 100,
        totalToPay: Math.round(totalToPay * 100) / 100,
        // maxValue: Math.round((amount.paid / amount.totalToPay) * 100)
        percent: Math.round((paidTotal / totalToPay) * 100),
      });
      setSubscription(subscriptions);
      console.log("recurring DB");
      console.log("amount- ", amount);
    } catch (error) {
      console.log("Error in fetching recurring DB: ", error);
    }
  };

  const onRefresh = useCallback(() => {
    getRecurring();
  }, []);

  useEffect(() => {
    getRecurringDb();
  }, []);

  return (
    <ScrollView
      style={{
        // padding: 10,
        backgroundColor: theme.background,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View>
        <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
          Recurrings
        </DefaultText>
      </View>

      <View style={{}}>
        <View
          style={{
            margin: 15,
            borderWidth: 1,
            borderRadius: 10,
            backgroundColor: theme.surface,
            borderColor: theme.text2,
            paddingVertical: 10,
            paddingHorizontal: 20,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View style={[styles.amountContainer, { alignItems: "flex-start" }]}>
            <DefaultText style={{ fontSize: 20 }}>
              <DefaultText style={{ fontSize: 14 }}>£</DefaultText>{" "}
              {amount.unpaid}
            </DefaultText>
            <DefaultText>left to pay</DefaultText>
          </View>
          <View style={{ paddingVertical: 20, alignItems: "center" }}>
            {/* <PieChart
              data={pieData}
              donut
              sectionAutoFocus              
              radius={40}
              innerRadius={25}
              innerCircleColor={theme.background}
            /> */}
            <CircularProgress
              radius={40}
              value={amount.percent}
              duration={1000}
              activeStrokeWidth={10}
              activeStrokeColor={theme.primary}
              inActiveStrokeWidth={15}
              inActiveStrokeColor={theme.text2}
              showProgressValue={false}
            />
          </View>
          <View style={styles.amountContainer}>
            <DefaultText style={{ fontSize: 20 }}>
              <DefaultText style={{ fontSize: 14 }}>£</DefaultText>{" "}
              {amount.paid}
            </DefaultText>
            <DefaultText>paid so far</DefaultText>
          </View>
        </View>

        <View style={{ margin: 20 }}>
          <DefaultText>THIS MONTH</DefaultText>
          <View>
            <View style={styles.subscriptionContainer}>
              {subscription
                .sort(
                  (a, b) =>
                    new Date(a.lastDate).getDate() -
                    new Date(b.lastDate).getDate()
                )
                .map((item, index) => (
                  <View key={index} style={styles.subscriptionCard}>
                    {item.paidThisMonth && (
                      <View style={styles.paidIndicator}>
                        <FontAwesome5Icon
                          name="check"
                          size={10}
                          color="white"
                        />
                      </View>
                    )}
                    <DefaultText
                      style={styles.cardTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.merchantName ? item.merchantName : item.description}
                    </DefaultText>
                    <DefaultText style={styles.cardAmount}>
                      £ {item.averageAmount.amount}
                    </DefaultText>
                    <DefaultText style={styles.cardDate}>
                      {new Date(item.lastDate).getDate() == 1
                        ? `${new Date(item.lastDate).getDate()}st`
                        : new Date(item.lastDate).getDate() == 2
                        ? `${new Date(item.lastDate).getDate()}nd`
                        : new Date(item.lastDate).getDate() == 3
                        ? `${new Date(item.lastDate).getDate()}rd`
                        : `${new Date(item.lastDate).getDate()}th`}
                    </DefaultText>
                  </View>
                ))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default RecurringScreen;

const createStyles = (theme) => {
  return StyleSheet.create({
    amountContainer: {
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "flex-end",
      width: "25%",
    },
    subscriptionContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingVertical: 10,
      flex:1,
    },
    subscriptionCard: {
      width: "30%",
      height: 100,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: theme.secondary,
      backgroundColor: theme.surface,
      margin: 3,
      padding: 3,
      justifyContent: "center",
      alignItems: "center",
    },
    cardTitle: {
      // color: "#fff",
      color: theme.text,
      fontSize: 15,
      textTransform: "capitalize",
      textAlign: "center",
    },
    cardAmount: {
      // color: "#fff",
      color: theme.text,
      fontSize: 14,
    },
    cardDate: {
      // color: "#a1a1a1",
      color: theme.text,
      opacity: 0.6,
      fontSize: 12,
    },
    paidIndicator: {
      width: 20,
      height: 20,
      position: "absolute",
      backgroundColor: "green",
      top: -1,
      right: -1,
      borderTopRightRadius: 5,
      justifyContent: "center",
      alignItems: "center",
    },
  });
};
