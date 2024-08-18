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

const SignUp = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useContext(AuthContext);

  const handleSubmit = async () => {

    if (name == "" || email == "" || password == "") {
      alert("Please fill all fields");
      return;
    }
    const response = await userSignUp(name, email, password);
    // console.log("response", response);
    if(response.error) {        
        alert(response.error);
    } else {
        setState(response);
        await AsyncStorage.setItem("auth", JSON.stringify(response));
        // alert("User created successfully");
        navigation.navigate("Home");
    }
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <View style={{ marginVertical: 100 }}>
        {/* <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("../../../assets/favicon.png")}
            style={{ width: 100, height: 100, marginVertical: 20 }}
          />
        </View> */}
        <DefaultText style={styles.signUpText}>SignUp</DefaultText>
        <View style={{ marginHorizontal: 24 }}>
          <DefaultText style={{ fontSize: 16, color: "#8e93a1" }}>NAME</DefaultText>
          <TextInput
            style={styles.signUpInput}
            value={name}
            onChangeText={(text) => setName(text)}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
        <View style={{ marginHorizontal: 24 }}>
          <DefaultText style={{ fontSize: 16, color: "#8e93a1" }}>EMAIL</DefaultText>
          <TextInput
            style={styles.signUpInput}
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCompleteType="email"
            keyboardType="email-address"
          />
        </View>
        <View style={{ marginHorizontal: 24 }}>
          <DefaultText style={{ fontSize: 16, color: "#8e93a1" }}>PASSWORD</DefaultText>
          <TextInput
            style={styles.signUpInput}
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
            autoCompleteType="password"
          />
        </View>
        <TouchableOpacity onPress={handleSubmit} style={styles.buttonStyle}>
          <DefaultText style={styles.buttonText}>Submit</DefaultText>
        </TouchableOpacity>
        <DefaultText style={{ fontSize: 12, textAlign: "center" }}>
          Already Joined? {" "} 
        </DefaultText>
        <TouchableOpacity onPress={() => navigation.navigate("SignIn")} style={styles.buttonStyle}>
          <DefaultText style={styles.buttonText}>Sign In</DefaultText>
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
  signUpText: {
    fontSize: 30,
    textAlign: "center",
  },
  signUpInput: {
    height: 48,
    marginBottom: 30,
    borderBottomColor: "#8e93a1",
    borderBottomWidth: 0.5,
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
});

export default SignUp;
