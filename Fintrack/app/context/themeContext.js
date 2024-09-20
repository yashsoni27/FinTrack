import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

export const themes = {
  light: {
    background: "#F2F4F8",
    surface: "#FFFFFF",
    text: "#2D2D2D",
    text2: "#6E6E6E",
    primary: "#D1FF32",
    primary2: "#7FB143",
    secondary: "#DCDEE0",
    success: "#04C700",
    danger: "#dE0000",

    statusBarStyle: "dark-content",
  },
  dark: {
    background: "#1B1B1B", 
    surface: "#242424",
    text: "#EAEAEA",
    text2: "#9E9E9E",
    primary: "#D1FF32",
    primary2: "#7FB143", 
    secondary: "#262626",
    success: "#04C700",
    danger: "#dE0000",  

    statusBarStyle: "light-content",
  },
};

export const ThemeProvider = ({ children }) => {
  const initialColorScheme = Appearance.getColorScheme(); // Getting the system theme
  const [theme, setTheme] = useState(initialColorScheme == 'light' ? "dark" : 'light');

  useEffect(() => {
    const handleAppearanceChange = (pref) => {
        const newScheme = pref.colorScheme;
        setTheme(newScheme == 'light' ? "dark" : 'light');        
    };    
    const listener = Appearance.addChangeListener(handleAppearanceChange);

    return () => {
      listener.remove();
    };

  }, [])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[theme], toggleTheme, mode: theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
