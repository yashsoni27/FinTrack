import { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { forgotPassword, resetPassword } from "../../../api/auth";
import { useTheme } from "../../context/themeContext";

const ForgotPassword = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [visible, setVisible] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      alert("Email is required");
      return;
    }
    try {
      const data = await forgotPassword(email);
      if (data.error) alert(data.error);
      else {
        setVisible(true);
        alert("Enter the password reset code");
      }
    } catch (err) {
      alert("Error sending email. Try again.");
      console.log(err);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const data = await resetPassword(email, resetCode, password);
      if (data.error) alert(data.error);
      else {
        alert("Now you can login with your new password");
        navigation.navigate("SignIn");
      }
    } catch (err) {
      console.log(err);
      alert("Password reset failed. Try again.");
    }
  };

  return (
    <KeyboardAwareScrollView contentCotainerStyle={styles.container}>
      <View style={{ marginVertical: 100 }}>
        <Text style={styles.signupText}>Forgot Password</Text>
        <View style={{ marginHorizontal: 24 }}>
          <Text style={{ fontSize: 16, color: "#8e93a1" }}>EMAIL</Text>
          <TextInput
            style={styles.signupInput}
            value={email}
            onChangeText={(text) => setEmail(text)}
            autoCompleteType="email"
            keyboardType="email-address"
          />
        </View>
        {visible && (
          <>
            <View style={{ marginHorizontal: 24 }}>
              <Text style={{ fontSize: 16, color: "#8e93a1" }}>
                NEW PASSWORD
              </Text>
              <TextInput
                style={styles.signupInput}
                value={password}
                onChangeText={(text) => setPassword(text)}
                secureTextEntry={true}
                autoComplteType="password"
              />
            </View>
            <View style={{ marginHorizontal: 24 }}>
              <Text style={{ fontSize: 16, color: "#8e93a1" }}>
                Password Reset Code
              </Text>
              <TextInput
                style={styles.signupInput}
                value={resetCode}
                onChangeText={(text) => setResetCode(text)}
                secureTextEntry={true}
              />
            </View>
          </>
        )}
        <TouchableOpacity
          onPress={visible ? handlePasswordReset : handleSubmit}
          style={styles.buttonStyle}
        >
          <Text style={styles.buttonText}>
            {visible ? "Reset Password" : "Request Reset Code"}
          </Text>
        </TouchableOpacity>
        <Text
          onPress={() => navigation.navigate("SignIn")}
          style={styles.forgotText}
        >
          Sign In
        </Text>
      </View>
    </KeyboardAwareScrollView>
  );
};

const createStyles = (theme) => {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: "center" },
    forgotText: {
      fontSize: 12,
      textAlign: "center",
      marginTop: 10,
      color: "darkgreen",
      fontWeight: "bold",
    },
    signupText: { fontSize: 30, textAlign: "center" },
    signupInput: {
      borderBottomWidth: 0.5,
      height: 48,
      borderBottomColor: "#8e93a1",
      marginBottom: 30,
    },
    buttonStyle: {
      backgroundColor: theme.text,
      height: 50,
      marginBottom: 15,
      marginHorizontal: 15,
      borderRadius: 30,
      alignSelf: "center",
      justifyContent: "center",
      width: "60%",
    },
    buttonText: {
      fontSize: 20,
      textAlign: "center",
      color: theme.surface,
      textTransform: "capitalize",
    },
    imageContainer: { justifyContent: "center", alignItems: "center" },
    imageStyles: { width: 100, height: 100, marginVertical: 20 },
  });
};

export default ForgotPassword;
