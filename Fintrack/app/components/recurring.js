import { StyleSheet, TouchableOpacity, View, ScrollView } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import DefaultText from "./defaultText";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";
import { getRecurringTransactionsDb } from "../../api/db";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const Recurring = () => {
  const navigation = useNavigation();
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  const [recurringTransactions, setRecurringTransactions] = useState([]);

  const options = {
    weekday: "short",
    month: "short",
    day: "numeric",
  };
  const userId = state.user.userId;

  const getRecurringDb = async () => {
    try {
      const response = await getRecurringTransactionsDb(userId);
      const subscriptions = response.outflowStreams.filter(
        (stream) => stream.category[0] === "Service"
        // && stream.category[1] === "Subscription"
      );

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

      setRecurringTransactions(recurring);
      // console.log("recurring: ", recurring);
    } catch (error) {
      console.log("Error in fetching recurring DB: ", error);
    }
  };

  useEffect(() => {
    getRecurringDb();
  }, []);

  return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate("Recurring")}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <DefaultText style={{color: theme.text2}}>UPCOMING</DefaultText>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <DefaultText>recurrings </DefaultText>
            <MaterialIcons
              style={{}}
              name="chevron-right"
              size={15}
              color={theme.text}
            />
          </View>
        </View>
      </TouchableOpacity>
      <View style={{marginTop: 10}}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            {recurringTransactions.slice(0, 3).map((item, index) => {
              const date = new Date(item.lastDate);
              date.setMonth(date.getMonth() + 1);
              return (
                <View key={index} style={{ marginHorizontal: 5, width: 150 }}>
                  <View>
                    <DefaultText>
                      {new Intl.DateTimeFormat("en-US", options).format(date)}
                    </DefaultText>
                  </View>
                  <View
                    style={{
                      backgroundColor: theme.surface,
                      padding: 15,
                      borderRadius: 10,
                      marginTop: 5,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <DefaultText
                      style={{
                        textTransform: "capitalize",
                        width: 80,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.merchantName ? item.merchantName : item.description}
                    </DefaultText>
                    <DefaultText style={{fontWeight: "bold"}}>   £ {item.averageAmount.amount}</DefaultText>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

export default Recurring;

const styles = StyleSheet.create({});
