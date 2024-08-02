import React, { useEffect, useState } from "react";
import axios from "axios";
import { useColorScheme, StatusBar, Appearance } from "react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import Navigation from "./components/navigation";
import { ThemeProvider } from "./context/themeContext";
import { themes } from "./context/themeContext";

axios.defaults.baseURL = process.env.EXPO_PUBLIC_SERVER_URL;

// const Stack = createNativeStackNavigator();
// const image = { uri: "https://picsum.photos/1600/900" };

export default function Page() {  
    
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(colorScheme);  

  useEffect(() => {
    setTheme(colorScheme === 'dark' ? themes.dark : themes.light);    
    console.log(colorScheme);
  }, [colorScheme]);


  const [fontsLoaded] = useFonts({
    Urbanist: require("../assets/fonts/Urbanist-VariableFont_wght.ttf"),
    Inter: require("../assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <ThemeProvider>
        <StatusBar
          backgroundColor={theme.background}
          barStyle={theme.statusBarStyle}
        />
        <Navigation />
      </ThemeProvider>
    </>
  );
}
