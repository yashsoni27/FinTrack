import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import DefaultText from "./defaultText";
import PlaidLink from "react-native-plaid-link-sdk";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { createLinkToken, exchangePublicToken } from "../../api/plaidAPI";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";

const AccountSlider = ({ accounts, onAddAccountSuccess }) => {
  const [state, setState] = useContext(AuthContext);
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();

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
      if (onAddAccountSuccess) {
        onAddAccountSuccess();
      }
    } catch (error) {
      console.error("Error exchanging public token:", error);
    }
  };

  useEffect(() => {
    generateLinkToken();
  }, [state.user.userId]);

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
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      style={{
        marginVertical: 10,
        padding: 5,
        backgroundColor: "lightgrey",
      }}
    >
      {accounts.map((account) => {
        return (
          <View
            key={account.accountId}
            style={{
              width: 120,
              marginRight: 50,
              borderWidth: 1,
              borderColor: "#000",
            }}
          >
            <DefaultText>£ {account.balances}</DefaultText>
            <DefaultText>{account.name}</DefaultText>
          </View>
        );
      })}
      {linkToken && (
        <TouchableOpacity
          style={{
            backgroundColor: "darkolivegreen",
            width: 120,
            paddingHorizontal: 20,
            paddingVertical: 10,
            // borderRadius: 10,
            marginRight: 5,
          }}
        >
          <PlaidLink
            tokenConfig={{
              token: linkToken,
            }}
            onSuccess={onSuccess}
            onExit={(exit) => {
              console.log("Exit : ", exit);
            }}
          >
            <FontAwesome5Icon
              style={{ alignSelf: "center", margin: 5 }}
              name="plus-circle"
              size={30}
              color="white"
            />
            <DefaultText style={{ color: "white", fontSize: 16 }}>
              Add Account
            </DefaultText>
          </PlaidLink>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default AccountSlider;

const styles = StyleSheet.create({});
