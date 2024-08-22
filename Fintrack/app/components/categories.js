import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import DefaultText from "./defaultText";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useTheme } from "../context/themeContext";
import { AuthContext } from "../context/auth";
import { useNavigation } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import * as Progress from "react-native-progress";
import { getBudget } from "../../api/db";

const Categories = () => {
  const navigation = useNavigation();
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [isLoading, setIsLoading] = useState(true);
  const [currMonth, setCurrMonth] = useState(new Date().getMonth() + 1);

  const userId = state.user.userId;

  const [budgets, setBudgets] = useState({
    shopping: { budget: 0, spent: 0, emoji: null },
    entertainment: { budget: 0, spent: 0, emoji: null },
    foodAndDrink: { budget: 0, spent: 0, emoji: null },
    transportation: { budget: 0, spent: 0, emoji: null },
    home: { budget: 0, spent: 0, emoji: null },
  });

  const fetchBudget = async (selectedMonth) => {
    try {
      setIsLoading(true);
      const response = await getBudget(userId, selectedMonth);
      console.log("Budget fetched");
      if (response.length > 0) {
        setBudgets({
          Shopping: {
            budget: response[0].category.shopping.budget,
            spent: response[0].category.shopping.spent,
            emoji: "🛍️",
          },
          Entertainment: {
            budget: response[0].category.entertainment.budget,
            spent: response[0].category.entertainment.spent,
            emoji: "🎟️",
          },
          "Food & Drink": {
            budget: response[0].category.foodAndDrink.budget,
            spent: response[0].category.foodAndDrink.spent,
            emoji: "🍕",
          },
          Transportation: {
            budget: response[0].category.transportation.budget,
            spent: response[0].category.transportation.spent,
            emoji: "🚌",
          },
          Home: {
            budget: response[0].category.home.budget,
            spent: response[0].category.home.spent,
            emoji: "🏠",
          },
        });
      }
      // console.log("budgets: ", budgets);
    } catch (error) {
      console.log("Error in fetching budget:  ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget(currMonth);
  }, []);

  return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate("Analysis")}>
        <View style={styles.container}>
          <DefaultText style={styles.text2}>BUDGETS</DefaultText>
          <View style={[styles.container, { alignItems: "center" }]}>
            <DefaultText>categories </DefaultText>
            <MaterialIcons
              style={{}}
              name="chevron-right"
              size={15}
              color={theme.text}
            />
          </View>
        </View>
      </TouchableOpacity>


      {isLoading ? (
        <DefaultText>Loading data...</DefaultText>
      ) : (
        <View style={{ marginTop: 10 }}>
          <View style={styles.container}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
            >
              {Object.entries(budgets).map(
                ([category, { spent, budget, emoji }]) => (
                  <View key={category} style={styles.categoryContainer}>
                    <Progress.Circle
                      progress={spent / budget > 1 ? 1 : spent / budget}
                      color={spent / budget > 1 ? theme.danger : theme.success}
                      size={55}
                      strokeCap="round"
                      borderWidth={0}
                      showsText={true}
                      formatText={() => (
                        <DefaultText style={{ fontSize: 25 }}>
                          {emoji}
                        </DefaultText>
                      )}
                    />
                    <DefaultText style={{ marginTop: 5 }}>
                      £{" "}
                      {budget - spent > 0
                        ? Math.round(budget - spent)
                        : Math.round(spent - budget)}
                    </DefaultText>
                    <DefaultText style={styles.text2}>
                      {budget - spent > 0 ? "left" : "over"}
                    </DefaultText>
                  </View>
                )
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default Categories;

const createStyles = (theme) => {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    categoryContainer: {
      alignItems: "center",
      // paddingHorizontal: 1,
      marginRight: 18,
    },
    text2: {
      color: theme.text2,
    },
  });
};
