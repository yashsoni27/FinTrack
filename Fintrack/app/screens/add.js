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
import TextRecognition from "@react-native-ml-kit/text-recognition";
import { scanReceipt } from "../../api/ocr";
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
      // extractInfo(uri); // Mindee API
      performOCR(uri);  // ml-kit with regex
    }
  };

  const performOCR = async (uri) => {
    try {
      const result = await TextRecognition.recognize(uri);
      let structuredText = [];

      result.blocks.forEach((block, blockIndex) => {
        block.lines.forEach((line, lineIndex) => {
          structuredText.push({
            text: line.text,
            blockIndex,
            lineIndex,
            frame: line.frame,
          });
        });
      });
      console.log("Structured Text: ", structuredText);
      const {total, date, merchantName} = extractOCRInfo(structuredText);
      console.log("Extracted Info: ", total, date, merchantName);
      const dateObj = stringToDate(date);
      console.log("Date Obj: ", dateObj);

      setDate(dateObj);
      setAmount(total);
      setMerchantName(merchantName);
    } catch (error) {
      console.error(error);
    }
  };

  const extractOCRInfo = (structuredText) => {
    const findLine = (regex) => 
      structuredText.find((line) => regex.test(line.text))?.text;

    // Regex for finding the total amount
    const totalRegex = /\b(total|total to pay|card)[ :]*?([£]?[\d,]+\.?\d*)/i;
    let total = "Not found";
    const totalLine = findLine(totalRegex);
    if (totalLine) {
      const match = totalLine.match(totalRegex);
      if (match && match[2]) {
        total = match[2].replace(",", ".").replace(/[$€£]/, "");
      }
    }

    // Regex for finding the date 
    const dateRegex = /\d{2}\/\d{2}\/\d{2}/;
    const date = findLine(dateRegex)?.match(dateRegex)[0] || "Not found";

    let merchantName = "Not found";
    // Looking for the first line that's not TOTAL or a date
    const merchantLine = structuredText.find(
      (line) =>
        line.text.length > 3 &&
        !/TOTAL|RECEIPT|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(line.text)
    );
    if (merchantLine) {
      merchantName = merchantLine.text;
    }

    return { total, date, merchantName };
  };

  const stringToDate = (dateString) => {
    const parts = dateString.split("/");
    const year = parseInt(parts[2]) + (parts[2].length === 2 ? 2000 : 0);
    const month = parseInt(parts[1]) - 1; // Months are 0-based in JavaScript
    const day = parseInt(parts[0]);
    return new Date(year, month, day);
  };

  // Mindee API (backup) for receipt scanning 
  const extractInfo = async (uri) => {
    try {
      const imageData = await RNFS.readFile(uri, "base64");
      const response = await scanReceipt(imageData);
      console.log("OCR Upload successful:", response);

      console.log("data: ", response);

      setDate(response.receiptData.date);
      setAmount(response.receiptData.amount);
      setMerchantName(response.receiptData.merchantName);
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
      navigation.goBack()
      navigation.navigate("Transactions");
    } catch (error) {
      console.log("Error in saving transactions:  ", error);
      
    }
  };

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  useEffect(() => {
    if (date != "" && amount != "" && merchantName != "") {
      setSaveDisabled(false);
    } else {
      setSaveDisabled(true);
    }
  }, [date, amount, merchantName]);

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
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
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
      backgroundColor: theme.text,
      borderRadius: 20,
    },
    buttonText: {
      color: theme.surface,
      textAlign: "center",
      padding: 10,
    },
    disabledButton: {
      opacity: 0.75,
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
      textTransform: "capitalize",
    },
  });
};

export default Add;
