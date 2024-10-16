import {
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Markdown from "react-native-markdown-display";
import DefaultText from "../components/defaultText";
import FooterList from "../components/footer/footerList";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";
import { initializeSession, startNewSession, generateResponse } from "../../api/llm";

const LLMChat = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const userId = state.user.userId;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const [prompt, setPrompt] = useState("");
  const [sessionId, setSessionId] = useState("");

  const newChat = async () => {
    const response = await startNewSession(userId);
    console.log("session: ", response);
    setSessionId(response.sessionId);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = { id: Date.now(), text: inputText, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInputText("");

      try {
        const aiResponse = await handleGenerateResponse(inputText);
        const aiMessage = { id: Date.now(), text: aiResponse, sender: "ai" };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      } catch (error) {
        console.error("Error handling AI response:", error);
      }
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === "user" ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <Markdown
        style={StyleSheet.create({
          body: {
            flexShrink: 1,
            color: item.sender === "user" ? theme.background : theme.text2,
          },
        })}
      >
        {item.text}
      </Markdown>
    </View>
  );

  useEffect(() => {
    const sessionInitiate = async () => {
      const response = await initializeSession(userId);
      console.log("session: ", response.sessionId);
      setSessionId(response.sessionId);
      setMessages([]);
      response.contextSequence.forEach((msg, index) => {
        let message = {};
        if (index % 2 == 0) {
          message.text = msg.replace("@#","");
          message.sender = "user";
        }
        else {
          message.text = msg.replace("@#","");;
          message.sender = "ai";
        }
        setMessages((prevMessages) => [...prevMessages, message]);
      })
    };

    sessionInitiate();
  }, []);

  const handleGenerateResponse = async (prompt) => {
    try {
      console.log("session#:   ", sessionId);
      const res = await generateResponse(prompt, sessionId);
      console.log("Response: ", res);
      return res;
    } catch (e) {
      console.log("Error from generateResponse: ", e);
    }
  };

  return (
    <>
      <View
        style={{
          height: "92%",
        }}
      >
        <View
          style={{
            marginTop: 5,
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity style={styles.newChat} onPress={newChat}>
            <MaterialCommunityIcons
              name="chat-plus"
              size={28}
              color={theme.text}
            />
          </TouchableOpacity>
          <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
            LLM Chat
          </DefaultText>
          <View style={{ marginHorizontal: 15 }} />
        </View>
        <View style={styles.container}>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            // keyExtractor={(item) => item.id.toString()}
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
      maxWidth: "85%",
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 20,
      marginVertical: 5,
      flexShrink: 1,
    },
    userMessage: {
      alignSelf: "flex-end",
      backgroundColor: theme.text,
    },
    aiMessage: {
      alignSelf: "flex-start",
      backgroundColor: theme.secondary,
    },
    inputContainer: {
      flexDirection: "row",
      padding: 10,
      marginHorizontal: 15,
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
    newChat: {
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 10,
    },
  });
};

// const markdownStyles = {
//   body: {
//     fontSize: 16,
//   },
//   paragraph: {
//     // marginVertical: 5,
//   },
//   heading1: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginVertical: 8,
//   },
//   heading2: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginVertical: 6,
//   },
//   link: {
//     textDecorationLine: 'underline',
//   },
//   listItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   listItemNumber: {
//     marginRight: 5,
//   },
//   listItemBullet: {
//     marginRight: 5,
//   },
//   listItemContent: {
//     flex: 1,
//   },
//   code_inline: {
//     backgroundColor: 'rgba(128, 128, 128, 0.1)',
//     borderRadius: 3,
//     paddingHorizontal: 4,
//   },
//   code_block: {
//     backgroundColor: 'rgba(128, 128, 128, 0.1)',
//     borderRadius: 5,
//     padding: 10,
//   },
// };
