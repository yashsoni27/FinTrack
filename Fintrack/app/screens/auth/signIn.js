import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useContext, useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { userSignIn } from "../../../api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../context/auth";
import { useTheme } from "../../context/themeContext";
import DefaultText from "../../components/defaultText";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

const SignIn = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useContext(AuthContext);

  const handleSubmit = async () => {
    if (email === "" || password === "") {
      alert("All fields are required");
      return;
    }
    const response = await userSignIn(email, password);
    if (response.error) {
      alert(response.error);
    } else {
      setState(response);
      await AsyncStorage.setItem("auth", JSON.stringify(response));
      // alert("Sign In Successful");
      navigation.navigate("Home");
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <DefaultText style={styles.headerText}>Welcome back</DefaultText>
      <View>
        <View style={{}}>
          <View style={styles.inputContainer}>
            <FontAwesome5Icon
              style={{ padding: 10 }}
              name="envelope"
              size={20}
              color="black"
            />
            <TextInput
              placeholder="Email"
              style={styles.signupInput}
              value={email}
              onChangeText={(text) => setEmail(text)}
              autoCompleteType="email"
              keyboardType="email-address"
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.inputContainer}>
            <FontAwesome5Icon
              style={{ padding: 10 }}
              name="lock"
              size={20}
              color="black"
            />
            <TextInput
              placeholder="Password"
              style={styles.signupInput}
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={true}
              autoComplteType="password"
            />
          </View>
          <View style={{ marginHorizontal: 30 }}>
            <DefaultText
              onPress={() => navigation.navigate("ForgotPassword")}
              style={{
                fontSize: 15,
                textAlign: "right",
                marginTop: 0,
                fontWeight: "bold",
              }}
            >
              Forgot Password?
            </DefaultText>
          </View>
        </View>
        <View style={{ marginVertical: 30 }}>
          <TouchableOpacity onPress={handleSubmit} style={styles.buttonStyle}>
            <DefaultText style={styles.buttonText}>Log In</DefaultText>
          </TouchableOpacity>
          <View style={styles.rulerContainer}>
            <View style={styles.rulerLine}>
              <DefaultText style={styles.rulerText}>or</DefaultText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignUp")}
            style={[
              styles.buttonStyle,
              {
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: theme.text,
              },
            ]}
          >
            <DefaultText style={[styles.buttonText, { color: theme.text }]}>
              Sign Up
            </DefaultText>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "space-between",
      paddingHorizontal: 10,
    },
    headerText: {
      fontSize: 30,
      fontWeight: "bold",
      textAlign: "left",
      marginLeft: 30,
      color: theme.text,
      marginTop: 150,
    },
    inputContainer: {
      marginHorizontal: 30,
      marginVertical: 10,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },

    signupInput: {
      flex: 1,
      paddingTop: 10,
      paddingRight: 10,
      paddingBottom: 10,
      paddingLeft: 0,
      borderBottomWidth: 0.5,
      height: 50,
      borderBottomColor: "#8e93a1",
    },
    buttonStyle: {
      backgroundColor: theme.text,
      height: 50,
      margin: 25,
      justifyContent: "center",
      alignSelf: "center",
      borderRadius: 30,
      width: "80%",
    },
    buttonText: {
      fontSize: 20,
      textAlign: "center",
      color: theme.surface,
      textTransform: "capitalize",
    },
    rulerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    rulerLine: {
      height: 1,
      backgroundColor: "#8e93a1",
      width: "70%",
    },
    rulerText: {
      position: "absolute",
      alignSelf: "center",
      top: -10,
      paddingHorizontal: 5,
      backgroundColor: theme.background,
    },
  });
};

export default SignIn;
