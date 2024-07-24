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

const SignIn = ({ navigation }) => {  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useContext(AuthContext);

  const handleSubmit = async () => {
    
    if (email === "" || password === "") {
      alert("All fields are required");
      return;
    }
    const response = await userSignIn(email, password);
    // console.log("response", response);
    if (response.error) {
      alert(response.error);
    } else {
      setState(response);
      await AsyncStorage.setItem("auth", JSON.stringify(response));
      alert("Sign In Successful");
      navigation.navigate("Home");
    }
  };
  return (
    <KeyboardAwareScrollView contentCotainerStyle={styles.container}>
      <View style={{ marginVertical: 100 }}>
        <Text style={{fontSize: 30, fontWeight:"bold", textAlign: "center", marginBottom: 20}}>Welcome</Text>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../../assets/favicon.png")}
            style={styles.imageStyles}
          />
        </View>
        <Text style={styles.signupText}>Sign In</Text>
        <View style={{ marginHorizontal: 24 }}>
          <Text style={{ fontSize: 16, color: "#8e93a1" }}>Email</Text>
          <TextInput
            style={styles.signupInput}
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCompleteType="email"
            keyboardType="email-address"
          />
        </View>
        <View style={{ marginHorizontal: 24 }}>
          <Text style={{ fontSize: 16, color: "#8e93a1" }}>Password</Text>
          <TextInput
            style={styles.signupInput}
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            autoComplteType="password"
          />
        </View>
        <TouchableOpacity onPress={handleSubmit} style={styles.buttonStyle}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
        <Text onPress={() => navigation.navigate("ForgotPassword")} style={{ fontSize: 12, textAlign: "center", marginTop: 0, fontWeight: "bold" }}>
          Forgot Password?
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")} style={styles.buttonStyle}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  signupText: {
    fontSize: 30,
    textAlign: "center",
  },
  signupInput: {
    borderBottomWidth: 0.5,
    height: 50,
    borderBottomColor: "#8e93a1",
    marginBottom: 20,
  },
  buttonStyle: {
    backgroundColor: "darkmagenta",
    height: 50,
    margin: 15,
    justifyContent: "center",
    alignSelf: "center",
    borderRadius: 30,
    width: "50%",
  },
  buttonText: {
    fontSize: 20,
    textAlign: "center",
    color: "#fff",
    textTransform: "capitalize",
    fontWeight: "bold",
  },
  imageContainer: { justifyContent: "center", alignItems: "center" },
  imageStyles: { width: 100, height: 100, marginVertical: 20 },
});

export default SignIn;
