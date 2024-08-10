import React, { useContext, useState } from "react";
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
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from "@react-navigation/native";
import { saveTransactionDb } from "../../api/db";
import { AuthContext } from "../context/auth";

const Add = () => {
  const [state, setState] = useContext(AuthContext);
  const [imageUri, setImageUri] = useState(null);
  const navigation = useNavigation();

  const userId = state.user.userId;

  const [date, setDate] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState();
  const [desc, setDesc] = useState("");

  const handleChoosePhoto = () => {
    Alert.alert(
      "Select Option",
      "Choose an option to pick an image",
      [
        {
          text: "Camera",
          onPress: () => handleImagePicker("camera"),
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
      console.log("data: ", date, amount, merchantName);
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

  return (
    <SafeAreaView style={{ flex: 1, padding: 15 }}>
      <FontAwesome5Icon
        style={{ alignSelf: "flex-end", padding: 10 }}
        name="times"
        size={15}
        onPress={() => navigation.goBack()}
      />
      <DefaultText
        style={{ fontSize: 30, textAlign: "center", marginBottom: 10 }}
      >
        Add Transaction
      </DefaultText>

      <KeyboardAwareScrollView
        style={{ marginTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <Button title="Choose Photo" onPress={handleChoosePhoto} />
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
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            type="date"
            value={date}
            onChangeText={(e) => setDate(e)}
          />

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

          {/* <Button title="Save Transaction" onPress={saveTransaction} /> */}
          <TouchableOpacity
            style={{ backgroundColor: "#2196F3" }}
            onPress={saveTransaction}
          >
            <DefaultText
              style={{
                color: "white",
                fontSize: 15,
                textAlign: "center",
                padding: 10,
              }}
            >
              Save Transaction
            </DefaultText>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      {/* <FooterList /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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

export default Add;
