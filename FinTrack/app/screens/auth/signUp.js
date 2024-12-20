import React, { useContext, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../../context/auth";
import { userSignUp } from "../../../api/auth";
import DefaultText from "../../components/defaultText";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { useTheme } from "../../context/themeContext";

const SignUp = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useContext(AuthContext);

  const handleSubmit = async () => {
    if (name == "" || email == "" || password == "") {
      alert("Please fill all fields");
      return;
    }
    const response = await userSignUp(name, email, password);
    // console.log("response", response);
    if (response.error) {
      alert(response.error);
    } else {
      const authData = {
        ...response,
        user: {
          ...response.user,
          isOnboarded: false
        }
      };
      setState(authData);
      await AsyncStorage.setItem("auth", JSON.stringify(authData));
      navigation.navigate("Onboarding");
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <DefaultText style={styles.headerText}>Create Account</DefaultText>
      <View>
        <View>
          <View style={styles.inputContainer}>
            <FontAwesome5Icon
              style={{ padding: 10 }}
              name="user"
              size={20}
              color={theme.text2}
            />
            <TextInput
              placeholder="Name"
              placeholderTextColor={theme.text2}
              style={styles.signUpInput}
              value={name}
              onChangeText={(text) => setName(text)}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <FontAwesome5Icon
              style={{ padding: 10 }}
              name="envelope"
              size={20}
              color={theme.text2}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor={theme.text2}
              style={styles.signUpInput}
              value={email}
              onChangeText={(text) => setEmail(text)}
              autoCompleteType="email"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.inputContainer}>
            <FontAwesome5Icon
              style={{ padding: 10 }}
              name="lock"
              size={20}
              color={theme.text2}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={theme.text2}
              style={styles.signUpInput}
              value={password}
              onChangeText={(text) => setPassword(text)}
              secureTextEntry={showPassword}
              autoCompleteType="password"
            />
            <FontAwesome5Icon
              name={showPassword ? "eye-slash" : "eye"}
              size={18}
              color={theme.text2}
              onPress={() => setShowPassword(!showPassword)}
            />
          </View>
        </View>
        <View style={{ marginVertical: 30 }}>
          <TouchableOpacity onPress={handleSubmit} style={styles.buttonStyle}>
            <DefaultText style={styles.buttonText}>Submit</DefaultText>
          </TouchableOpacity>
          <View style={styles.rulerContainer}>
            <View style={styles.rulerLine}>
              <DefaultText style={styles.rulerText}>or</DefaultText>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("SignIn")}
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
              Sign In
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
      textAlign: "left",
      fontWeight: "bold",
      marginLeft: 30,
      color: theme.text,
      marginVertical: 150,
    },
    inputContainer: {
      marginHorizontal: 30,
      marginVertical: 10,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    signUpInput: {
      flex: 1,
      paddingTop: 10,
      paddingRight: 10,
      paddingBottom: 10,
      paddingLeft: 0,
      color: theme.text,
      height: 50,
      borderBottomWidth: 0.5,
      borderBottomColor: theme.text2,
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
      backgroundColor: theme.text2,
      width: "70%",
    },
    rulerText: {
      position: "absolute",
      alignSelf: "center",
      top: -10, // Adjust position as needed
      paddingHorizontal: 5,
      backgroundColor: theme.background,
    },
  });
};

export default SignUp;
