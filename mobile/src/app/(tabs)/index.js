import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Card,
  FAB,
  IconButton,
  List,
  Snackbar,
  Text,
} from 'react-native-paper';
import { router } from 'expo-router';
import { useDeleteTransaction, useTransactions } from '../../hooks/useTransactions';

export default function DashboardScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useTransactions();
  const del = useDeleteTransaction();
  const [snack, setSnack] = useState('');

  const net = useMemo(() => {
    if (!data) return 0;
    return data.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
  }, [data]);

  const handleDelete = async (id) => {
    try {
      await del.mutateAsync(id);
    } catch (err) {
      setSnack(err?.response?.data?.message || 'Delete failed');
    }
  };

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
        <Text>Failed to load transactions.</Text>
        <Text style={{ marginTop: 8 }} onPress={() => refetch()}>Tap to retry</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text variant="labelMedium">Net Balance</Text>
          <Text
            variant="headlineMedium"
            style={{ color: net >= 0 ? '#2e7d32' : '#c62828' }}
          >
            {net >= 0 ? '' : '-'}${Math.abs(net).toFixed(2)}
          </Text>
        </Card.Content>
      </Card>

      <FlatList
        data={data || []}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No transactions yet. Tap + to add one.</Text>
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.description || item.category}
            description={`${item.category} · ${new Date(item.date).toLocaleDateString()}`}
            right={() => (
              <View style={styles.right}>
                <Text
                  style={{ color: item.type === 'income' ? '#2e7d32' : '#c62828' }}
                >
                  {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                </Text>
                <IconButton
                  icon="trash-can-outline"
                  onPress={() => handleDelete(item._id)}
                  accessibilityLabel="Delete"
                />
              </View>
            )}
          />
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/add-transaction')}
      />

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  balanceCard: { margin: 16 },
  right: { flexDirection: 'row', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 32, paddingHorizontal: 24 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});