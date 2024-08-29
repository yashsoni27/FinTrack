import React, { useContext } from "react";
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

const Stack = createNativeStackNavigator();

const NavigationScreen = () => {
  const [state, setState] = useContext(AuthContext);
  console.log("state:::", state);
  const authenticated = state && state.token !== "" && state.user !== null;

  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
      initialRouteName="Home"
    >
      {authenticated ? (
        <>
          {/* {state.user.onBoarded == false ? ( */}
            <>
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Account" component={Account} />
              <Stack.Screen name="Analysis" component={Analysis} />
              <Stack.Screen name="Add" component={Add} />
              <Stack.Screen name="Transactions" component={Transactions} />
              <Stack.Screen name="Recurring" component={RecurringScreen} />
              <Stack.Screen name="ManageBudgets" component={ManageBudgets} />
            </>
          {/* ) : (
            <>
              <Stack.Screen name="Onboarding" component={Onboarding} />
            </>
          )} */}
        </>
      ) : (
        <>
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
