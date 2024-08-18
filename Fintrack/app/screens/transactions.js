import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
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
  const [date, setDate] = useState(new Date());
  const styles = createStyles(theme);
  const userId = state.user.userId;

  const options = {
    month: "short",
    day: "numeric",
    // weekday: "short",
  };

  const fetchTransactionsDB = async (selectedMonth) => {
    try {
      const response = await getTransactionsDb(userId, 0, selectedMonth);
      console.log("Transactions DB: ", response.transactions[0]);
      // console.log("Transactions DB");
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
      value: Math.round(aggregatedData[i + 1] * 100) / 100 || 0,
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
            width={Dimensions.get("window").width - 35}
            curved
            curvature={0.02}
            height={150}
            initialSpacing={10}
            endSpacing={0}
            spacing={11}
            color1="green"
            thickness={2}
            areaChart
            startFillColor="rgba(34,193,195,0.2)" // Start of gradient color
            endFillColor="rgba(34,193,195,0)" // End of gradient color
            startOpacity={0.5} // Starting opacity for gradient fill
            endOpacity={0}
            hideRules
            hideDataPoints
            hideYAxisText
            yAxisTextStyle={{ color: "gray" }}
            pointerConfig={{
              pointerColor: "green",
              radius: 3,
              // pointerStripHeight: 100,
              pointerStripWidth: 2,
              activatePointersOnLongPress: true,
              autoAdjustPointerLabelPosition: true,
              pointerLabelComponent: (items) => {
                return (
                  <View
                    style={{
                      // height: 20,
                      width: 70,
                      backgroundColor: "#282C3E",
                      borderRadius: 4,
                      justifyContent: "center",
                      flex: 1,
                      alignItems: "center",
                      // textAlign: 'center',
                      // paddingLeft:16,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      {items[0].value}
                    </Text>
                  </View>
                );
              },
            }}
            // hideAxesAndRules
            // showVerticalLines
            // verticalLinesColor="#e0e0e0" // Color of grid lines

            // focusEnabled={true}
            // showDataPointOnFocus={true}
          />

          <View
            style={{
              marginTop: 20,
              margin: 10,
              padding: 10,
              // borderWidth: 1,
            }}
          >
            <View
              style={{
                marginVertical: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <FontAwesome5Icon
                style={styles.monthButton}
                name="angle-left"
                size={20}
                color=""
                onPress={() => setCurrMonth(currMonth - 1)}
              />
              <DefaultText style={{ fontSize: 20, textAlign: "center" }}>
                History for {date.toLocaleString("default", { month: "short" })}
              </DefaultText>
              <FontAwesome5Icon
                style={styles.monthButton}
                name="angle-right"
                size={20}
                color=""
                disabled={date.toISOString() >= new Date().toISOString()}
                onPress={() => setCurrMonth(currMonth + 1)}
              />
            </View>

            {/* Beautify this View  */}
            <View style={{ marginTop: 10 }}>
              {transactions.map((transaction, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: 10,
                    backgroundColor: theme.surface,
                    borderWidth: 1,
                    borderColor: theme.text2,
                    borderRadius: 10,
                    marginBottom: 10,
                  }}
                >
                  <DefaultText
                    style={{
                      position: "absolute",
                      top: -10,
                      left: 10,
                      padding: 1,
                      zIndex: 100,
                      backgroundColor: theme.background,
                      borderRadius: 10,
                    }}
                  >
                    {new Intl.DateTimeFormat("en-US", options).format(
                      new Date(transaction.date)
                    )}
                  </DefaultText>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={{
                        uri: transaction.logoUrl
                          ? transaction.logoUrl
                          : transaction.personalFinanceCategoryIconUrl,
                      }}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 30,
                        borderWidth: 1,
                        borderColor: theme.text,
                      }}
                      resizeMode="contain"
                    />
                    <DefaultText style={{ marginLeft: 10 }}>
                      {transaction.merchantName
                        ? transaction.merchantName
                        : transaction.name}
                    </DefaultText>
                  </View>
                  <DefaultText>
                    {transaction.amount > 0 ? "- " : "+ "}£
                    {Math.abs(transaction.amount)}
                  </DefaultText>
                  {/* {transaction.amount > 0 ? (
                    <DefaultText style={{ color: "red" }}>- £{Math.abs(transaction.amount)}</DefaultText>
                  ) : (
                    <DefaultText style={{ color: "green" }}>+ £{Math.abs(transaction.amount)}</DefaultText>
                  )} */}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={{ position: "absolute", bottom: 85, right: 20 }}>
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

const createStyles = (theme) => {
  return StyleSheet.create({
    addButton: {
      width: 50,
      height: 50,
      borderRadius: 30,
      backgroundColor: theme.primary2, // FAB color
      justifyContent: "center",
      alignItems: "center",
    },
    monthButton: {
      backgroundColor: theme.secondary,
      padding: 10,
      borderRadius: 30,
    },
  });
};

export default Transactions;
