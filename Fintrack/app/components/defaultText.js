import React from "react";
import { StyleSheet, Text } from "react-native";
import { useTheme } from "../context/themeContext";

const DefaultText = (props) => {
  const { theme } = useTheme();

  const styles = createStyles(theme);
  return (
    <Text {...props} style={[styles.defaultText, props.style]}>
      {props.children}
    </Text>
  );
};

const createStyles = (theme) => {
  return StyleSheet.create({
    defaultText: {
      fontFamily: "Inter",
      // fontFamily: "Urbanist",
      color: theme.text,
    },
  });
};

export default DefaultText;
