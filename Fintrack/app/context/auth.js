import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    token: "",
    // onBoarded: false,
    // fingerprintEnabled: true,
  });

  useEffect(() => {
    const loadFromAsyncStorage = async () => {
      let data = await AsyncStorage.getItem("auth");
      const parsed = JSON.parse(data);
      console.log("parsed:  ", parsed);

      if (parsed) {
        // If fingerprint is disabled
        if (parsed.user.fingerprintEnabled == false) {
          setState({
            ...state,
            user: parsed.user,
            token: parsed.token,
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
            });
          }
        }
      }
    };
    loadFromAsyncStorage();
  }, []);

  return (
    <AuthContext.Provider value={[state, setState]}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
