import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import plaidRoutes from "./routes/plaid.js";


const app = express();


mongoose
  .connect(process.env.MONGO_DB_CONN_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(8000, () => {
      console.log("server has started on port 8000");
    });
  })
  .catch((err) => {
    console.log(err);
  });

// middlewares
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));


// route middlewares
app.use("/api", authRoutes);
app.use("/api", plaidRoutes);


// // Plaid configuration
// const configuration = new Configuration({
//   basePath: PlaidEnvironments[process.env.PLAID_ENV],
//   baseOptions: {
//     headers: {
//       "PLAID-VERSION": "2020-09-14",
//       "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
//       "PLAID-SECRET": process.env.PLAID_SECRET,
//     },
//   },
// });

// const plaidClient = new PlaidApi(configuration);


// Plaid API starts
// Initial Bank connect
// app.post("/api/create_link_token", async function (request, response) {
//   const { email } = request.body;

//   // Get the client_user_id by searching for the current user
//   const user = await User.findOne({ email });
//   const plaidRequest = {
//     user: {
//       // client_user_id: "user",
//       client_user_id: user._id,
//     },
//     client_name: "Plaid Test App",
//     // products: process.env.PLAID_PRODUCTS.split(","),
//     products: ["auth"],
//     required_if_supported_products: ["transactions"],
//     language: "en",
//     // webhook: 'https://webhook.example.com',
//     // redirect_uri: 'http://localhost:8081/',
//     android_package_name: "com.yashso.fintrack",
//     country_codes: process.env.PLAID_COUNTRY_CODES.split(","),
//   };
//   try {
//     const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
//     response.json(createTokenResponse.data);
//   } catch (error) {
//     // console.log(response.json);
//     response.status(500).json({ error: error.message });
//   }
// });

// // For exchanging public token
// app.post("/api/exchange_public_token", async function (request, response) {
//   const { email, public_token } = request.body;
//   console.log(email, public_token);
//   const user = await User.findOne({ email });
//   var accessToken;
//   try {
//     // Only exchange token if the user doesn't have access token
//     if (user.accessToken == "" || user.accessToken == null) {
//       const plaidResponse = await plaidClient.itemPublicTokenExchange({
//         public_token: public_token,
//       });

//       // These values should be saved to a persistent database and
//       // associated with the currently signed-in user
//       user.accessToken = plaidResponse.data.access_token;
//       const itemID = plaidResponse.data.item_id;

//       // const user = await User.findOneAndUpdate({email}, {accessToken}, {new: true})

//       console.log(plaidResponse.data);

//       // // user.itemID = itemID;
//       // user.accessToken = accessToken;
//       user.save();
//       console.log("user data saved");
//     } else {
//       accessToken = user.accessToken;
//     }

//     const balanceResponse = await plaidClient.accountsBalanceGet({
//       access_token: accessToken,
//     });
//     // console.log(balanceResponse.data);

//     for (const accountData in balanceResponse.data.accounts) {
//       try {
//         const existingAccount = await Account.findOne({
//           account_id: accountData.account_id,
//         });

//         if (!existingAccount) {
//           const newAccount = new Account({
//             account_id: accountData.account_id,
//             balances: {
//               available: accountData.balances.available,
//               current: accountData.balances.current,
//               iso_currency_code: accountData.balances.iso_currency_code,
//               limit: accountData.balances.limit,
//               unofficial_currency_code: accountData.balances.unofficial_currency_code,
//             },
//             mask: accountData.mask,
//             name: accountData.name,
//             type: accountData.type,
//             subType: accountData.subType,
//             persistent_account_id: accountData.persistent_account_id,
//           });
//           await newAccount.save();
//           console.log("Bank account saved: ", accountData.account_id);
//         }
//         else {
//           console.log("Bank account already exists: ", accountData.account_id);
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     }

//     response.json({
//       balance: balanceResponse.data,
//     });
//   } catch (error) {
//     // handle error
//     console.log("ERROR: ", error);
//     response.send(error);
//   }
// });

// // Getting balance
// app.post("/api/balance", async function (request, response) {
//   try {
//     const { email } = request.body;
//     const user = await User.findOne({ email });
//     const accessToken = user.accessToken;
//     const res = await plaidClient.accountsBalanceGet({
//       access_token: accessToken,
//     });

//     response.json(res.data);
//   } catch (e) {
//     response.status(500).send(e);
//   }
// });

// // Getting transactions data
// app.post("/api/transactions", async function (request, response) {
//   try {
//     const { email } = request.body;
//     const user = await User.findOne({ email });
//     const accessToken = user.accessToken;
//     const plaidRequest = {
//       access_token: accessToken,
//       start_date: "2024-04-19",
//       end_date: "2024-07-19",
//     };
//     const res = await plaidClient.transactionsGet(plaidRequest);
//     // console.log("transactions-  ", res.data);
//     response.json(res.data);
//   } catch (e) {
//     response.status(500).send(e);
//   }
// });

// // Getting proper auth info from plaid with access_token
// app.post("/api/auth", async function (request, response) {
//   try {
//     const { email } = request.body;
//     const user = await User.findOne({ email });
//     const accessToken = user.accessToken;
//     // const access_token = request.body.access_token; // NEED TO CHANGE THIS - grab accessToken from DB instead from clients
//     const plaidRequest = {
//       access_token: accessToken,
//     };
//     const plaidResponse = await plaidClient.authGet(plaidRequest);
//     // console.log("plaidResponse: ", plaidResponse.data);
//     response.json(plaidResponse.data);
//   } catch (e) {
//     response.status(500).send("failed");
//   }
// });

// Plaid API ends
