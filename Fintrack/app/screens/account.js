import { View, Text, SafeAreaView } from "react-native";
import React, { useContext } from "react";
import FooterList from "../components/footer/footerList";
import HeaderTabs from "../components/header/headerTabs";
import DefaultText from "../components/defaultText";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";

const Account = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();

  const userId = state.user.id

  return (
    <>
      <View style={{}}>
        <DefaultText style={{ fontSize: 30, textAlign: "center", color: theme.text }}>
          Account Screen
        </DefaultText>
        <HeaderTabs />
      </View>
      <FooterList />
    </>
  );
};

export default Account;
