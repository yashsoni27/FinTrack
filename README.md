# FinTrack

FinTrack is a personal finance tracker mobile application that allows users to monitor their online and offline expenses from various connected accounts in one place. This repository contains both the frontend mobile application built with React Native and the backend server built with Node.js.

## Features

- **Expense Tracking:** Track all your expenses in one place, categorized and summarized for easy review.
- **Bank Account Integration:** Link your bank accounts using Plaid API to automatically import transactions.
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

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes. Make sure to follow the existing code style and include relevant tests for any new functionality.

## License

This project is licensed under the MIT License.
