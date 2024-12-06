# FinTrack - LLM based finance tracker

FinTrack is a LLM integrated personal finance tracker mobile application that allows users to monitor their online and offline expenses from various connected accounts in one place. This repository contains both the frontend mobile application built with React Native and the backend server built with Node.js. 

<img src="https://github.com/user-attachments/assets/8d6030e3-dd87-4543-a7f5-58fea2b086ef" width=300 >
<img src="https://github.com/user-attachments/assets/3985ffd3-7e7d-490b-bb02-3f63edbff187" width=300>
<img src="https://github.com/user-attachments/assets/05273f49-9227-40f1-b208-0b05c8e04f6e" width=300>
<img src="https://github.com/user-attachments/assets/63b92624-33b7-41fc-9213-e8e8523a2dc2" width=300>
<img src="https://github.com/user-attachments/assets/fec2ba28-a671-48f0-9d50-bd6d0892463f" width=300>
<img src="https://github.com/user-attachments/assets/597934cd-b713-4df1-a851-e5b180092420" width=300>



https://github.com/user-attachments/assets/fc1eb1ba-4d5e-403a-aeb9-d8b5fd279250



## Features

- **Expense Tracking:** Track all your expenses in one place, categorized and summarized for easy review.
- **Bank Account Integration:** Link your bank accounts using Plaid API to automatically import transactions.
- **LLM Integration:** Access the power of LLM in order to get personalised insights, summaries and more by simply asking the question to your data.
- **Receipt Scanning:** Use OCR technology to scan and digitize receipts.
- **Analytics:** View detailed spending analytics and insights.
- **User Authentication:** Secure login and registration with biometric authentication support.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- Expo CLI
- Android Studio / Xcode (for mobile app development)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yashsoni27/FinTrack.git
   cd FinTrack
   ```

2. **Install dependencies for the mobile app:**
	```sh
	cd FinTrack
	npm install
	```
3. **Install dependencies for the server:**
	```sh
	cd server
	npm install
	```

### Running the app
1. **Start the backend server:**
	```sh
	cd server
	npm start
	```
2. **Run the mobile app:**
	```sh
	cd..
	npx expo run:android
	```
## Project Structure

### Frontend (Mobile App)

- **src/**: Contains the main codebase for the mobile app
  - **components/**: Reusable UI components
  - **screens/**: App screens and navigation setup
  - **assets/**: Images, icons, etc.
  - **services/**: API service calls and utility functions
  - **navigation/**: Navigation setup

### Backend (Server)

- **controllers/**: Handles the logic for different routes
- **models/**: Mongoose models for MongoDB
- **routes/**: Express routes
- **middlewares/**: Custom middleware functions
- **config/**: Configuration files and constants


## Technologies Used

- **Frontend:**
  - React Native
  - Expo
  - Async Storage
  - Axios

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - Plaid API
  - Gemini API

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Make sure to follow the existing code style and include relevant tests for any new functionality.

## License

This project is licensed under the MIT License.
