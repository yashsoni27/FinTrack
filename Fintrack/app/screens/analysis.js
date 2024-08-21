import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FooterList from "../components/footer/footerList";
import DefaultText from "../components/defaultText";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";
import { LineChart } from "react-native-gifted-charts";
import { getBudget, getChartData } from "../../api/db";
import CircularProgress from "react-native-circular-progress-indicator";
import * as Progress from "react-native-progress";
import { useNavigation } from "@react-navigation/native";

const Analysis = () => {
  const navigation = useNavigation();
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [isLoading, setIsLoading] = useState(true);
  const [currMonth, setCurrMonth] = useState(new Date().getMonth() + 1);

  const [selectedTab, setSelectedTab] = useState("budget");

  const [budgets, setBudgets] = useState({
    spent: 0,
    budget: 0,
    shopping: { budget: 0, spent: 0 },
    entertainment: { budget: 0, spent: 0 },
    foodAndDrink: { budget: 0, spent: 0 },
    transportation: { budget: 0, spent: 0 },
    home: { budget: 0, spent: 0 },
    other: { budget: 0, spent: 0 },
  });

  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [pctChange, setPctChange] = useState({});

  const userId = state.user.userId;

  const fetchChartData = async (selectedMonth) => {
    try {
      setIsLoading(true);
      const response = await getChartData(userId, 0, selectedMonth);
      const currMonthData = response.currMonthData;
      const prevMonthData = response.prevMonthData;
      // console.log("currMonth: ", currMonthData);
      // console.log("prevMonth: ", prevMonthData);

      setIncomeData(currMonthData.income);
      setExpenseData(currMonthData.expense);

      let currMonthIncom = currMonthData.income;
      let currMonthExpense = currMonthData.expense;
      // console.log("currMonthIncome: ", currMonthIncom.slice(-1)[0].value);
      // console.log("currMonthExpense: ", currMonthExpense.slice(-1)[0].value);

      let prevMonthIncome = prevMonthData.income;
      let prevMonthExpense = prevMonthData.expense;
      // console.log("prevMonthIncome: ", prevMonthIncome.slice(-1)[0].value);
      // console.log("prevMonthExpense: ", prevMonthExpense.slice(-1)[0].value);

      const currMonthIncomeValue = currMonthIncom.slice(-1)[0].value;
      const currMonthExpenseValue = currMonthExpense.slice(-1)[0].value;
      const prevMonthIncomeValue = prevMonthIncome.slice(-1)[0].value;
      const prevMonthExpenseValue = prevMonthExpense.slice(-1)[0].value;

      const incomeChange =
        ((currMonthIncomeValue - prevMonthIncomeValue) / prevMonthIncomeValue) *
        100;
      const expenseChange =
        ((currMonthExpenseValue - prevMonthExpenseValue) /
          prevMonthExpenseValue) *
        100;

      // console.log("Income percentage change:", incomeChange.toFixed(2) + "%");
      // console.log("Expense percentage change:", expenseChange.toFixed(2) + "%");
      setPctChange({
        incomepct: incomeChange.toFixed(2),
        expensepct: expenseChange.toFixed(2),
      });
      // console.log("pctChange: ", pctChange);
    } catch (error) {
      console.log("Error in fetching chart data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBudget = async (selectedMonth) => {
    try {
      setIsLoading(true);
      const response = await getBudget(userId, selectedMonth);
      if (response.length > 0) {
        setBudgets({
          spent: response[0].spent || 0,
          budget: response[0].budget || 0,
          shopping: {
            budget: response[0].category.shopping.budget,
            spent: response[0].category.shopping.spent,
          },
          entertainment: {
            budget: response[0].category.entertainment.budget,
            spent: response[0].category.entertainment.spent,
          },
          foodAndDrink: {
            budget: response[0].category.foodAndDrink.budget,
            spent: response[0].category.foodAndDrink.spent,
          },
          transportation: {
            budget: response[0].category.transportation.budget,
            spent: response[0].category.transportation.spent,
          },
          home: {
            budget: response[0].category.home.budget,
            spent: response[0].category.home.spent,
          },
          other: {
            budget: response[0].category.other.budget,
            spent: response[0].category.other.spent,
          },
        });
      }
      console.log("budgets: ", budgets);
    } catch (error) {
      console.log("Error in fetching budget:  ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData(currMonth);
    fetchBudget(currMonth);
  }, []);

  const renderChart = () => {
    if (isLoading) {
      return <DefaultText>Loading data...</DefaultText>;
    }

    if (expenseData.length === 0 && incomeData.length === 0) {
      return <DefaultText>No data for this month</DefaultText>;
    }

    return (
      <>
        <View>
          <LineChart
            areaChart
            curved
            curvature={0.1}
            data={expenseData}
            data2={incomeData}
            color1="red"
            color2="green"
            startFillColor1="red"
            startFillColor2="green"
            startOpacity={0.5}
            endOpacity={0}
            width={Dimensions.get("window").width - 35}
            height={150}
            thickness={2}
            // noOfSections={5}
            spacing={12}
            initialSpacing={10}
            endSpacing={0}
            hideDataPoints
            hideRules
            hideYAxisText
            yAxisOffset={1}
            disableScroll={true}
            hideAxesAndRules
            pointerConfig={{
              pointer1Color: "red",
              pointer2Color: "green",
              radius: 3,
              activatePointersOnLongPress: true,
              autoAdjustPointerLabelPosition: true,
              pointerLabelWidth: 50,
              pointerLabelComponent: (items) => {
                return (
                  <>
                    <View
                      style={{
                        backgroundColor: theme.secondary,
                        borderRadius: 4,
                        justifyContent: "center",
                        flex: 1,
                        alignItems: "center",
                      }}
                    >
                      <DefaultText style={{ color: theme.text }}>
                        {items[0].value}
                      </DefaultText>
                    </View>
                    <View
                      style={{
                        // height: 20,
                        // width: 70,
                        backgroundColor: theme.secondary,
                        borderRadius: 4,
                        justifyContent: "center",
                        flex: 1,
                        alignItems: "center",
                      }}
                    >
                      <DefaultText style={{ color: theme.text }}>
                        {items[1].value}
                      </DefaultText>
                    </View>
                  </>
                );
              },
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            flex: 1,
            margin: 10,
            // borderWidth: 1,
          }}
        >
          <View
            style={{
              padding: 10,
              margin: 10,
              // borderWidth: 1,
              alignItems: "center",
            }}
          >
            <DefaultText style={{ fontSize: 18 }}>Income</DefaultText>
            <DefaultText>£ {incomeData.slice(-1)[0].value}</DefaultText>
            <DefaultText>{pctChange.incomepct}%</DefaultText>
          </View>
          <View
            style={{
              padding: 10,
              margin: 10,
              // borderWidth: 1,
              alignItems: "center",
            }}
          >
            <DefaultText style={{ fontSize: 18 }}>Expense</DefaultText>
            <DefaultText>£ {expenseData.slice(-1)[0].value}</DefaultText>
            <DefaultText>{pctChange.expensepct}%</DefaultText>
          </View>
        </View>
      </>
    );
  };

  const renderBudget = () => {
    if (isLoading) {
      return <DefaultText>Loading data...</DefaultText>;
    }

    return (
      <>
        <View style={{ margin: 10 }}>
          <View style={styles.budgetGraphContainer}>
            <View style={styles.budgetContainer}>
              <DefaultText style={{ fontSize: 20 }}>
                <DefaultText style={{ fontSize: 14 }}>£</DefaultText>{" "}
                {budgets.budget}
              </DefaultText>
              <DefaultText>total budget</DefaultText>
            </View>
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <CircularProgress
                radius={40}
                value={
                  budgets.spent > budgets.budget
                    ? budgets.budget
                    : budgets.spent
                }
                maxValue={budgets.budget}
                duration={1000}
                activeStrokeWidth={10}
                activeStrokeColor={theme.text}
                inActiveStrokeWidth={15}
                inActiveStrokeColor={theme.secondary}
                showProgressValue={false}
              />
            </View>
            <View style={[styles.budgetContainer, { alignItems: "flex-end" }]}>
              <DefaultText style={{ fontSize: 20 }}>
                <DefaultText style={{ fontSize: 14 }}>£</DefaultText>{" "}
                {budgets.budget - budgets.spent < 0
                  ? 0
                  : // : Math.round(budgets.budget - budgets.spent) * 100 / 100}
                    (budgets.budget - budgets.spent).toFixed(2)}
              </DefaultText>
              <DefaultText>left to spend</DefaultText>
            </View>
          </View>

          <View style={styles.categoryContainer}>
            <View style={[styles.row, {marginBottom: 12}]}>
              <View></View>
              <DefaultText style={{ fontWeight: "bold" }}>SPENT</DefaultText>
              <DefaultText style={{ fontWeight: "bold" }}>BUDGET</DefaultText>
            </View>
            <View style={styles.row}>
              <DefaultText>Shopping</DefaultText>
              <View style={styles.progressContainer}>
                <DefaultText style={styles.budgetAmount}>
                  £{Math.round(budgets.shopping.spent)}
                </DefaultText>
                <Progress.Bar
                  progress={
                    budgets.shopping.spent / budgets.shopping.budget > 1
                      ? 1
                      : budgets.shopping.spent / budgets.shopping.budget
                  }
                  color={
                    budgets.shopping.spent / budgets.shopping.budget > 1
                      ? theme.danger
                      : theme.success
                  }
                  width={120}
                  style={{ marginHorizontal: 10 }}
                />
                <DefaultText style={styles.budgetAmount}>
                  £{budgets.shopping.budget}
                </DefaultText>
              </View>
            </View>
            <View style={styles.row}>
              <DefaultText>Entertainment</DefaultText>
              <View style={styles.progressContainer}>
                <DefaultText style={styles.budgetAmount}>
                  £{Math.round(budgets.entertainment.spent)}
                </DefaultText>
                <Progress.Bar
                  progress={
                    budgets.entertainment.spent / budgets.entertainment.budget >
                    1
                      ? 1
                      : budgets.entertainment.spent /
                        budgets.entertainment.budget
                  }
                  color={
                    budgets.entertainment.spent / budgets.entertainment.budget >
                    1
                      ? theme.danger
                      : theme.success
                  }
                  width={120}
                  style={{ marginHorizontal: 10 }}
                />
                <DefaultText style={styles.budgetAmount}>
                  £{budgets.entertainment.budget}
                </DefaultText>
              </View>
            </View>
            <View style={styles.row}>
              <DefaultText>Food & Drink</DefaultText>
              <View style={styles.progressContainer}>
                <DefaultText style={styles.budgetAmount}>
                  £{Math.round(budgets.foodAndDrink.spent)}
                </DefaultText>
                <Progress.Bar
                  progress={
                    budgets.foodAndDrink.spent / budgets.foodAndDrink.budget > 1
                      ? 1
                      : budgets.foodAndDrink.spent / budgets.foodAndDrink.budget
                  }
                  color={
                    budgets.foodAndDrink.spent / budgets.foodAndDrink.budget > 1
                      ? theme.danger
                      : theme.success
                  }
                  width={120}
                  style={{ marginHorizontal: 10 }}
                />
                <DefaultText style={styles.budgetAmount}>
                  £{budgets.foodAndDrink.budget}
                </DefaultText>
              </View>
            </View>
            <View style={styles.row}>
              <DefaultText>Transportation</DefaultText>
              <View style={styles.progressContainer}>
                <DefaultText style={styles.budgetAmount}>
                  £{Math.round(budgets.transportation.spent)}
                </DefaultText>
                <Progress.Bar
                  progress={
                    budgets.transportation.spent /
                      budgets.transportation.budget >
                    1
                      ? 1
                      : budgets.transportation.spent /
                        budgets.transportation.budget
                  }
                  color={
                    budgets.transportation.spent /
                      budgets.transportation.budget >
                    1
                      ? theme.danger
                      : theme.success
                  }
                  width={120}
                  style={{ marginHorizontal: 10 }}
                />
                <DefaultText style={styles.budgetAmount}>
                  £{budgets.transportation.budget}
                </DefaultText>
              </View>
            </View>
            <View style={styles.row}>
              <DefaultText>Home</DefaultText>
              <View style={styles.progressContainer}>
                <DefaultText style={styles.budgetAmount}>
                  £{Math.round(budgets.home.spent)}
                </DefaultText>
                <Progress.Bar
                  progress={
                    budgets.home.spent / budgets.home.budget > 1
                      ? 1
                      : budgets.home.spent / budgets.home.budget
                  }
                  color={
                    budgets.home.spent / budgets.home.budget > 1
                      ? theme.danger
                      : theme.success
                  }
                  width={120}
                  style={{ marginHorizontal: 10 }}
                />
                <DefaultText style={styles.budgetAmount}>
                  £{budgets.home.budget}
                </DefaultText>
              </View>
            </View>
            <View style={styles.row}>
              <DefaultText>Other</DefaultText>
              <View style={styles.progressContainer}>
                <DefaultText style={styles.budgetAmount}>
                  £{Math.round(budgets.other.spent)}
                </DefaultText>
                <Progress.Bar
                  progress={
                    budgets.other.spent / budgets.other.budget > 1
                      ? 1
                      : budgets.other.spent / budgets.other.budget
                  }
                  color={
                    budgets.other.spent / budgets.other.budget > 1
                      ? theme.danger
                      : theme.success
                  }
                  width={120}
                  style={{ marginHorizontal: 10 }}
                />
                <DefaultText style={styles.budgetAmount}>
                  £{budgets.other.budget}
                </DefaultText>
              </View>
            </View>
          </View>

          <View style={{ marginVertical: 5 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ManageBudgets")}
              style={styles.buttonStyle}
            >
              <DefaultText style={styles.buttonText}>
                Manage budgets
              </DefaultText>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  return (
    <>
      <View
        style={{
          height: "92%",
        }}
      >
        <View style={{ marginBottom: 10 }}>
          <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
            Spending
          </DefaultText>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "budget" && styles.activeTab]}
            onPress={() => setSelectedTab("budget")}
          >
            <DefaultText
              style={[
                styles.tabText,
                selectedTab === "budget" && styles.activeTabText,
              ]}
            >
              Budget
            </DefaultText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "analysis" && styles.activeTab]}
            onPress={() => setSelectedTab("analysis")}
          >
            <DefaultText
              style={[
                styles.tabText,
                selectedTab === "analysis" && styles.activeTabText,
              ]}
            >
              Analysis
            </DefaultText>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {selectedTab === "budget" ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View>
                {/* <DefaultText style={{ textAlign: "center", marginBottom: 5 }}>
                  Budget
                </DefaultText> */}
                <View style={{ padding: 10 }}>{renderBudget()}</View>
              </View>
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View>
                <DefaultText style={{ textAlign: "center", marginBottom: 5 }}>
                  Expense vs Income
                </DefaultText>
                <View style={{ padding: 10 }}>{renderChart()}</View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
      <FooterList />
    </>
  );
};

const createStyles = (theme) => {
  return StyleSheet.create({
    tabContainer: {
      flexDirection: "row",
      backgroundColor: theme.secondary,
      borderRadius: 25,
      padding: 5,
      marginHorizontal: 20,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 10,
      borderRadius: 20,
    },
    activeTab: {
      backgroundColor: theme.primary2,
    },
    tabText: {
      color: theme.text,
      fontWeight: "bold",
    },
    activeTabText: {
      color: theme.surface,
    },
    contentContainer: {
      marginTop: 20,
      // alignItems: "center",
      // borderWidth: 1,
    },
    budgetGraphContainer: {
      // margin: 15,
      borderWidth: 1,
      borderRadius: 10,
      backgroundColor: theme.surface,
      borderColor: theme.text2,
      paddingVertical: 5,
      paddingHorizontal: 20,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    budgetContainer: {
      flexDirection: "column",
      justifyContent: "space-between",
      // alignItems: "flex-end",
      width: "25%",
    },
    categoryContainer: {
      marginVertical: 20,
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
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginVertical: 8,
      // borderWidth: 1,
    },
    progressContainer: {
      flexDirection: "row",
      alignItems: "center",
      // borderWidth: 1
    },
    budgetAmount: {
      width: 40,
    },
  });
};

export default Analysis;
