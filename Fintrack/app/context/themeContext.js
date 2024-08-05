import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

const ThemeContext = createContext();

export const themes = {
  light: {
    background: "#ffffff",
    text: "#000000",
    primary: "#3498db",
    statusBarStyle: "dark-content",
  },
  dark: {
    // background: "#17181A", // darkgrey
    background: "#262626", // darkgrey
    text: "#ffffff",
    primary: "#B4F077", // lightgreen
    statusBarStyle: "light-content",
  },
};

export const ThemeProvider = ({ children }) => {
  const initialColorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(initialColorScheme == 'dark' ? "dark" : 'light');
//   Appearance.setColorScheme("light");

  useEffect(() => {
    const handleAppearanceChange = (pref) => {
        const newScheme = pref.colorScheme;
        setTheme(newScheme == 'dark' ? "dark" : 'light');
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
