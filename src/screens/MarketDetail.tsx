import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useMarketsStore, Market } from '../shared/store';
import { fetchPriceHistory } from '../shared/api';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export const MarketDetail = ({ slug, onBack }: { slug: string, onBack: () => void }) => {
  const { markets } = useMarketsStore();
  const [market, setMarket] = useState<Market | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const m = markets.find(m => m.slug === slug);
    if (m) {
      setMarket(m);
      if (m.clobTokenIds?.[0]) {
        fetchPriceHistory(m.clobTokenIds[0])
          .then(data => {
            const prices = data.map((d: any) => d.p * 100);
            const times = data.map((d: any) => {
              const date = new Date(d.t * 1000);
              return `${date.getMonth()+1}/${date.getDate()}`;
            });
            
            if (prices.length > 7) {
              const step = Math.floor(prices.length / 7);
              setHistory(prices.filter((_, i) => i % step === 0));
              setLabels(times.filter((_, i) => i % step === 0));
            } else {
              setHistory(prices);
              setLabels(times);
            }
            setLoading(false);
          })
          .catch(e => {
            console.error(e);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
  }, [markets, slug]);

  if (!market) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00f2fe" />
      </View>
    );
  }

  const yesPrice = market.outcomePrices?.[0] || 0;
  const yesProb = (yesPrice * 100).toFixed(1);
  const isUp = market.oneDayPriceChange >= 0;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>← Back to Markets</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{market.question}</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Current 'Yes' Odds</Text>
          <Text style={styles.statValue}>{yesProb}%</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>24h Change</Text>
          <Text style={[styles.statValue, isUp ? styles.success : styles.danger]}>
            {isUp ? '↗' : '↘'} {Math.abs(market.oneDayPriceChange * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>24h Volume</Text>
          <Text style={styles.statValue}>${(market.volume24hr || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Liquidity</Text>
          <Text style={styles.statValue}>${(market.liquidity || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Price History (Yes)</Text>
        {loading ? (
          <View style={styles.chartLoader}>
            <ActivityIndicator size="large" color="#00f2fe" />
          </View>
        ) : history.length > 0 ? (
          <LineChart
            data={{
              labels: labels,
              datasets: [{ data: history }]
            }}
            width={screenWidth - 40}
            height={220}
            yAxisSuffix="%"
            withDots={false}
            withInnerLines={false}
            chartConfig={{
              backgroundColor: '#141414',
              backgroundGradientFrom: '#141414',
              backgroundGradientTo: '#141414',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 242, 254, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(163, 163, 163, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '0' }
            }}
            bezier
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        ) : (
          <View style={styles.chartEmpty}>
            <Text style={styles.emptyText}>No price history available.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505', padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' },
  backBtn: { marginBottom: 20, paddingVertical: 10 },
  backText: { color: '#00f2fe', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '48%', backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  statLabel: { color: '#a3a3a3', fontSize: 12, marginBottom: 8 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  success: { color: '#10b981' },
  danger: { color: '#ef4444' },
  chartContainer: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 40 },
  chartTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  chartLoader: { height: 220, justifyContent: 'center', alignItems: 'center' },
  chartEmpty: { height: 220, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 12 },
  emptyText: { color: '#737373' },
});
