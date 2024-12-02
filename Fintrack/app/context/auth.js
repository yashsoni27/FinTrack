import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { ActivityIndicator } from "react-native";
import { DefaultText } from "../components/defaultText";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    token: "",
    isOnboarded: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const loadFromAsyncStorage = async () => {
      let data = await AsyncStorage.getItem("auth");
      const parsed = JSON.parse(data);
      console.log(parsed);

      if (parsed) {
        // If fingerprint is disabled
        if (parsed.user.fingerprintEnabled == false) {
          setState({
            ...state,
            user: parsed.user,
            token: parsed.token,
            isOnboarded: parsed.user.isOnboarded || false,
            loading: false,
          });
        } else {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          if (hasHardware && isEnrolled) {
            const result = await LocalAuthentication.authenticateAsync({
              promptMessage: "Verify your identity",
            });

            if (result.success) {
              console.log("Biometric auth successfull");
              setState({
                ...state,
                user: parsed.user,
                token: parsed.token,
                loading: false,
              });
            } else {
              console.log("Biometric auth failed");
            }
          } else {
            console.log("Biometric auth is not available");
            setState({
              ...state,
              user: parsed.user,
              token: parsed.token,
              loading: false,
            });
          }
        }
      }
      setState({
        ...state,
        loading: false,
      });
    };
    loadFromAsyncStorage();
  }, []);

  if (state.loading) {
    return <ActivityIndicator size="large" color="#4285F4" />;
  }

  if (state.error) {
    return <DefaultText>Error: {state.error}</DefaultText>;
  }

  return (
    <AuthContext.Provider value={[state, setState]}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
