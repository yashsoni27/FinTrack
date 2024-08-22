import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../../context/themeContext";
import DefaultText from "../defaultText";

const FooterItem = ({ name, text, handlePress, screenName, routeName }) => {
  const { theme, mode } = useTheme();
  // console.log("Theme: ",theme.primary);
  let activeScreenColor = theme.text;

  if (mode == "light") {
    activeScreenColor = screenName === routeName ? theme.text : theme.text2;
  } else {
    activeScreenColor = screenName === routeName ? theme.primary2 : theme.text2;
  }

  // console.log(activeScreenColor);

  return (
    <TouchableOpacity onPress={handlePress} style={styles.footerItem}>
      {/* {screenName === routeName ? (
        <View
          style={{
            backgroundColor: "green",
            height: 60,
            width: 60,
            borderRadius: 30,
            position: "absolute",
          }}
        />
      ) : null} */}
      <MaterialIcons
        name={name}
        size={20}
        style={styles.fontStyle}
        color={activeScreenColor}
      />
      <DefaultText style={[styles.textStyle, { color: activeScreenColor }]}>
        {text}
      </DefaultText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  footerItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
  },
  fontStyle: {
    // marginBottom: 5,
    alignSelf: "center",
  },
  textStyle: {
    fontSize: 12,
    textAlign: "center",
    // textTransform: "uppercase",
  },
});

export default FooterItem;
