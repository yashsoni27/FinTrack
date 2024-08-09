import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PanResponder,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FooterList from "../components/footer/footerList";
import { AuthContext } from "../context/auth";
import { getTransactionsDb } from "../../api/db";
import DefaultText from "../components/defaultText";
import { useTheme } from "../context/themeContext";
import { useNavigation } from "@react-navigation/native";
import { LineChart } from "react-native-gifted-charts";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

const Transactions = () => {
  const [state, setState] = useContext(AuthContext);
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [currMonth, setCurrMonth] = useState(new Date().getMonth() + 1);
  const [date, setDate] = useState(new Date())

  const screenWidth = Dimensions.get("window").width;
  // let date = new Date();

  const userId = state.user.userId;

  const fetchTransactionsDB = async (selectedMonth) => {
    try {
      const response = await getTransactionsDb(userId, 0, selectedMonth);
      // console.log("Transactions fetched from DB: ", response);
      console.log("Transactions fetched from DB");
      setTransactions(response.transactions);
    } catch (error) {
      console.log("Error in fetching transactions:  ", error);
    }
  };

  const generateGraphData = (monthTransactions) => {
    const aggregatedData = monthTransactions.reduce((acc, { date, amount }) => {
      const day = new Date(date).getDate();
      if (amount > 0) {
        acc[day] = (acc[day] || 0) + amount;
      }
      return acc;
    }, {});

    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currMonth, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => ({
      value: aggregatedData[i + 1] || 0,
    }));
  };

  useEffect(() => {
    // fetchTransactionsDB();
    fetchTransactionsDB(currMonth);
    const newDate = new Date(date);
    newDate.setMonth(currMonth - 1);
    setDate(newDate);
  }, [currMonth]);

  const graphData = generateGraphData(transactions);
  // console.log("graphData: ", graphData);

  return (
    <>
      <View style={{ height: "90%" }}>
        <ScrollView
          style={{
            // padding: 10,
            backgroundColor: theme.background,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <DefaultText style={{ fontSize: 30, textAlign: "center" }}>
              Transactions
            </DefaultText>
          </View>

          <LineChart
            data={graphData}
            width={screenWidth - 40}
            height={150}
            // initialSpacing={0}
            spacing={10}
            hideRules
            color1="green"
            thickness={2}
            areaChart
            startFillColor="rgba(34,193,195,0.2)" // Start of gradient color
            endFillColor="rgba(34,193,195,0)" // End of gradient color
            startOpacity={0.5} // Starting opacity for gradient fill
            endOpacity={0}
            hideDataPoints
            // hideYAxisText
            // pointerConfig={{}}
            // hideAxesAndRules
            curved
            curvature={0.02}
            // showVerticalLines
            verticalLinesColor="#e0e0e0" // Color of grid lines
            yAxisTextStyle={{ color: "gray" }}
            // yAxisOffset={20}

            // focusEnabled={true}
            // showDataPointOnFocus={true}
          />

          <View
            style={{
              marginTop: 20,
              margin: 10,
              padding: 10,
              // borderColor: "#000",
              // borderWidth: 1,
            }}
          >
            <View style={{ marginVertical: 10, flexDirection: "row", justifyContent: "space-between" }}>
              <FontAwesome5Icon
                style={{}}
                name="angle-left"
                size={20}
                color=""
                onPress={() => setCurrMonth(currMonth - 1)}
              />
              <DefaultText style={{ fontSize: 20, textAlign: "center" }}>
                History for {date.toLocaleString("default", { month: "short" })}
              </DefaultText>
              <FontAwesome5Icon
                style={{}}
                name="angle-right"
                size={20}
                color=""
                onPress={() => setCurrMonth(currMonth + 1)}
              />
            </View>

            {/* Beautify this View  */}
            <View>
              {transactions.map((transaction) => (
                <View key={transaction._id} style={{ marginVertical: 3 }}>
                  <DefaultText>{transaction.name}</DefaultText>
                  <DefaultText>£ {transaction.amount}</DefaultText>
                </View>
              ))}
            </View>
          </View>

        </ScrollView>
      </View>

      <View style={{ position: "absolute", bottom: 90, right: 20 }}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            // Handle FAB press
            console.log("FAB pressed");
            navigation.navigate("Add");
          }}
        >
          <Text style={{ color: "#fff", fontSize: 24 }}>+</Text>
        </TouchableOpacity>
      </View>

      <FooterList />
    </>
  );
};

const styles = StyleSheet.create({
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#ff5722", // FAB color
    justifyContent: "center",
    alignItems: "center",
    // position: "absolute",
    // bottom: 0,
    // right: 0,
  },
});

export default Transactions;
