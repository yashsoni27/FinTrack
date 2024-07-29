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
import TextRecognition from "@react-native-ml-kit/text-recognition";
import FooterList from "../components/footer/footerList";
import { ScrollView } from "react-native";

const Add = () => {
  const [imageUri, setImageUri] = useState(null);
  const [recognizedText, setRecognizedText] = useState("");
  const [extractedInfo, setExtractedInfo] = useState(null);

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
      performOCR(uri);
    }
  };

  const performOCR = async (uri) => {
    try {
      const result = await TextRecognition.recognize(uri);
      // const result = "";
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
      const extractedInfo = extractInfo(structuredText);
      console.log("Extracted Info: ", extractedInfo);
      setExtractedInfo(extractedInfo);
      setRecognizedText(JSON.stringify(extractedInfo, null, 2));
    } catch (error) {
      console.error(error);
    }
  };

  const extractInfo = (structuredText) => {
    const findLine = (regex) =>
      structuredText.find((line) => regex.test(line.text))?.text;

    const totalRegex = /\b(total|total to pay)[ :]*?([£]?[\d,]+\.?\d*)/i;
    let total = "Not found";
    const totalLine = findLine(totalRegex);
    if (totalLine) {
      const match = totalLine.match(totalRegex);
      if (match && match[2]) {
        total = match[2].replace(",", ".").replace(/[$€£]/, "");
      }
    }

    const dateRegex = /\d{2}\/\d{2}\/\d{2}/;
    const date = findLine(dateRegex)?.match(dateRegex)[0] || "Not found";

    let merchantName = "Not found";
    // Look for the first all-caps line that's not "TOTAL" or a date
    const merchantLine = structuredText.find(
      (line) =>
        line.text === line.text.toUpperCase() &&
        line.text.length > 3 &&
        !/TOTAL|RECEIPT|\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/.test(line.text)
    );
    if (merchantLine) {
      merchantName = merchantLine.text;
    }

    return { total, date, merchantName };
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
