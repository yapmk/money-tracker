import { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  IconButton,
  List,
  Snackbar,
  Text,
} from 'react-native-paper';
import { router } from 'expo-router';
import {
  useDeleteTransaction,
  useTransactions,
} from '../../hooks/useTransactions';
import FilterBar from '../../features/filters/FilterBar';

export default function TransactionsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useTransactions();
  const del = useDeleteTransaction();
  const [snack, setSnack] = useState('');

  const handleDelete = (id) => {
    Alert.alert('Delete transaction?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await del.mutateAsync(id);
          } catch (err) {
            setSnack(err?.response?.data?.message || 'Delete failed');
          }
        },
      },
    ]);
  };

  const handleEdit = (id) => {
    router.push({ pathname: '/add-transaction', params: { id } });
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
        <Text style={{ marginTop: 8 }} onPress={() => refetch()}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <FilterBar />
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No transactions in this period. Tap + to add one.
          </Text>
        }
        renderItem={({ item }) => (
          <List.Item
            title={item.description || item.category}
            description={`${item.category} · ${new Date(
              item.date,
            ).toLocaleDateString()}`}
            right={() => (
              <View style={styles.right}>
                <Text
                  style={{
                    color: item.type === 'income' ? '#2e7d32' : '#c62828',
                  }}
                >
                  {item.type === 'income' ? '+' : '-'}$
                  {item.amount.toFixed(2)}
                </Text>
                <IconButton
                  icon="pencil-outline"
                  onPress={() => handleEdit(item._id)}
                  accessibilityLabel="Edit"
                />
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
      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, paddingBottom: 8 },
  right: { flexDirection: 'row', alignItems: 'center' },
  empty: { textAlign: 'center', marginTop: 32, paddingHorizontal: 24 },
});