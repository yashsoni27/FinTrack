import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [state, setState] = useState({
        user: null,
        token: "",
        onBoarded: false,
    });

    useEffect(() => {
        const loadFromAsyncStorage = async () => {
            let data = await AsyncStorage.getItem("auth");
            const parsed = JSON.parse(data);
            console.log("parsed: ", parsed);
            setState({ ...state, user: parsed.user, token: parsed.token, onBoarded: parsed.onBoarded });
        };
        loadFromAsyncStorage();
    }, []);

    return (
        <AuthContext.Provider value={[ state, setState ]}>
            {children}
        </AuthContext.Provider>
    );    
};

export { AuthContext, AuthProvider };