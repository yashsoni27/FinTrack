import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Image,
  Button,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import RNFS from "react-native-fs";
import FooterList from "../components/footer/footerList";
import { ScrollView } from "react-native";
import { scanInvoice, scanReceipt } from "../../api/ocr";
import DefaultText from "../components/defaultText";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

const Add = () => {
  const [imageUri, setImageUri] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [date, setDate] = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");

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

      setRecognizedText(JSON.stringify(response.receiptData, null, 2));

      // const response = await scanInvoice(formData);
      // console.log("tesseract upload successful:", response);
      // console.log("tesseract upload successful:", response.text);

      // const parsedDate = "2023-08-09"; // Replace with extracted date
      // const parsedMerchant = "Merchant XYZ"; // Replace with extracted merchant name
      // const parsedAmount = "123.45";

      setDate(response.receiptData.date);
      setAmount(response.receiptData.amount);
      setMerchantName(response.receiptData.merchantName);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <SafeAreaView style={{ padding: 15 }}>
      <FontAwesome5Icon
        style={{ alignSelf: "flex-end", padding: 10 }}
        name="times"
        size={15}
      />
      <DefaultText
        style={{ fontSize: 30, textAlign: "center", marginBottom: 20 }}
      >
        Add Transaction
      </DefaultText>

      <ScrollView style={{ marginTop: 20 }}>
        <Button title="Choose Photo" onPress={handleChoosePhoto} />
        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <View style={styles.textContainer}>
              <DefaultText>{recognizedText}</DefaultText>
            </View>
          </>
        )}

        <View style={styles.inputContainer}>
          <DefaultText style={styles.label}>Date</DefaultText>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />

          <DefaultText style={styles.label}>Merchant Name</DefaultText>
          <TextInput
            style={styles.input}
            placeholder="Merchant Name"
            value={merchantName}
            onChangeText={setMerchantName}
          />

          <DefaultText style={styles.label}>Amount</DefaultText>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Button title="Save Transaction" />
        </View>
      </ScrollView>
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
});

export default Add;
