import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import DefaultText from "../../components/defaultText";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../context/themeContext";

const Landing = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <>
      <View style={styles.container}>
        <View />
        <DefaultText style={[styles.introText, { fontWeight: "bold" }]}>
          Fin
          <DefaultText style={{ fontStyle: "italic", fontWeight: "bold" }}>
            tracker
          </DefaultText>
        </DefaultText>
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignIn")}
            style={styles.buttonStyle}
          >
            <DefaultText style={styles.buttonText}>Log In</DefaultText>
          </TouchableOpacity>          
          <TouchableOpacity
            onPress={() => navigation.navigate("SignUp")}
            style={[styles.buttonStyle, { backgroundColor: theme.text2 }]}
          >
            <DefaultText style={styles.buttonText}>Sign Up</DefaultText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-around",
      alignItems: "center",
    },
    introText: {
      fontSize: 50,
      textAlign: "center",
    },
    buttonStyle: {
      backgroundColor: theme.text,
      height: 50,
      marginTop: 10,
      justifyContent: "center",
      alignSelf: "center",
      borderRadius: 30,
      width: 200,
    },
    buttonText: {
      fontSize: 20,
      textAlign: "center",
      color: theme.surface,
      textTransform: "capitalize",
    },
  });
};

export default Landing;
