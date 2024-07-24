import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import FooterList from "../components/footer/footerList";

const Analysis = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "space-between", alignItems: "center" }}
    >
      <Text style={{ fontSize: 30, textAlign: "center" }}>Analysis Screen</Text>
      <FooterList />
    </SafeAreaView>
  );
};

export default Analysis;
