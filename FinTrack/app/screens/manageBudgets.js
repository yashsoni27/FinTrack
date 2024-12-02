import { StyleSheet, TouchableOpacity, TextInput, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import DefaultText from "../components/defaultText";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../context/themeContext";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/auth";
import { getBudget, setBudget } from "../../api/db";

const ManageBudgets = () => {
  const [state, setState] = useContext(AuthContext);
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [currMonth, setCurrMonth] = useState(new Date().getMonth() + 1);
  const [budgets, setBudgets] = useState({
    totalSpending: 0,
    shopping: 0,
    entertainment: 0,
    foodAndDrink: 0,
    transportation: 0,
    home: 0,
    other: 0,
  });

  const userId = state.user.userId;

  const handleInputChange = (category, value) => {
    setBudgets((prevBudgets) => ({
      ...prevBudgets,
      [category]: value,
    }));
  };

  const fetchBudget = async (selectedMonth) => {
    try {
      const response = await getBudget(userId, selectedMonth);
      if (response.length > 0) {
        setBudgets({
          totalSpending: response[0].budget || 0,
          shopping: response[0].category.shopping.budget || 0,
          entertainment: response[0].category.entertainment.budget || 0,
          foodAndDrink: response[0].category.foodAndDrink.budget || 0,
          transportation: response[0].category.transportation.budget || 0,
          home: response[0].category.home.budget || 0,
          other: response[0].category.other.budget || 0,
        })
      }
    } catch (error) {
      console.log("Error in fetching budget: ", error);
    }
  };

  const saveBudget = async () => {
    try {
      const response = await setBudget(userId, budgets);
      console.log("save response: ", response);
    } catch (error) {
      console.log("Error in saving budget: ", error);
    }
  };

  useEffect(() => {
    fetchBudget(currMonth);
  }, []);

  return (
    <>
      <View style={{ margin: 10 }}>
        <View style={styles.header}>
          <MaterialIcons name="close" size={20} color={theme.text} onPress={() => navigation.goBack()}/>
          <DefaultText style={{ fontSize: 18 }}>Your budget</DefaultText>
          <View></View>
        </View>
        <View style={{ margin: 10 }}>
          <View style={{ marginBottom: 20 }}>
            <DefaultText>Your monthly spending budget</DefaultText>
          </View>
          <View style={styles.sectionContainer}>
            <DefaultText>Total spending</DefaultText>
            <View style={styles.section}>
              <DefaultText>£</DefaultText>
              <TextInput
                placeholder="0"
                style={styles.inputField}
                keyboardType="numeric"
                
                value={budgets.totalSpending.toString()}
                onChangeText={(value) =>
                  handleInputChange("totalSpending", value)
                }
              />
            </View>
          </View>
        </View>
        <View style={{ margin: 10 }}>
          <View style={{ marginBottom: 20 }}>
            <DefaultText>Your category budgets</DefaultText>
          </View>
          <View style={styles.sectionContainer}>
            <DefaultText>Shopping</DefaultText>
            <View style={styles.section}>
              <DefaultText>£</DefaultText>
              <TextInput
                placeholder="0"
                style={styles.inputField}
                keyboardType="numeric"
                value={budgets.shopping.toString()}
                onChangeText={(value) => handleInputChange("shopping", value)}
              />
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <DefaultText>Entertainment</DefaultText>
            <View style={styles.section}>
              <DefaultText>£</DefaultText>
              <TextInput
                placeholder="0"
                style={styles.inputField}
                keyboardType="numeric"
                value={budgets.entertainment.toString()}
                onChangeText={(value) =>
                  handleInputChange("entertainment", value)
                }
              />
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <DefaultText>Food & Drink</DefaultText>
            <View style={styles.section}>
              <DefaultText>£</DefaultText>
              <TextInput
                placeholder="0"
                style={styles.inputField}
                keyboardType="numeric"
                value={budgets.foodAndDrink.toString()}
                onChangeText={(value) =>
                  handleInputChange("foodAndDrink", value)
                }
              />
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <DefaultText>Transportation</DefaultText>
            <View style={styles.section}>
              <DefaultText>£</DefaultText>
              <TextInput
                placeholder="0"
                style={styles.inputField}
                keyboardType="numeric"
                value={budgets.transportation.toString()}
                onChangeText={(value) =>
                  handleInputChange("transportation", value)
                }
              />
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <DefaultText>Home</DefaultText>
            <View style={styles.section}>
              <DefaultText>£</DefaultText>
              <TextInput
                placeholder="0"
                style={styles.inputField}
                keyboardType="numeric"
                value={budgets.home.toString()}
                onChangeText={(value) =>
                  handleInputChange("home", value)
                }
              />
            </View>
          </View>
          <View style={styles.sectionContainer}>
            <DefaultText>Other</DefaultText>
            <View style={styles.section}>
              <DefaultText>£</DefaultText>
              <TextInput
                placeholder="0"
                style={styles.inputField}
                keyboardType="numeric"
                value={budgets.other.toString()}
                onChangeText={(value) => handleInputChange("other", value)}
              />
            </View>
          </View>
        </View>
        <View style={{ margin: 10 }}>
          <TouchableOpacity
            onPress={() => saveBudget()}
            style={styles.buttonStyle}
          >
            <DefaultText style={styles.buttonText}>Set my budget</DefaultText>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default ManageBudgets;

const createStyles = (theme) => {
  return StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 10,
      margin: 10,
    },
    inputField: {
      // borderBottomWidth: 0.5,
      paddingLeft: 3,
      width: 30,
      borderBottomColor: "#8e93a1",
      color: theme.text,
    },
    sectionContainer: {
      margin: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: 10,
      borderBottomWidth: 0.5,
      borderBottomColor: "#8e93a1",
    },
    section: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    buttonStyle: {
      backgroundColor: theme.surface,
      height: 50,
      margin: 20,
      justifyContent: "center",
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.text2,
      // width: "80%",
    },
    buttonText: {
      fontSize: 15,
      textAlign: "center",
      color: theme.text,
      textTransform: "capitalize",
    },
  });
};
