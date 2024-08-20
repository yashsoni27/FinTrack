import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FooterList from "../components/footer/footerList";
import DefaultText from "../components/defaultText";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";
import { LineChart } from "react-native-gifted-charts";
import { getBudget, getChartData, getTransactionsDb } from "../../api/db";

const Analysis = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  const [currMonth, setCurrMonth] = useState(new Date().getMonth() + 1);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [pctChange, setPctChange] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const styles = createStyles(theme);
  const userId = state.user.userId;

  // REDUNDANT - placing the logic in server side
  const fetchTransactionsDB = async (selectedMonth = 7) => {
    try {
      setIsLoading(true);

      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDate = today.getDate();

      const lastDay = selectedMonth === currentMonth ? currentDate : 31;

      const income = Array(lastDay)
        .fill()
        .map((_, index) => ({ value: 0, dataPointText: `${index + 1}` }));
      const expense = Array(lastDay)
        .fill()
        .map((_, index) => ({ value: 0, dataPointText: `${index + 1}` }));

      const response = await getTransactionsDb(userId, 0, selectedMonth);
      const transactions = response.transactions;

      const filteredTransactions = transactions.filter((transaction) => {
        const date = new Date(transaction.date);
        return (
          date.getMonth() + 1 === selectedMonth && date.getDate() <= lastDay
        );
      });
      // console.log("filtered:  ", filteredTransactions);

      filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

      let cumulativeIncome = 0;
      let cumulativeExpense = 0;

      filteredTransactions.forEach((transaction) => {
        const date = new Date(transaction.date);
        const day = date.getDate() - 1; // Adjusting for 0-based index

        if (transaction.amount < 0) {
          // income[day].value += Math.abs(transaction.amount);
          cumulativeIncome += Math.abs(transaction.amount);
          income[day].value = Number(cumulativeIncome.toFixed(2));
        } else {
          // expense[day].value += transaction.amount;
          cumulativeExpense += transaction.amount;
          expense[day].value = Number(cumulativeExpense.toFixed(2));
        }
      });

      // Fill in cumulative values for days without transactions
      for (let i = 1; i < lastDay; i++) {
        if (income[i].value === 0) income[i].value = income[i - 1].value;
        if (expense[i].value === 0) expense[i].value = expense[i - 1].value;
      }

      // console.log("income data: ", income);
      // console.log("expense data: ", expense);

      setIncomeData(income);
      setExpenseData(expense);
    } catch (error) {
      console.log("Error in fetching transactions: ", error);
    } finally {
      setIsLoading(false);
    }
  };

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
      const response = await getBudget(userId, selectedMonth);
    } catch (error) {
      console.log("Error in fetching budget: ", error);
    }
  }



  useEffect(() => {
    // fetchTransactionsDB();
    fetchChartData(currMonth);    
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
              // height: 0,
              // width: 0,
              radius: 2,
              activatePointersOnLongPress: true,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items) => {
                // console.log("test:: ", items);
                return (
                  <>
                    <View
                      style={{
                        width: 70,
                        backgroundColor: theme.secondary,
                        borderRadius: 4,
                        justifyContent: "center",
                        flex: 1,
                        alignItems: "center",
                        // textAlign: 'center',
                        // padding:16,
                      }}
                    >
                      <DefaultText style={{ color: theme.text }}>
                        {items[0].value}
                      </DefaultText>
                    </View>
                    <View
                      style={{
                        // height: 20,
                        width: 70,
                        backgroundColor: theme.secondary,
                        borderRadius: 4,
                        justifyContent: "center",
                        flex: 1,
                        alignItems: "center",
                        // textAlign: 'center',
                        // paddingLeft:16,
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

  return (
    <>
      <View
        style={{
          height: "92%",
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ marginBottom: 10 }}>
            <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
              Analysis
            </DefaultText>
          </View>

          <View>
            <DefaultText style={{ textAlign: "center", marginBottom: 5 }}>
              Expense vs Income
            </DefaultText>
            <View style={{ padding: 10 }}>{renderChart()}</View>
          </View>

          <View>
            <DefaultText style={{ textAlign: "center", marginBottom: 5 }}>
              Budget
            </DefaultText>
            <View style={{ padding: 10 }}>

            </View>
          </View>
        </ScrollView>
      </View>
      <FooterList />
    </>
  );
};

const createStyles = (theme) => {
  return StyleSheet.create({});
};

export default Analysis;
