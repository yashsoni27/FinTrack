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
import { scanReceipt } from "../../api/ocr";

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
      includeBase64: true,
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
    try {
      const imageData = await RNFS.readFile(uri, "base64");
      const response = await scanReceipt(imageData);

      setRecognizedText(JSON.stringify(response.receiptData, null, 2));
      console.log("Upload successful:", response.receiptData);

    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };



  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "space-between", alignItems: "center" }}
    >
      <Text style={{ fontSize: 30, textAlign: "center" }}>
        Add your spending Screen
      </Text>
      <View>
        <Button title="Choose Photo" onPress={handleChoosePhoto} />
        {imageUri && (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <ScrollView style={styles.textContainer}>
              <Text>{recognizedText}</Text>
            </ScrollView>
          </>
        )}
      </View>
      <FooterList />
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
