import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { useTheme } from "../../context/themeContext";
import DefaultText from "../defaultText";

const FooterItem = ({ name, text, handlePress, screenName, routeName }) => {
  const { theme } = useTheme();
  // console.log("Theme: ",theme.primary);

  const activeScreenColor = screenName === routeName && theme.primary;
  // console.log(activeScreenColor);

  return (
    <TouchableOpacity onPress={handlePress} style={styles.footerItem}>
      <FontAwesome5
        name={name}
        size={25}
        style={styles.fontStyle}
        color={activeScreenColor}
      />
      {/* {activeScreenColor ? <Text style={[styles.textStyle, { color: theme.text }]}>{text}</Text> : null} */}
      <DefaultText style={[styles.textStyle, { color: theme.text }]}>{text}</DefaultText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fontStyle: {
    marginBottom: 5,
    alignSelf: "center",
  },
  textStyle: {
    fontSize: 12,
    textAlign: "center",
    // textTransform: "uppercase",    
  },
  footerItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",    
  },
});

export default FooterItem;
