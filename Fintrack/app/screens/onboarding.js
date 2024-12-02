import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import DefaultText from "../components/defaultText";
import { createLinkToken, exchangePublicToken, getBalance, getRecurringTransactions, syncTransactions } from "../../api/plaidAPI";
import { AuthContext } from "../context/auth";
import { useNavigation } from "@react-navigation/native";
import PlaidLink from "react-native-plaid-link-sdk";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../context/themeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

const Onboarding = () => {
  const [state, setState] = useContext(AuthContext);
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigation = useNavigation();
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
    try {
      console.log("onboarding onSuccess: ", state.user.userId, success);
      const response = await exchangePublicToken(
        userId,
        success.publicToken,
        success.metadata
      );

      console.log("Bank account added successfully");
      console.log("account response", response);
      console.log(response.auth.accounts[0]);
      // Update local storage first
      const existingAuth = await AsyncStorage.getItem("auth");
      const parsedAuth = JSON.parse(existingAuth);
      
      const updatedAuth = {
        ...parsedAuth,
        user: {
          ...parsedAuth.user,
          onBoarded: true
        }
      };
      
      
      const balanceResponse = await getBalance(userId);
      // console.log("balanceResponse:", balanceResponse);
      const transactionResponse = await syncTransactions(userId);
      // console.log("transactionResponse:", transactionResponse);
      const recurringResponse = await getRecurringTransactions(userId);
      // console.log("recurringResponse:", recurringResponse);
      console.log("Everything fetched!!!");
      
      
      // Update global state
      await AsyncStorage.setItem("auth", JSON.stringify(updatedAuth));
      setState(updatedAuth);
    
      
    } catch (error) {
      console.error("Error in onboarding completion:", error);
      Alert.alert(
        "Error",
        "There was an issue completing your setup. Please try again."
      );
    }
  };

  useEffect(() => {
    generateLinkToken();
  }, [userId]);

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <DefaultText style={styles.title}>Welcome to FinTrack!</DefaultText>
            <DefaultText style={styles.subtitle}>
              Let's connect your bank account to get started
            </DefaultText>
            <TouchableOpacity 
              style={styles.nextButton}
              onPress={() => setStep(2)}
            >
              <DefaultText style={styles.buttonText}>Continue</DefaultText>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            {linkToken && (
              <PlaidLink
                tokenConfig={{
                  token: linkToken,
                }}
                onSuccess={onSuccess}
                onExit={(exit) => {
                  console.log("Exit:", exit);
                }}
              >
                <View style={styles.plaidButton}>
                  <MaterialIcons
                    name="add-circle"
                    size={30}
                    color={theme.text}
                  />
                  <DefaultText style={styles.plaidButtonText}>
                    Connect Your Bank
                  </DefaultText>
                </View>
              </PlaidLink>
            )}
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stepContainer: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  nextButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 10,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  plaidButton: {
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  plaidButtonText: {
    marginTop: 10,
    fontSize: 16,
  }
});

export default Onboarding;
