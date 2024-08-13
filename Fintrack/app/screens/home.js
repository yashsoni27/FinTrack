import React, { useContext, useState, useEffect } from "react";
import { SafeAreaView, View, FlatList, ScrollView } from "react-native";
import FooterList from "../components/footer/footerList";
import { AuthContext } from "../context/auth";
import { ActivityIndicator } from "react-native";
import {
  createLinkToken,
  exchangePublicToken,
  getBalance,
  getTransactions,
  syncTransactions,
} from "../../api/plaidAPI";
import { getBalanceDb, getTransactionsDb } from "../../api/db";
import DefaultText from "../components/defaultText";
import { useTheme } from "../context/themeContext";
import AccountSlider from "../components/accountSlider";
import Recurring from "../components/recurring";

const Home = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();

  // const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const [balance, setBalance] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  // console.log("home.js auth console: ", state);

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

      const accounts = response.netBalance.map((account) => ({
        accountId: account.account_id,
        name: account.name,
        balances: account.balances.current,
      }));
      setAccounts(accounts);
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
      const response = await getTransactionsDb(userId, 5, null);
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
    // fetchBalance();
    // fetchTransactions();
    fetchBalanceDB();
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
      <DefaultText>
        {new Intl.DateTimeFormat("en-US", options).format(new Date(item.date))}
      </DefaultText>
      <DefaultText>{item.name}</DefaultText>
      <DefaultText>£ {item.amount.toFixed(2)}</DefaultText>
    </View>
  );

  // Loading sign
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
        <DefaultText style={{ marginTop: 10, fontSize: 16, color: "#333" }}>
          Loading...
        </DefaultText>
      </View>
    );
  }

  return (
    <>
      <View
        style={{
          // flex: 1,
          // justifyContent: "space-between",
          // alignItems: "center",
          padding: 10,
          backgroundColor: theme.background,
          height: "92%",
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "lightgrey",
            }}
          >
            <View style={{ backgroundColor: "grey" }}>
              <DefaultText style={{ fontSize: 30, color: theme.text }}>
                Hi {state.user.name}
              </DefaultText>
            </View>
            <View>
              <DefaultText>Check</DefaultText>
            </View>
          </View>

          <View style={{ marginVertical: 10 }}>
            <DefaultText style={{ fontSize: 20 }}>
              My Total Balance: £ {balance}
            </DefaultText>
          </View>

          <View>
            {/* <View style={{ flexDirection: "row", justifyContent: "space-between" }}> */}
            <AccountSlider
              accounts={accounts}
              onAddAccountSuccess={fetchBalanceDB}
            />
          </View>

          <View style={{ margin: 10 }}>
            <DefaultText style={{ fontSize: 20 }}>
              Total Transactions...
            </DefaultText>
            <FlatList
              // data={transactions.slice(0, 5)}
              data={transactions}
              renderItem={renderTransactions}
              scrollEnabled={false}
              keyExtractor={(item, index) =>
                item.id?.toString() || index.toString()
              }
            />
          </View>

          <View style={{ margin: 10 }}>
            <Recurring />
          </View>
        </ScrollView>
      </View>
      <FooterList />
    </>
  );
};

export default Home;
