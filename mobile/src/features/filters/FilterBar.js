import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, IconButton, SegmentedButtons, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFilter, formatMonth, formatDate } from './FilterContext';

export default function FilterBar({ style }) {
  const {
    preset,
    setPreset,
    anchor,
    goPrev,
    goNext,
    canGoNext,
    customRange,
    setCustomRange,
  } = useFilter();
  const [picker, setPicker] = useState(null); // 'start' | 'end' | null

  const applyDate = (date) => {
    if (picker === 'start') setCustomRange(date, customRange.end);
    else setCustomRange(customRange.start, date);
  };

  const onChange = (event, date) => {
    if (Platform.OS === 'android') {
      setPicker(null);
      if (event.type === 'dismissed' || !date) return;
      applyDate(date);
    } else if (date) {
      applyDate(date); // keep inline picker open on iOS
    }
  };

  return (
    <View style={[styles.container, style]}>
      <SegmentedButtons
        value={preset}
        onValueChange={setPreset}
        buttons={[
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
          { value: 'custom', label: 'Custom' },
        ]}
      />

      {(preset === 'month' || preset === 'year') && (
        <View style={styles.row}>
          <IconButton icon="chevron-left" onPress={goPrev} accessibilityLabel="Previous" />
          <Text variant="titleMedium">
            {preset === 'month'
              ? formatMonth(anchor)
              : String(anchor.getFullYear())}
          </Text>
          <IconButton
            icon="chevron-right"
            onPress={goNext}
            disabled={!canGoNext}
            accessibilityLabel="Next"
          />
        </View>
      )}

      {preset === 'custom' && (
        <View style={styles.row}>
          <Button
            mode="outlined"
            compact
            onPress={() => setPicker('start')}
            style={{ flex: 1 }}
          >
            From {formatDate(customRange.start)}
          </Button>
          <Button
            mode="outlined"
            compact
            onPress={() => setPicker('end')}
            style={{ flex: 1, marginLeft: 8 }}
          >
            To {formatDate(customRange.end)}
          </Button>
        </View>
      )}

      {picker && (
        <>
          <DateTimePicker
            value={picker === 'start' ? customRange.start : customRange.end}
            mode="date"
            onChange={onChange}
            maximumDate={new Date()}
          />
          {Platform.OS === 'ios' && (
            <Button compact onPress={() => setPicker(null)}>
              Done
            </Button>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
});