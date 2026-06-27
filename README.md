# Odds Radar Mobile

Odds Radar is a React Native mobile application built with Expo that tracks real-time prediction markets from Polymarket. It provides a sleek, dark-themed dashboard to monitor event probabilities, market volumes, and historical price trends.

## Features

- **Real-Time Data**: Fetches live prediction market data and odds from Polymarket's Gamma API.
- **Market Sorting**: Easily filter and sort markets by biggest movers, highest 24h volume, or soonest ending dates.
- **Detailed Market Views**: View comprehensive stats including Total Liquidity, Current 'Yes' Odds, and 24h Price Changes.
- **Interactive Charts**: Visualizes historical price trends for 'Yes' outcomes using `react-native-chart-kit`.
- **Premium UI**: Designed with a modern dark mode aesthetic featuring glowing neon accents, smooth Lottie animations, and skeleton loaders for a seamless user experience.
- **State Management**: Robust and fast state handling powered by Zustand.

## Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charting**: [react-native-chart-kit](https://github.com/indiespirit/react-native-chart-kit)
- **Animations**: [Lottie React Native](https://github.com/lottie-react-native/lottie-react-native)
- **Language**: TypeScript

## Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed along with [Expo CLI](https://docs.expo.dev/get-started/installation/).

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd odds-radar-mobile
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Run the app:
   - Press **`a`** to open it on an Android emulator.
   - Press **`i`** to open it on an iOS simulator.
   - Scan the QR code with the Expo Go app on your physical device.

## Project Structure

- `src/screens/Home.tsx`: The main dashboard displaying the list of active markets, sorting options, and real-time updates.
- `src/screens/MarketDetail.tsx`: The detailed view for a specific market, showing in-depth stats and the historical price chart.
- `src/shared/api.ts`: Contains the fetch logic for communicating with the Polymarket Gamma and Clob APIs.
- `src/shared/store.ts`: The Zustand store handling global state, data caching, and error management.
