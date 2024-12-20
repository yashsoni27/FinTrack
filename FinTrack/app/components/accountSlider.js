import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import DefaultText from "./defaultText";
import PlaidLink from "react-native-plaid-link-sdk";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { createLinkToken, exchangePublicToken } from "../../api/plaidAPI";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";

const AccountSlider = ({ accounts, onAddAccountSuccess }) => {
  const [state, setState] = useContext(AuthContext);
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { theme, mode } = useTheme();
  
  let background = theme.background;
  const userId = state.user.userId;
  let text = theme.text;

  if (mode == "light") {
    background = theme.text;
    text = theme.background;
  } else {
    background = theme.primary;
    text = theme.background;
  }
  const styles = createStyles(theme, background, text);

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
      if (onAddAccountSuccess) {
        onAddAccountSuccess();
      }
    } catch (error) {
      console.error("Error exchanging public token:", error);
    }
  };

  useEffect(() => {
    const initializeAccounts = async () => {
      try {
        await generateLinkToken();
      } catch (error) {
        console.error("Error initializing accounts:", error);
      } finally {
        setInitializing(false);
      }
    };

    initializeAccounts();
  }, [state.user.userId]);

  if (initializing || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
        <DefaultText>Loading accounts...</DefaultText>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      style={{
        marginVertical: 10,
        // padding: 5,
      }}
    >
      {accounts && accounts.length > 0 ? (
        accounts.map((account) => {
          return (
            <View key={account.accountId} style={styles.accountContainer}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <DefaultText style={{ color: text, fontSize: 22 }}>
                  £ {account.balances}
                </DefaultText>
                <View>
                  <View
                    style={{
                      backgroundColor: text,
                      padding: 5,
                      borderRadius: 15,
                    }}
                  >
                    <FontAwesome5Icon
                      name="university"
                      size={15}
                      color={background}
                    />
                  </View>
                </View>
              </View>
              <DefaultText style={{ color: text }}>{account.name}</DefaultText>
            </View>
          );
        })
      ) : (
        <DefaultText>No Accounts linked yet</DefaultText>
      )}
      {linkToken && (
        <TouchableOpacity style={styles.addAccountContainer}>
          {/* Plaid Link component for linking bank account */}
          <PlaidLink  
            tokenConfig={{
              token: linkToken,
            }}
            // Handling onSuccess function by fetching the details of the account
            onSuccess={onSuccess} 
            onExit={(exit) => {
              console.log("Exit : ", exit);
            }}
          >
            <MaterialIcons
              style={{ alignSelf: "center", margin: 5 }}
              name="add-circle"
              size={30}
              color={theme.text}
            />
            <DefaultText
              style={{ color: theme.text, fontSize: 16, textAlign: "center" }}
            >
              Add Account
            </DefaultText>
          </PlaidLink>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default AccountSlider;

const createStyles = (theme, background, text) => {
  return StyleSheet.create({
    accountContainer: {
      width: 150,
      height: 100,
      marginRight: 20,
      borderWidth: 1,
      padding: 10,
      borderRadius: 10,
      backgroundColor: background,
      justifyContent: "space-between",
    },
    addAccountContainer: {
      backgroundColor: theme.background,
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: theme.text,
      width: 120,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      marginRight: 5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
  });
};
