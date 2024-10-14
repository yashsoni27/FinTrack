import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DefaultText from "../components/defaultText";
import FooterList from "../components/footer/footerList";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";

const LLMChat = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [sessionId, setSessionId] = useState("");

  const sendMessage = () => {
    if (inputText.trim()) {
      setMessages([
        ...messages,
        { id: Date.now(), text: inputText, sender: "user" },
      ]);
      setInputText("");
      // Here you would typically call your LLM API and add the response
      // For demonstration, we'll just add a mock response
      setTimeout(() => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: Date.now(),
            text: "This is a mock LLM response.",
            sender: "ai",
          },
        ]);
      }, 1000);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <DefaultText
        style={[
          item.sender == "user"
            ? { color: theme.background }
            : { color: theme.text2 },
        ]}
      >
        {item.text}
      </DefaultText>
    </View>
  );

  // useEffect(() => {
  //   const initializeSession = async () => {
  //     const newSessionId = await startNewSession();
  //     setSessionId(newSessionId);
  //   };

  //   initializeSession();
  // }, []);

  // const handleGenerateResponse = async () => {
  //   const res = await generateResponseFromAI(prompt, sessionId);
  //   setResponse(res);
  // };

  return (
    <>
      <View
        style={{
          height: "92%",
        }}
      >
        <View style={{ marginBottom: 10 }}>
          <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
            LLM Chat
          </DefaultText>
        </View>
        <View style={styles.container}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messageList}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type a message..."
              placeholderTextColor={theme.text2}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <MaterialIcons name="send" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <FooterList />
    </>
  );
};

export default LLMChat;

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    messageList: {
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
    messageBubble: {
      maxWidth: "80%",
      padding: 12,
      borderRadius: 20,
      marginVertical: 5,
    },
    userMessage: {
      alignSelf: "flex-end",
      backgroundColor: theme.text,
      // color: theme.background,
    },
    aiMessage: {
      alignSelf: "flex-start",
      backgroundColor: theme.secondary,
      // color: theme.text,
    },
    messageText: {
      // fontSize: 16,
      // color: theme.background,
    },
    inputContainer: {
      flexDirection: "row",
      padding: 10,
      backgroundColor: theme.background,
    },
    input: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      fontSize: 16,
      marginRight: 10,
    },
    sendButton: {
      justifyContent: "center",
      alignItems: "center",
    },
  });
};
