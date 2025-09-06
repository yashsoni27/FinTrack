import React, { useEffect, useRef, useState, useContext } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/auth";
import SignUp from "../screens/auth/signUp";
import SignIn from "../screens/auth/signIn";
import Home from "../screens/home";
import Account from "../screens/account";
import Analysis from "../screens/analysis";
import Landing from "../screens/static/landing";
import ForgotPassword from "../screens/auth/forgotPassword";
import Add from "../screens/add";
import Transactions from "../screens/transactions";
import { useTheme } from "../context/themeContext";
import RecurringScreen from "../screens/recurringScreen";
import ManageBudgets from "../screens/manageBudgets";
import Onboarding from "../screens/onboarding";
import LLMChat from "../screens/llmChat";
import TransactionDetail from "./transactionDetail";
import { registerForPushNotificationsAsync } from "../utils/notificationConfig";
import { websocketService } from "../utils/websocketService";
import * as Notifications from "expo-notifications";

const Stack = createNativeStackNavigator();

const NavigationScreen = () => {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  // useEffect(() => {
  //   // Push Notifications Setup
  //   registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

  //   notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
  //     setNotification(notification);
  //   });

  //   responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
  //     console.log(response);
  //   });

  //   // WebSocket Setup
  //   websocketService.connect('wss://your-websocket-server.com');

  //   // Subscribe to WebSocket messages
  //   const unsubscribe = websocketService.subscribe(data => {
  //     console.log('Received WebSocket data:', data);
  //     // Handle WebSocket messages here
  //   });

  //   return () => {
  //     Notifications.removeNotificationSubscription(notificationListener.current);
  //     Notifications.removeNotificationSubscription(responseListener.current);
  //     websocketService.disconnect();
  //     unsubscribe();
  //   };
  // }, []);

  const [state] = useContext(AuthContext);
  console.log("state:::", state);
  const authenticated = state && state.token !== "" && state.user !== null;
  let isOnboarded = state?.user?.onBoarded;

  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
      // initialRouteName="Home"
    >
      {authenticated ? (
        !isOnboarded ? (
          <Stack.Screen
            name="Onboarding"
            component={Onboarding}
            options={{ gestureEnabled: false }}
          />
        ) : (
          <>
            {/* Inside App */}
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Account" component={Account} />
            <Stack.Screen name="Analysis" component={Analysis} />
            <Stack.Screen name="Add" component={Add} />
            <Stack.Screen name="Transactions" component={Transactions} />
            <Stack.Screen name="LLMChat" component={LLMChat} />
            <Stack.Screen name="Recurring" component={RecurringScreen} />
            <Stack.Screen name="ManageBudgets" component={ManageBudgets} />
            <Stack.Screen
              name="TransactionDetail"
              component={TransactionDetail}
            />
          </>
        )
      ) : (
        <>
          {/* Authentication pages */}
          <Stack.Screen name="Landing" component={Landing} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default NavigationScreen;
