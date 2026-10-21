import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as transactions from '../services/transactions';
import { useFilter } from '../features/filters/FilterContext';

export function useTransactions() {
  const { range } = useFilter();
  const fromKey = range.start.getTime();
  const toKey = range.end.getTime();
  return useQuery({
    queryKey: ['transactions', fromKey, toKey],
    queryFn: () => transactions.list({ from: range.start, to: range.end }),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactions.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => transactions.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactions.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
}