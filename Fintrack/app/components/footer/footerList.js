import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FooterItem from "./footerItem";
import { useNavigation, useRoute } from "@react-navigation/native";

const FooterList = () => {
  const navigation = useNavigation();
  const route = useRoute();

  return (
    <>
      <View style={styles.container}>
        <FooterItem name="home" text="Home" screenName="Home" handlePress={() => navigation.navigate("Home")} routeName={route.name} />
        <FooterItem name="plus-square" text="Add" screenName="Add" handlePress={() => navigation.navigate("Add")} routeName={route.name}/>
        {/* <FooterItem name="list-ol" text="Links" screenName="Links" handlePress={() => navigation.navigate("Links")} routeName={route.name}/> */}
        <FooterItem name="list" text="Transactions" screenName="Transactions" handlePress={() => navigation.navigate("Transactions")} routeName={route.name}/>
        <FooterItem name="chart-bar" text="Analysis" screenName="Analysis" handlePress={() => navigation.navigate("Analysis")} routeName={route.name}/>
        <FooterItem name="user" text="Account" screenName="Account" handlePress={() => navigation.navigate("Account")} routeName={route.name} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "80%",
    margin: 10,
    marginHorizontal: 30,
    justifyContent: "space-between",
  },
});

export default FooterList;
