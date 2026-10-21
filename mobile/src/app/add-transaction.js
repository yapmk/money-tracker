import { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Chip,
  HelperText,
  SegmentedButtons,
  Snackbar,
  TextInput,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { CATEGORIES } from '../constants/categories';
import {
  useCreateTransaction,
  useUpdateTransaction,
} from '../hooks/useTransactions';

export default function TransactionFormScreen() {
  const { id } = useLocalSearchParams();
  const isEdit = !!id;
  const qc = useQueryClient();

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState('');

  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  // Prefill in edit mode — search across all cached filter ranges
  useEffect(() => {
    if (!isEdit) return;
    const all = qc.getQueriesData({ queryKey: ['transactions'] });
    let existing = null;
    for (const [, list] of all) {
      if (Array.isArray(list)) {
        const found = list.find((t) => t._id === id);
        if (found) {
          existing = found;
          break;
        }
      }
    }
    if (existing) {
      setType(existing.type);
      setAmount(String(existing.amount));
      setDescription(existing.description || '');
      setCategory(existing.category);
      if (existing.date) setDate(new Date(existing.date));
    }
  }, [isEdit, id, qc]);

  const onValueChange = (_event, selectedDate) => {
    if (selectedDate) setDate(selectedDate);
    if (Platform.OS === 'android') setShowPicker(false);
  };

  const onDismiss = () => {
    setShowPicker(false);
  };

  const validate = () => {
    const next = {};
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      next.amount = 'Amount must be greater than 0';
    }
    if (!category) {
      next.category = 'Please select a category';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;

    const payload = {
      type,
      amount: Number(amount),
      description: description.trim(),
      category,
      date: date.toISOString(),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      router.back();
    } catch (err) {
      setSnack(
        err?.response?.data?.message ||
          (isEdit
            ? 'Failed to update transaction'
            : 'Failed to save transaction'),
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const formattedDate = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <Stack.Screen
        options={{ title: isEdit ? 'Edit Transaction' : 'Add Transaction' }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <SegmentedButtons
          value={type}
          onValueChange={setType}
          buttons={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
        />

        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          error={!!errors.amount}
        />
        <HelperText type="error" visible={!!errors.amount}>
          {errors.amount}
        </HelperText>

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
        />

        {/* Date row */}
        <View style={styles.dateRow}>
          <Pressable
            style={styles.dateField}
            onPress={() => setShowPicker(true)}
            accessibilityRole="button"
            accessibilityLabel={`Date: ${formattedDate}`}
          >
            <View pointerEvents="none">
              <TextInput
                label="Date"
                value={formattedDate}
                mode="outlined"
                editable={false}
                right={<TextInput.Icon icon="calendar" />}
              />
            </View>
          </Pressable>
          <Button
            mode="text"
            compact
            onPress={() => setDate(new Date())}
            style={styles.todayBtn}
          >
            Today
          </Button>
        </View>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onValueChange={onValueChange}
            onDismiss={onDismiss}
          />
        )}
        {showPicker && Platform.OS === 'ios' && (
          <Button mode="text" compact onPress={() => setShowPicker(false)}>
            Done
          </Button>
        )}

        <View style={styles.chips}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              selected={category === c}
              onPress={() => setCategory(c)}
            >
              {c}
            </Chip>
          ))}
        </View>
        <HelperText type="error" visible={!!errors.category}>
          {errors.category}
        </HelperText>

        <Button
          mode="contained"
          onPress={onSubmit}
          loading={isPending}
          disabled={isPending}
        >
          {isEdit ? 'Save changes' : 'Save'}
        </Button>

        <Snackbar
          visible={!!snack}
          onDismiss={() => setSnack('')}
          duration={3000}
        >
          {snack}
        </Snackbar>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8, paddingBottom: 32 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateField: { flex: 1 },
  todayBtn: { alignSelf: 'center' },
});