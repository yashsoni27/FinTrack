import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FooterItem from "./footerItem";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../context/themeContext";

const FooterList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <>
      <View style={styles.container}>
        <FooterItem name="home-filled" text="Home" screenName="Home" handlePress={() => navigation.navigate("Home")} routeName={route.name} />
        <FooterItem name="list" text="Transactions" screenName="Transactions" handlePress={() => navigation.navigate("Transactions")} routeName={route.name} />
        <FooterItem name="analytics" text="Spending" screenName="Analysis" handlePress={() => navigation.navigate("Analysis")} routeName={route.name} />
        <FooterItem name="person" text="Account" screenName="Account" handlePress={() => navigation.navigate("Account")} routeName={route.name} />
      </View>
    </>
  );
};

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      position: "absolute",
      bottom: 7,
      width: "90%",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: theme.surface,
      marginHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 35,
      shadowColor: theme.text,
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 2,
    },
  });
};

export default FooterList;
