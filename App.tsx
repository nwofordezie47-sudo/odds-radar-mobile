import { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Home } from './src/screens/Home';
import { MarketDetail } from './src/screens/MarketDetail';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'detail'>('home');
  const [selectedMarketSlug, setSelectedMarketSlug] = useState<string | null>(null);

  const navigateToDetail = (slug: string) => {
    setSelectedMarketSlug(slug);
    setCurrentScreen('detail');
  };

  const navigateToHome = () => {
    setSelectedMarketSlug(null);
    setCurrentScreen('home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050505" />
      {currentScreen === 'home' && <Home onNavigate={navigateToDetail} />}
      {currentScreen === 'detail' && selectedMarketSlug && (
        <MarketDetail slug={selectedMarketSlug} onBack={navigateToHome} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
});
