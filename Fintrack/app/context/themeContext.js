import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

export const themes = {
  light: {
    background: "#DCDEE0",
    secondary: "#DCDDD0",
    text: "#000000",
    // primary: "#D1FF32",
    primary: "#7FB143",

    statusBarStyle: "dark-content",
  },
  dark: {
    background: "#17181A", 
    secondary: "#262626", 
    text: "#ffffff",
    primary: "#B4F077",

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
    <ThemeContext.Provider value={{ theme: themes[theme], toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
