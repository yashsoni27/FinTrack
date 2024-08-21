import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import React, { useContext } from "react";
import FooterList from "../components/footer/footerList";
import DefaultText from "../components/defaultText";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { deleteAccount } from "../../api/auth";

const Account = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();

  const userId = state.user.id;

  const signOut = async () => {
    setState({ token: "", user: null });
    await AsyncStorage.removeItem("auth");
  };

  const deleteAcc = async () => {
    console.log("delete");
    const response = await deleteAccount(userId, "testing");
    console.log("delete response: ", response);
  };


  return (
    <>
      <View style={{ height: "90%" }}>
        <View>
          <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
            Settings
          </DefaultText>
        </View>
        <View>
          <DefaultText>{state.user.name}</DefaultText>
        </View>

        <View>
          <TouchableOpacity onPress={signOut}>
            <FontAwesome5Icon name="sign-out-alt" size={25} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteAcc}>
            <FontAwesome5Icon name="trash" size={25} color={theme.danger} />
          </TouchableOpacity>
        </View>

      </View>
      <FooterList />
    </>
  );
};

export default Account;
