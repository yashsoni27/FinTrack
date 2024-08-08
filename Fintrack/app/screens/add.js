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
} from "react-native";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import RNFS from "react-native-fs";
import FooterList from "../components/footer/footerList";
import { ScrollView } from "react-native";
import { scanInvoice, scanReceipt } from "../../api/ocr";
import DefaultText from "../components/defaultText";

const Add = () => {
  const [imageUri, setImageUri] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");

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
      // const response = await scanReceipt(imageData);

      // setRecognizedText(JSON.stringify(response.receiptData, null, 2));
      // console.log("Upload successful:", response.receiptData);

      const response = await scanInvoice(formData);
      console.log("tesseract upload successful:", response);
      console.log("tesseract upload successful:", response.text);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
      <View>
        <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
          Add Transaction
        </DefaultText>
      </View>
      <View style={{marginTop: 20}}>
        <Button title="Choose Photo" onPress={handleChoosePhoto} />
        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <ScrollView style={styles.textContainer}>
              <DefaultText>{recognizedText}</DefaultText>
            </ScrollView>
          </>
        )}
      </View>
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
