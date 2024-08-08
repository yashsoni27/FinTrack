import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FooterList from "../components/footer/footerList";
import { AuthContext } from "../context/auth";
import { getTransactionsDb } from "../../api/db";
import DefaultText from "../components/defaultText";
import { useTheme } from "../context/themeContext";
import { useNavigation } from "@react-navigation/native";

const Transactions = () => {
  const [state, setState] = useContext(AuthContext);
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const screenWidth = Dimensions.get("window").width;

  const userId = state.user.userId;

  const fetchTransactionsDB = async () => {
    try {
      // const response = await getTransactionsDb(userId, (count = 3));
      const response = await getTransactionsDb(userId);
      // console.log("Transactions fetched from DB: ", response);
      console.log("Transactions fetched from DB");
      setTransactions(response.transactions);
      
    } catch (error) {
      console.log("Error in fetching transactions: ", error);
    }
  };

  const groupTransactionsByDate = (transactions) => {
    return transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toISOString().split("T")[0];

      if (!acc[date]) {
        acc[date] = [];
      }

      acc[date].push(transaction);

      return acc;
    }, {});
  };

  useEffect(() => {
    fetchTransactionsDB();
  }, []);

  useEffect(() => {
    const grouped = groupTransactionsByDate(transactions);
    setGroupedTransactions(grouped);
  }, [transactions]);


  return (
    <>
      <ScrollView
        style={{
          // padding: 10,
          backgroundColor: theme.background,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
            Transactions
          </DefaultText>
        </View>

        <View
          style={{
            marginTop: 20,
            margin: 10,
            padding: 10,
            borderColor: "#000",
            borderWidth: 1,
          }}
        >
          <View style={{ marginVertical: 10 }}>
            <DefaultText style={{fontSize: 20}}>History</DefaultText>
          </View>          

          <View>
            {Object.keys(groupedTransactions).map((date) => (
              <View key={date} style={{ marginVertical: 10 }}>
                <DefaultText style={{fontSize: 15, fontWeight: "bold"}}>{date}</DefaultText>
                {groupedTransactions[date].map((transaction) => (
                  <View key={transaction._id} style={{ marginVertical: 3 }}>
                    <DefaultText>{transaction.name}</DefaultText>
                    <DefaultText>{transaction.amount}</DefaultText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 100, backgroundColor: "grey" }}></View>
      </ScrollView>

      <View style={{ position: "absolute", bottom: 90, right: 20 }}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            // Handle FAB press
            console.log("FAB pressed");
            navigation.navigate("Add");
          }}
        >
          <Text style={{ color: "#fff", fontSize: 24 }}>+</Text>
        </TouchableOpacity>
      </View>

      <FooterList />
    </>
  );
};

const styles = StyleSheet.create({
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#ff5722", // FAB color
    justifyContent: "center",
    alignItems: "center",
    // position: "absolute",
    // bottom: 0,
    // right: 0,
  },
});

export default Transactions;
