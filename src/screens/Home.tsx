import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import { useMarketsStore, Market } from '../shared/store';

export const Home = ({ onNavigate }: { onNavigate: (slug: string) => void }) => {
  const { markets, status, error, loadMarkets, sortBy, setSortBy } = useMarketsStore();
  
  const sortedMarkets = useMemo(() => {
    const sorted = [...markets];
    if (sortBy === 'biggest_mover') {
      sorted.sort((a, b) => Math.abs(b.oneDayPriceChange) - Math.abs(a.oneDayPriceChange));
    } else if (sortBy === 'volume') {
      sorted.sort((a, b) => b.volume24hr - a.volume24hr);
    } else if (sortBy === 'end_date') {
      sorted.sort((a, b) => {
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      });
    }
    return sorted;
  }, [markets, sortBy]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      loadMarkets();
    }
  }, [status, loadMarkets]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadMarkets(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadMarkets]);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      setInitialLoadDone(true);
    }
  }, [status]);

  if (!initialLoadDone && status === 'loading') {
    return (
      <View style={styles.centerContainer}>
        <LottieView
          source={require('../../assets/pulse-loader.json')}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
        <Text style={styles.loadingText}>Initializing Odds Radar...</Text>
      </View>
    );
  }

  if (status === 'error' && markets.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Connection Failed</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadMarkets()}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderSkeleton = () => (
    <View style={styles.cardSkeleton}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: '80%' }]} />
      <View style={styles.skeletonFooter}>
        <View style={styles.skeletonBox} />
        <View style={styles.skeletonBox} />
      </View>
    </View>
  );

  const renderMarket = ({ item }: { item: Market }) => {
    const yesPrice = item.outcomePrices?.[0] || 0;
    const yesProb = (yesPrice * 100).toFixed(1);
    const isUp = item.oneDayPriceChange >= 0;

    return (
      <TouchableOpacity style={styles.card} onPress={() => onNavigate(item.slug)}>
        <Text style={styles.cardTitle} numberOfLines={3}>{item.question}</Text>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.oddsLabel}>Yes Odds</Text>
            <Text style={styles.oddsValue}>{yesProb}%</Text>
          </View>
          <View style={styles.rightStats}>
            <Text style={[styles.changeText, isUp ? styles.success : styles.danger]}>
              {isUp ? '↗' : '↘'} {Math.abs(item.oneDayPriceChange * 100).toFixed(1)}% (24h)
            </Text>
            <Text style={styles.volText}>Vol: ${(item.volume24hr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Odds Radar</Text>
        <Text style={styles.subtitle}>Real-time prediction market tracking</Text>
      </View>

      <View style={styles.filterBar}>
        <View style={styles.filterGroup}>
          <TouchableOpacity onPress={() => setSortBy('biggest_mover')} style={[styles.filterBtn, sortBy === 'biggest_mover' && styles.filterBtnActive]}>
            <Text style={[styles.filterText, sortBy === 'biggest_mover' && styles.filterTextActive]}>Movers</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortBy('volume')} style={[styles.filterBtn, sortBy === 'volume' && styles.filterBtnActive]}>
            <Text style={[styles.filterText, sortBy === 'volume' && styles.filterTextActive]}>Volume</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSortBy('end_date')} style={[styles.filterBtn, sortBy === 'end_date' && styles.filterBtnActive]}>
            <Text style={[styles.filterText, sortBy === 'end_date' && styles.filterTextActive]}>Ending</Text>
          </TouchableOpacity>
        </View>
        
        {status === 'refreshing' && (
          <View style={styles.refreshIndicator}>
            <ActivityIndicator size="small" color="#00f2fe" />
            <Text style={styles.refreshingText}>Updating</Text>
          </View>
        )}
      </View>

      {status === 'loading' && markets.length === 0 ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6]}
          keyExtractor={item => item.toString()}
          renderItem={renderSkeleton}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <FlatList
          data={sortedMarkets}
          keyExtractor={item => item.id}
          renderItem={renderMarket}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={10}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' },
  loadingText: { color: '#00f2fe', marginTop: 20, fontSize: 18, fontWeight: 'bold' },
  errorText: { color: '#ef4444', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  errorSubText: { color: '#a3a3a3', marginBottom: 20 },
  retryBtn: { backgroundColor: '#4facfe', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  retryBtnText: { color: '#fff', fontWeight: 'bold' },
  header: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 32, fontWeight: '900', color: '#00f2fe' },
  subtitle: { color: '#a3a3a3', fontSize: 14, marginTop: 4 },
  filterBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  filterGroup: { flexDirection: 'row', backgroundColor: '#141414', borderRadius: 8, padding: 4 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  filterBtnActive: { backgroundColor: '#1f1f1f' },
  filterText: { color: '#a3a3a3', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  refreshIndicator: { flexDirection: 'row', alignItems: 'center' },
  refreshingText: { color: '#00f2fe', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },
  listContainer: { padding: 20, gap: 16 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  oddsLabel: { color: '#a3a3a3', fontSize: 12, marginBottom: 4 },
  oddsValue: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  rightStats: { alignItems: 'flex-end' },
  changeText: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  success: { color: '#10b981' },
  danger: { color: '#ef4444' },
  volText: { color: '#737373', fontSize: 12 },
  cardSkeleton: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 20, height: 140, justifyContent: 'space-between' },
  skeletonLine: { height: 20, backgroundColor: '#141414', borderRadius: 4, marginBottom: 10 },
  skeletonFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  skeletonBox: { width: 80, height: 30, backgroundColor: '#141414', borderRadius: 4 },
});
