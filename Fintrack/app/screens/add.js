import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import FooterList from "../components/footer/footerList";

const Add = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "space-between", alignItems: "center" }}
    >
      <Text style={{ fontSize: 30, textAlign: "center" }}>Add your spending Screen</Text>
      <FooterList />
    </SafeAreaView>
  );
};

export default Add;
