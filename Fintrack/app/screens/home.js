import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import FooterList from "../components/footer/footerList";
import { AuthContext } from "../context/auth";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { ActivityIndicator } from "react-native";
import PlaidLink from "react-native-plaid-link-sdk";
import {
  createLinkToken,
  exchangePublicToken,
  getBalance,
  getTransactions,
  syncTransactions,
} from "../../api/plaidAPI";
import { getBalanceDb, getTransactionsDb } from "../../api/db";

const Home = () => {
  const [state, setState] = useContext(AuthContext);
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  // console.log("home.js auth console: ", state);
  // console.log("home.js auth console");
  const options = {
    // weekday: "long",
    year: "numeric",
    // month: "long",
    month: "numeric",
    day: "numeric",
    // hour: "numeric",
    // minute: "numeric",
    // second: "numeric",
    // timeZoneName: "short",
  };
  const userId = state.user.userId;

  const generateLinkToken = async () => {
    try {
      setLoading(true);
      const response = await createLinkToken(userId);
      console.log("create_link_token response", response);
      setLinkToken(response.link_token);
    } catch (error) {
      console.log("Error generating link token: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await getBalance(userId);
      console.log("Balance fetched from Plaid: ", response);
      const netBalance = response.netBalance.reduce(
        (sum, account) => sum + (account.balances.current || 0),
        0
      );
      setBalance(netBalance);
    } catch (error) {
      console.log("Error fetching balance: ", error);
      setBalance(null);
    }
  };

  const fetchBalanceDB = async () => {
    try {
      const response = await getBalanceDb(userId);
      // console.log("Balance fetched from DB: ", response.netBalance);
      console.log("Balance fetched from DB");
      const netBalance = response.netBalance.reduce(
        (sum, account) => sum + (account.balances.current || 0),
        0
      );
      setBalance(netBalance);
    } catch (error) {
      console.log("Error fetching balance: ", error);
      setBalance(null);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await syncTransactions(userId);
      console.log("Transactions synced from Plaid: ", response);
      // setTransactions(response.transactions);
      setLoading(false);
    } catch (error) {
      console.log("Error in fetching transactions: ", error);
      setLoading(false);
    }
  };

  const fetchTransactionsDB = async () => {
    try {
      setLoading(true);
      const response = await getTransactionsDb(userId, (count = 10));
      // console.log("Transactions fetched from DB: ", response);
      console.log("Transactions fetched from DB");
      setTransactions(response.transactions);
      setLoading(false);
    } catch (error) {
      console.log("Error in fetching transactions: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    generateLinkToken();
    // fetchBalance();
    fetchBalanceDB();
    // fetchTransactions();
    fetchTransactionsDB();
  }, [state.user.userId]);

  const renderTransactions = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
      }}
    >
      <Text>{new Intl.DateTimeFormat('en-US', options).format(new Date(item.date))}</Text>
      <Text>{item.name}</Text>
      <Text>£{item.amount.toFixed(2)}</Text>
    </View>
  );

  const onSuccess = async (success) => {
    console.log("inside onSuccess: ", state.user.userId, success);
    try {
      const response = await exchangePublicToken(
        state.user.userId,
        success.publicToken,
        success.metadata
      );
      console.log("Bank account added successfully");
      console.log(response);
      // Handle success (e.g., navigate to another screen or update UI)
      // setBalance(response.balances.current)
      // fetchBalance();
      // fetchTransactions();
    } catch (error) {
      console.error("Error exchanging public token:", error);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={{ marginTop: 10, fontSize: 16, color: "#333" }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ fontSize: 30, textAlign: "center" }}>
            Hi {state.user.name}
          </Text>
          {linkToken && (
            // <TouchableOpacity style={{ backgroundColor:"lightgray", borderRadius:50, padding:20}}>
            <PlaidLink
              tokenConfig={{
                token: linkToken,
              }}
              onSuccess={onSuccess}
              onExit={(exit) => {
                console.log("Exit : ", exit);
              }}
            >
              <View
                style={{
                  backgroundColor: "darkolivegreen",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 5,
                }}
              >
                <FontAwesome5
                  style={{ alignSelf: "center", margin: 5 }}
                  name="plus-circle"
                  size={30}
                  color="black"
                />
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
                >
                  Add Account
                </Text>
              </View>
            </PlaidLink>
            // </TouchableOpacity>
          )}
          <View style={{ margin: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Total Balance: £ {balance}
            </Text>
          </View>
          <View style={{ margin: 10, height: "50%" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Transactions...
            </Text>
            <FlatList
              // data={transactions.slice(0, 5)}
              data={transactions}
              renderItem={renderTransactions}
              keyExtractor={(item, index) =>
                item.id?.toString() || index.toString()
              }
            />
          </View>
        </View>
        <FooterList />
      </SafeAreaView>
    </>
  );
};

export default Home;
