import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

export const themes = {
  light: {
    background: "#F0F0F0",
    secondary: "#FFFFFF",
    text: "#17181A",
    text2: "#BBBBBB",
    primary: "#D1FF32",
    primary2: "#7FB143",

    statusBarStyle: "dark-content",
  },
  dark: {
    background: "#141414", 
    secondary: "#262626", 
    text: "#ACACAC",
    text2: "#BBBBBB",
    primary: "#D1FF32",
    primary2: "#7FB143", 

    statusBarStyle: "light-content",
  },
};

export const ThemeProvider = ({ children }) => {
  const initialColorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(initialColorScheme == 'light' ? "dark" : 'light');

  useEffect(() => {
    console.log(initialColorScheme);
    const handleAppearanceChange = (pref) => {
        const newScheme = pref.colorScheme;
        setTheme(newScheme == 'light' ? "dark" : 'light');        
    };
    
    const listener = Appearance.addChangeListener(handleAppearanceChange);

    // Cleanup listener on unmount
    return () => {
      listener.remove();
    };

  }, [])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    // Appearance.setColorScheme(prevTheme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[theme], toggleTheme, mode: theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
