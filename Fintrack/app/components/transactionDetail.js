import { View, StyleSheet, Image, ScrollView, Switch } from "react-native";
import React, { useState } from "react";
import DefaultText from "./defaultText";
import { useTheme } from "../context/themeContext";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { updateTransactionDb } from "../../api/db";

const TransactionDetail = ({ route }) => {
  const { transaction } = route.params;
  console.log("transaction:::", transaction);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [isExcluded, setIsExcluded] = useState(
    transaction.excludeFromAnalytics || false
  );

  const handleExcludeToggle = async (value) => {
    setIsExcluded(value);
    transaction.excludeFromAnalytics = value;
    // TODO: Implement the API call to update the transaction
    updateTransactionDb(transaction, { excludeFromAnalytics: value });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              transaction.logoUrl || transaction.personalFinanceCategoryIconUrl,
          }}
          style={styles.logo}
          resizeMode="contain"
        />
        <DefaultText style={styles.merchantName}>
          {transaction.merchantName || transaction.name}
        </DefaultText>
      </View>

      {/* Amount Section */}
      <View style={styles.amountContainer}>
        <DefaultText style={styles.amount}>
          {transaction.amount > 0 ? "- " : "+ "}£{Math.abs(transaction.amount)}
        </DefaultText>
        <DefaultText style={styles.date}>
          {formatDate(transaction.date)}
        </DefaultText>
      </View>

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        <DetailRow
          icon="category"
          label="Category"
          value={
            transaction.personalFinanceCategory?.detailed || "Uncategorized"
          }
          theme={theme}
        />

        <DetailRow
          icon="label"
          label="Primary Category"
          value={
            transaction.personalFinanceCategory?.primary || "Uncategorized"
          }
          theme={theme}
        />

        {transaction.description && (
          <DetailRow
            icon="description"
            label="Description"
            value={transaction.description}
            theme={theme}
          />
        )}

        <DetailRow
          icon="account-balance"
          label="Account ID"
          value={transaction.accountId}
          theme={theme}
        />

        <DetailRow
          icon="tag"
          label="Transaction ID"
          value={transaction.transactionId}
          theme={theme}
        />

        <View style={styles.excludeRow}>
          <View style={styles.labelContainer}>
            <MaterialIcons
              name="analytics"
              size={20}
              color={theme.text}
              style={styles.icon}
            />
            <DefaultText style={styles.label}>
              Exclude from Analytics
            </DefaultText>
          </View>
          <Switch
            value={isExcluded}
            onValueChange={handleExcludeToggle}
            trackColor={{
              false: theme.text2 + "50",
              true: theme.primary + "80",
            }}
            thumbColor={isExcluded ? theme.primary : theme.text2}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const DetailRow = ({ icon, label, value, theme }) => {
  const styles = createStyles(theme);
  return (
    <View style={styles.detailRow}>
      <View style={styles.labelContainer}>
        <MaterialIcons
          name={icon}
          size={20}
          color={theme.text}
          style={styles.icon}
        />
        <DefaultText style={styles.label}>{label}</DefaultText>
      </View>
      <DefaultText style={styles.value}>{value}</DefaultText>
    </View>
  );
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
    },
    header: {
      alignItems: "center",
      marginBottom: 20,
    },
    logo: {
      width: 60,
      height: 60,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: theme.text,
      marginBottom: 10,
    },
    merchantName: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
    },
    amountContainer: {
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.surface,
      borderRadius: 15,
      marginBottom: 20,
    },
    amount: {
      fontSize: 32,
      fontWeight: "bold",
      marginBottom: 5,
    },
    date: {
      fontSize: 16,
      color: theme.text2,
    },
    detailsContainer: {
      backgroundColor: theme.surface,
      borderRadius: 15,
      padding: 15,
    },
    detailRow: {
      flexDirection: "column",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.text2 + "30",
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },
    icon: {
      marginRight: 10,
    },
    label: {
      fontSize: 14,
      color: theme.text2,
    },
    value: {
      fontSize: 16,
      marginLeft: 30,
    },
    excludeRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: 20,
    },
  });

export default TransactionDetail;
