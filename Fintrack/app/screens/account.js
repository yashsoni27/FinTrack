import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import FooterList from "../components/footer/footerList";
import HeaderTabs from "../components/header/headerTabs";

const Account = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "space-between", alignItems: "center" }}
    >
      <HeaderTabs />
      <Text style={{ fontSize: 30, textAlign: "center" }}>Account Screen</Text>
      <FooterList />
    </SafeAreaView>
  );
};

export default Account;
