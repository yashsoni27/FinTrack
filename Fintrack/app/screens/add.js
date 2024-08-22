import React, { useContext, useEffect, useState } from "react";
import {
  View,
  SafeAreaView,
  Image,
  Button,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import RNFS from "react-native-fs";
import { scanInvoice, scanReceipt } from "../../api/ocr";
import DefaultText from "../components/defaultText";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from "@react-navigation/native";
import { saveTransactionDb } from "../../api/db";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const Add = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const userId = state.user.userId;

  const [imageUri, setImageUri] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState();
  const [desc, setDesc] = useState(""); 

  const [saveDisabled, setSaveDisabled] = useState(true);

  const handleChoosePhoto = () => {
    Alert.alert(
      "Select Option",
      "Choose an option to pick an image",
      [
        {
          text: "Camera",
          onPress: () => handleImagePicker("camera"),
          style: "default",
        },
        {
          text: "Gallery",
          onPress: () => handleImagePicker("gallery"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handleImagePicker = (type) => {
    const options = {
      mediaType: "photo",
      includeBase64: true, // change to true for basic
    };

    if (type === "camera") {
      launchCamera(options, (response) => {
        handleImageResponse(response);
      });
    } else if (type === "gallery") {
      launchImageLibrary(options, (response) => {
        handleImageResponse(response);
      });
    }
  };

  const handleImageResponse = (response) => {
    if (response.didCancel) {
      console.log("User cancelled image picker");
    } else if (response.error) {
      console.log("ImagePicker Error: ", response.error);
    } else if (response.assets && response.assets.length > 0) {
      const uri = response.assets[0].uri;
      setImageUri(uri);
      extractInfo(uri);
    }
  };

  const extractInfo = async (uri) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg", // Adjust MIME type if necessary
      name: "photo.jpg",
    });
    try {
      const imageData = await RNFS.readFile(uri, "base64");
      const response = await scanReceipt(imageData);
      console.log("OCR Upload successful:", response);

      // const response = await scanInvoice(formData);
      // console.log("tesseract upload successful:", response);
      // console.log("tesseract upload successful:", response.text);

      setDate(response.receiptData.date);
      setAmount(response.receiptData.amount);
      setMerchantName(response.receiptData.merchantName);
      console.log("data: ", response);
    } catch (error) {
      console.error("Error uploading image: ", error);
    }
  };

  const saveTransaction = async () => {
    try {
      const transactionData = {
        userId,
        date,
        amount,
        merchantName,
        desc,
      };
      const response = await saveTransactionDb(transactionData);
      console.log("Transaction saved from DB", response);
    } catch (error) {
      console.log("Error in saving transactions:  ", error);
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  useEffect(() => {
    if (date != "" && amount!= ""  && merchantName != "") {
      setSaveDisabled(false);
    } else {
      setSaveDisabled(true);
    }
  }, [date, amount, merchantName])
  

  return (
    <View style={{ padding: 15 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <DefaultText
          style={{
            fontSize: 30,
            textAlign: "center",
            flex: 1,
            alignItems: "center",
          }}
        >
          Add Transaction
        </DefaultText>
        <MaterialIcons
          style={{ alignItems: "flex-end" }}
          name="close"
          size={20}
          onPress={() => navigation.goBack()}
        />
      </View>

      <KeyboardAwareScrollView
        style={{ marginTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.button} onPress={handleChoosePhoto}>
          <DefaultText style={styles.buttonText}>Scan Receipt</DefaultText>
        </TouchableOpacity>
        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} />
            {/* <View style={styles.textContainer}>
              <DefaultText>{recognizedText}</DefaultText>
            </View> */}
          </>
        )}

        <View style={styles.inputContainer}>
          <DefaultText style={styles.label}>Date</DefaultText>
          <TouchableOpacity onPress={showDatePickerModal}>
            <View pointerEvents="none">
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={date ? date.toLocaleDateString() : ""}
              />
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onChange}
              />
            )}
          </TouchableOpacity>

          <DefaultText style={styles.label}>Merchant Name</DefaultText>
          <TextInput
            style={styles.input}
            placeholder="Merchant Name"
            value={merchantName}
            onChangeText={(e) => setMerchantName(e)}
          />

          <DefaultText style={styles.label}>Amount</DefaultText>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={(e) => setAmount(e)}
          />

          <DefaultText style={styles.label}>Description</DefaultText>
          <TextInput
            style={styles.input}
            placeholder="Short info"
            value={desc}
            onChangeText={(e) => setDesc(e)}
          />

          <TouchableOpacity
            style={[styles.button, saveDisabled ? styles.disabledButton : null]}
            onPress={saveTransaction}
            disabled={saveDisabled}
          >
            <DefaultText style={styles.buttonText}>
              Save Transaction
            </DefaultText>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      {/* <FooterList /> */}
    </View>
  );
};

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
    },
    image: {
      width: 200,
      height: 200,
      marginVertical: 16,
    },
    button: {
      // backgroundColor: theme.primary2,
      backgroundColor: theme.text,
      borderRadius: 20,
    },
    buttonText: {
      color: theme.surface,
      // color: theme.text,
      // fontSize: 15,
      // fontWeight: "bold",
      textAlign: "center",
      padding: 10,
    },
    disabledButton: {
      opacity: 0.75
    },
    textContainer: {
      flex: 1,
      marginTop: 16,
    },
    inputContainer: {
      marginTop: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 8,
    },
    input: {
      height: 40,
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 5,
      paddingHorizontal: 10,
      marginBottom: 16,
    },
  });
};

export default Add;
