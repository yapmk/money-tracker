import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as transactions from '../services/transactions';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: transactions.list,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: transactions.create,
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