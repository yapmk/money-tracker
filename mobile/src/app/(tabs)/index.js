import { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Divider,
  SegmentedButtons,
  Text,
} from 'react-native-paper';
import { PieChart } from 'react-native-chart-kit';
import { useTransactions } from '../../hooks/useTransactions';
import { CATEGORY_COLORS } from '../../constants/categories';
import FilterBar from '../../features/filters/FilterBar';

export default function HomeScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useTransactions();
  const [mode, setMode] = useState('expense');
  const { width } = useWindowDimensions();
  const chartWidth = width - 64;

  const net = useMemo(() => {
    if (!data) return 0;
    return data.reduce(
      (s, t) => s + (t.type === 'income' ? t.amount : -t.amount),
      0,
    );
  }, [data]);

  const { rows, total } = useMemo(() => {
    if (!data) return { rows: [], total: 0 };
    const totals = {};
    let sum = 0;
    for (const t of data) {
      if (t.type !== mode) continue;
      totals[t.category] = (totals[t.category] || 0) + t.amount;
      sum += t.amount;
    }
    const rows = Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || '#9E9E9E',
        percent: sum > 0 ? (value / sum) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
    return { rows, total: sum };
  }, [data, mode]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Failed to load data.</Text>
        <Text style={{ marginTop: 8 }} onPress={() => refetch()}>
          Tap to retry
        </Text>
      </View>
    );
  }

  const chartData = rows.map((r) => ({
    name: r.name,
    population: r.value,
    color: r.color,
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <FilterBar />

      <Card>
        <Card.Content>
          <Text variant="labelMedium">Net balance</Text>
          <Text
            variant="headlineMedium"
            style={{ color: net >= 0 ? '#2e7d32' : '#c62828' }}
          >
            {net >= 0 ? '' : '-'}${Math.abs(net).toFixed(2)}
          </Text>
        </Card.Content>
      </Card>

      <SegmentedButtons
        value={mode}
        onValueChange={setMode}
        buttons={[
          { value: 'expense', label: 'Expenses' },
          { value: 'income', label: 'Income' },
        ]}
      />

      <Card>
        <Card.Content>
          <Text variant="labelMedium">
            Total {mode === 'expense' ? 'expenses' : 'income'}
          </Text>
          <Text variant="headlineSmall" style={{ marginTop: 4, marginBottom: 8 }}>
            ${total.toFixed(2)}
          </Text>

          {rows.length === 0 ? (
            <Text style={styles.empty}>
              No {mode} transactions in this period.
            </Text>
          ) : (
            <>
              <View style={{ alignItems: 'center', marginVertical: 8 }}>
                <PieChart
                  data={chartData}
                  width={chartWidth}
                  height={200}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  hasLegend={false}
                />
              </View>
              <Divider style={{ marginVertical: 12 }} />
              {rows.map((row) => (
                <View key={row.name} style={styles.row}>
                  <View style={[styles.dot, { backgroundColor: row.color }]} />
                  <Text style={styles.rowName}>{row.name}</Text>
                  <Text style={styles.rowPercent}>{row.percent.toFixed(0)}%</Text>
                  <Text style={styles.rowAmount}>${row.value.toFixed(2)}</Text>
                </View>
              ))}
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 16, opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  rowName: { flex: 1 },
  rowPercent: { width: 48, textAlign: 'right', opacity: 0.6 },
  rowAmount: { width: 88, textAlign: 'right', fontVariant: ['tabular-nums'] },
});