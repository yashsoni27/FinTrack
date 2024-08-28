import { StyleSheet, TouchableOpacity, View } from "react-native";
import DefaultText from "../components/defaultText";
import { createLinkToken, exchangePublicToken } from "../../api/plaidAPI";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/auth";
import { useNavigation } from "@react-navigation/native";
import PlaidLink from "react-native-plaid-link-sdk";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../context/themeContext";

const Onboarding = () => {
  const [state, setState] = useContext(AuthContext);
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const {theme} = useTheme();

  const userId = state.user.userId;


  const generateLinkToken = async () => {
    try {
      setLoading(true);
      const response = await createLinkToken(userId);
      console.log("create_link_token response", response);
      setLinkToken(response.link_token);
    } catch (error) {
      console.log("Error generating link token: ", error);
    } finally {
      setLoading(false);
    }
  };

  const onSuccess = async (success) => {
    console.log("inside onSuccess: ", state.user.userId, success);
    try {
      const response = await exchangePublicToken(
        state.user.userId,
        success.publicToken,
        success.metadata
      );
      console.log("Bank account added successfully");
      console.log(response);
      navigation.navigate("Home");
      // if (onAddAccountSuccess) {
      //   onAddAccountSuccess();
      // }
    } catch (error) {
      console.error("Error exchanging public token:", error);
    }
  };

  useEffect(() => {
    generateLinkToken();
  }, [state.user.userId]);


  return (
    <View>
      <DefaultText>Onboarding</DefaultText>
      {linkToken && (
        <TouchableOpacity
          style={{
            backgroundColor: theme.background,
            borderStyle: "dashed",
            borderWidth: 1,
            borderColor: theme.text,
            width: 120,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
            marginRight: 5,
          }}
        >
          <PlaidLink
            tokenConfig={{
              token: linkToken,
            }}
            onSuccess={onSuccess}
            onExit={(exit) => {
              console.log("Exit : ", exit);
            }}
          >
            <MaterialIcons
              style={{ alignSelf: "center", margin: 5 }}
              name="add-circle"
              size={30}
              color={theme.text}
            />
            <DefaultText
              style={{ color: theme.text, fontSize: 16, textAlign: "center" }}
            >
              Add Account
            </DefaultText>
          </PlaidLink>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Onboarding;

const styles = StyleSheet.create({});
