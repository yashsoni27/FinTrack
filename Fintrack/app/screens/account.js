import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FooterList from "../components/footer/footerList";
import DefaultText from "../components/defaultText";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { deleteAccount } from "../../api/auth";
import { Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Account = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme, toggleTheme, mode } = useTheme();
  const styles = createStyles(theme, mode);

  const [isFingerprintEnabled, setIsFingerprintEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const userId = state.user.userId;

  const toggleSwitch = async () => {    
    setIsFingerprintEnabled(!isFingerprintEnabled);
    try {
      const authData = await AsyncStorage.getItem("auth");
      if (authData) {
        const { token, user } = JSON.parse(authData);
        const updatedUser = { ...user, fingerprintEnabled: !isFingerprintEnabled };
        const updatedAuthData = JSON.stringify({ token, user: updatedUser });
        await AsyncStorage.setItem("auth", updatedAuthData);
        console.log("isfingerprintEnabled: ", !isFingerprintEnabled);
      }
    } catch (error) {
      console.error("Error updating fingerprint in AsyncStorage:", error);
    }    
  };

  const signOut = async () => {
    setState({ token: "", user: null });
    await AsyncStorage.removeItem("auth");
  };

  const deleteAcc = async () => {
    const response = await deleteAccount(userId);
    if (response.error) {
      console.log("delete error: ", response);
      setDeleteModalVisible(false);
      return;
    } else {
      setDeleteModalVisible(false);
      signOut();
    }
  };

  const renderPersonalDetails = () => {
    const details = [
      { icon: "person", label: "First Name", value: state.user.name },
      { icon: "alternate-email", label: "Email", value: state.user.email },
      { icon: "smartphone", label: "Phone", value: state.user.mobile },
    ];

    return details.map((detail, index) => (
      <TouchableOpacity key={index} style={styles.detailItem}>
        <MaterialIcons name={detail.icon} size={24} color={theme.text} />
        <View style={styles.detailContent}>
          <DefaultText style={styles.detailLabel}>{detail.label}</DefaultText>
          <DefaultText style={styles.detailValue}>{detail.value}</DefaultText>
        </View>
        {/* <MaterialIcons name="chevron-right" size={24} color={theme.text2} /> */}
      </TouchableOpacity>
    ));
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authData = await AsyncStorage.getItem('auth');
        if (authData) {
          const {token, user} = JSON.parse(authData)
          console.log("user.fingerprint:", user.fingerprintEnabled);
          setIsFingerprintEnabled(user.fingerprintEnabled);
        }
      } catch (error) {
        console.error('Error retrieving data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <View style={{ height: "90%" }}>
        <View style={{ padding: 10, backgroundColor: theme.background }}>
          <View>
            <DefaultText
              style={{
                fontSize: 35,
                textAlign: "left",
                marginTop: 40,
                marginLeft: 15,
              }}
            >
              Settings
            </DefaultText>
          </View>
          <View style={{ marginHorizontal: 20, marginVertical: 35 }}>
            <DefaultText style={{ fontSize: 20 }}>
              {state.user.name}
            </DefaultText>
          </View>
        </View>

        <View style={styles.settingsContainer}>
          <View style={{ margin: 10 }}>
            <View>
              <DefaultText style={{ fontSize: 12, color: theme.text2 }}>
                Your Profile
              </DefaultText>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(true)}
            >
              <MaterialIcons
                name="person-outline"
                size={25}
                color={theme.text}
              />
              <DefaultText style={{ marginLeft: 15 }}>
                Personal information
              </DefaultText>
            </TouchableOpacity>

            <View style={[styles.button, { justifyContent: "space-between" }]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons
                  name="fingerprint"
                  size={25}
                  color={theme.text}
                />
                <DefaultText style={{ marginLeft: 15 }}>
                  Use Biometrics
                </DefaultText>
              </View>
              <Switch
                trackColor={{ true: "lightgrey", false: "lightgrey" }}
                thumbColor={isFingerprintEnabled ? theme.primary : theme.text}
                onValueChange={toggleSwitch}
                value={isFingerprintEnabled}
              />
            </View>

            <View style={[styles.button, { justifyContent: "space-between" }]}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons name="dark-mode" size={25} color={theme.text} />
                <DefaultText style={{ marginLeft: 15 }}>Dark Mode</DefaultText>
              </View>
              <Switch
                trackColor={{ true: "lightgrey", false: "lightgrey" }}
                thumbColor={mode == "dark" ? theme.primary : theme.text}
                onValueChange={toggleTheme}
                value={mode == "light" ? false : true}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={signOut}>
              <MaterialIcons name="logout" size={25} color={theme.danger} />
              <DefaultText style={{ color: theme.danger, marginLeft: 15 }}>
                Log Out
              </DefaultText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => setDeleteModalVisible(true)}
            >
              <MaterialIcons name="delete" size={25} color={theme.danger} />
              <DefaultText style={{ color: theme.danger, marginLeft: 15 }}>
                Delete Account
              </DefaultText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <FooterList />

      {/* Personal Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={22} color={theme.text} />
              </TouchableOpacity>
              <DefaultText style={styles.modalTitle}>
                Personal Details
              </DefaultText>
              <View></View>
            </View>
            <View style={styles.modalContent}>{renderPersonalDetails()}</View>
          </View>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalContainer}>
          <View style={styles.deleteModalView}>
            <View style={styles.deleteModalContent}>
              <MaterialIcons name="warning" size={50} color={theme.danger} />
              <DefaultText style={styles.deleteModalTitle}>
                Delete Account
              </DefaultText>
              <DefaultText style={styles.deleteModalMessage}>
                Are you sure you want to delete your account?
              </DefaultText>
              <DefaultText style={styles.deleteModalMessage}>
                This action cannot be undone.
              </DefaultText>
            </View>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <DefaultText style={{ textAlign: "center" }}>
                  Cancel
                </DefaultText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteButton]}
                onPress={deleteAcc}
              >
                <DefaultText
                  style={{ textAlign: "center", color: theme.danger }}
                >
                  Delete
                </DefaultText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const createStyles = (theme, mode) => {
  return StyleSheet.create({
    settingsContainer: {
      padding: 20,
      backgroundColor: theme.surface,
      borderTopLeftRadius: 40,
      borderTopRightRadius: 40,
      height: "90%",
    },
    button: {
      padding: 10,
      paddingVertical: 20,
      flexDirection: "row",
      alignItems: "center",
      margin: 5,
      borderBottomWidth: 1,
      borderBottomColor: mode == "dark" ? theme.text2 : theme.secondary,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalView: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: "80%",
      width: "100%",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 15,
    },
    modalTitle: {
      fontSize: 20,
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.secondary,
    },
    detailContent: {
      flex: 1,
      marginLeft: 15,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.text2,
    },
    detailValue: {
      fontSize: 16,
      color: theme.text,
    },
    deleteModalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    deleteModalView: {
      backgroundColor: theme.background,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: "80%",
    },
    deleteModalContent: {
      alignItems: "center",
      marginBottom: 35,
    },
    deleteModalTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginVertical: 15,
      color: theme.danger,
    },
    deleteModalMessage: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 0,
    },
    deleteModalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
    deleteModalButton: {
      borderRadius: 10,
      padding: 10,
      elevation: 1,
      minWidth: "45%",
    },
    cancelButton: {
      backgroundColor: theme.surface,
    },
    deleteButton: {
      backgroundColor: theme.surface,
      borderColor: theme.danger,
      borderWidth: 1,
    },
  });
};

export default Account;
