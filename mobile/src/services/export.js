import * as XLSX from 'xlsx';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export async function exportTransactionsToExcel(transactions, label) {
  const rows = transactions.map((t) => ({
    Date: new Date(t.date).toLocaleDateString(),
    Type: t.type,
    Category: t.category,
    Description: t.description || '',
    Amount: t.amount,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

  const safeLabel = (label || 'export')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const fileName = `transactions-${safeLabel}.xlsx`;
  const file = new File(Paths.cache, fileName);

  if (!file.exists) {
    await file.create({ intermediates: true, overwrite: true });
  }
  await file.write(wbout, { encoding: 'base64' });

  await Sharing.shareAsync(file.uri, {
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Share Transactions',
    UTI: 'com.microsoft.excel.xlsx',
  });
}