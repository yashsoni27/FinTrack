import React from "react";
import { StyleSheet, Text } from "react-native";

const DefaultText = (props) => {
  return (
    <Text {...props} style={[styles.defaultText, props.style]}>
      {props.children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: "Urbanist",    
  },
});

export default DefaultText;
