import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FooterList from "../components/footer/footerList";
import { AuthContext } from "../context/auth";
import { getTransactionsDb } from "../../api/db";
import DefaultText from "../components/defaultText";
import { useTheme } from "../context/themeContext";

const Transactions = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);

  const userId = state.user.userId;

  const fetchTransactionsDB = async () => {
    try {
      // setLoading(true);
      // const response = await getTransactionsDb(userId, (count = 3));
      const response = await getTransactionsDb(userId);
      console.log("Transactions fetched from DB: ", response);
      // console.log("Transactions fetched from DB");
      setTransactions(response.transactions);
      // setLoading(false);
    } catch (error) {
      console.log("Error in fetching transactions: ", error);
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsDB();
  }, []);

  return (
    <>
      <ScrollView
        style={{
          // padding: 10,
          backgroundColor: theme.background,
        }}
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
          <Text>Transactions</Text>
        </View>
        <View style={{ height: 1000, backgroundColor: "grey" }}></View>
        <View style={{position: "absolute", bottom: 0, right: 20}}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              // Handle FAB press
              console.log("FAB pressed");
            }}
          >
            <Text style={{ color: "#fff", fontSize: 24 }}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
