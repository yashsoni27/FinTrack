import React, { useEffect } from "react";
import axios from "axios";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useColorScheme, StatusBar, Text } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import Navigation from "./components/navigation";
import { TextInput, Platform } from "react-native";

axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

// const Stack = createNativeStackNavigator();
// const image = { uri: "https://picsum.photos/1600/900" };
function setDefaultFontFamily() {

  const fontFamily = 'Inter';
  // const fontFamily = 'Urbanist';  

  Text.defaultProps = Text.defaultProps || {};
  Text.defaultProps.style = { 
    ...Text.defaultProps.style, 
    fontFamily,     
  };

  TextInput.defaultProps = TextInput.defaultProps || {};
  TextInput.defaultProps.style = { 
    ...TextInput.defaultProps.style, 
    fontFamily,    
  };

  const oldTextRender = Text.render;
  Text.render = function(...args) {
    const origin = oldTextRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [
        origin.props.style,
        {
          fontFamily,          
          ...(Platform.OS === 'ios' ? getFontWeight(origin.props.style?.fontWeight) : {}),
        }
      ]
    });
  };

}

function getFontWeight(weight) {
  if (typeof weight === 'string') {
    switch (weight) {
      case 'normal': return { fontWeight: '400' };
      case 'bold': return { fontWeight: '700' };
      default: return { fontWeight: weight };
    }
  } else if (typeof weight === 'number') {
    return { fontWeight: weight.toString() };
  }
  return {};
}

export default function Page() {
  // const scheme = useColorScheme();

  const [loaded, error] = useFonts({
    "Urbanist": require("../assets/fonts/Urbanist-VariableFont_wght.ttf"),    
    "Inter": require("../assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
  })

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
      if (loaded) {
        setDefaultFontFamily();
      }
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Navigation />
    </>
  );
}
