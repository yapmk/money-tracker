import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTransactions } from '../../hooks/useTransactions';
import { useFilter } from '../../features/filters/FilterContext';
import { exportTransactionsToExcel } from '../../services/export';
import FilterBar from '../../features/filters/FilterBar';

export default function ToolsScreen() {
  const { data } = useTransactions();
  const { label } = useFilter();
  const [busy, setBusy] = useState(false);
  const [snack, setSnack] = useState('');

  const onExport = async () => {
    if (!data || data.length === 0) {
      setSnack('No transactions to export in this period.');
      return;
    }
    setBusy(true);
    try {
      await exportTransactionsToExcel(data, label);
    } catch {
      setSnack('Export failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <FilterBar />

      <Card>
        <Card.Content>
          <View style={styles.titleRow}>
            <MaterialCommunityIcons
              name="microsoft-excel"
              size={28}
              color="#217346"
            />
            <Text variant="titleMedium" style={{ marginLeft: 8 }}>
              Export to Excel
            </Text>
          </View>
          <Text style={styles.body}>
            Exports <Text style={styles.strong}>{data?.length ?? 0}</Text>{' '}
            transaction{(data?.length ?? 0) === 1 ? '' : 's'} from{' '}
            <Text style={styles.strong}>{label}</Text>. You'll then get your
            device's share sheet to send the .xlsx file to WhatsApp or any
            other app.
          </Text>
          <Button
            mode="contained"
            icon="share-variant"
            onPress={onExport}
            loading={busy}
            disabled={busy}
            style={{ marginTop: 12 }}
          >
            Export & share
          </Button>
        </Card.Content>
      </Card>

      <Snackbar visible={!!snack} onDismiss={() => setSnack('')} duration={3000}>
        {snack}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  body: { opacity: 0.75, lineHeight: 20 },
  strong: { fontWeight: '600' },
});