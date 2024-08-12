import { View, Text, SafeAreaView, ScrollView, Dimensions } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FooterList from "../components/footer/footerList";
import DefaultText from "../components/defaultText";
import { AuthContext } from "../context/auth";
import { useTheme } from "../context/themeContext";
import { LineChart } from "react-native-gifted-charts";
import { getTransactionsDb } from "../../api/db";

const Analysis = () => {
  const [state, setState] = useContext(AuthContext);
  const { theme } = useTheme();
  // const [data, setData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const chartData = [
    { value: 10, dataPointText: "10" },
    { value: 20, dataPointText: "20" },
    { value: 30, dataPointText: "30" },
    { value: 40, dataPointText: "40" },
    { value: 50, dataPointText: "50" },
    { value: 60, dataPointText: "60" },
    { value: 70, dataPointText: "70" },
  ];

  const userId = state.user.userId;

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
        return date.getMonth() + 1 === selectedMonth && date.getDate() <= lastDay;
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

      console.log("income data: ", income);
      console.log("expense data: ", expense);

      setIncomeData(income);
      setExpenseData(expense);
    } catch (error) {
      console.log("Error in fetching transactions:  ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsDB();
  }, []);

  const renderChart = () => {
    if (isLoading) {
      return <DefaultText>Loading data...</DefaultText>;
    }

    if (expenseData.length === 0 && incomeData.length === 0) {
      return <DefaultText>No data for this month</DefaultText>;
    }

    return (
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
          pointerConfig={{
            pointer1Color: "red",
            pointer2Color: "green",
            height: 0,
            width: 0,
            radius: 2,
          }}
          hideAxesAndRules
        />
      </View>
    );
  };

  return (
    <>
      <View
        style={{
          // flex: 1,
          // justifyContent: "space-between",
          // alignItems: "center",
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
            <DefaultText
              style={{ fontSize: 15, textAlign: "center", marginBottom: 5 }}
            >
              Expense vs Income
            </DefaultText>
            <View style={{ padding: 10, borderWidth: 1, borderColor: "black" }}>
              {renderChart()}
              {/* {incomeData.length > 0 || expenseData.length > 0 ? (
                <View style={{ }}>
                  <LineChart
                    areaChart
                    data={chartData}
                    // data={expenseData}
                    // data2={incomeData}
                    color1="red"
                    color2="green"
                    startFillColor1="red"
                    startFillColor2="green"
                    startOpacity={0.2}
                    endOpacity={0}
                    width={Dimensions.get("window").width - 80}
                    height={250}
                    initialSpacing={0}
                    thickness={2}
                    noOfSections={5}
                    hideDataPoints
                    // curved
                    // hideAxesAndRules
                    // isAnimated
                  />
                </View>
              ) : (
                <DefaultText>No data for this month</DefaultText>
              )} */}
            </View>
          </View>
        </ScrollView>
      </View>
      <FooterList />
    </>
  );
};

export default Analysis;
