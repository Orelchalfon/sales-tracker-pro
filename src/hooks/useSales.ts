import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Sale, SaleInput } from "@/types/sale";
import {
  fetchSalesForMonth,
  fetchSaleYears,
  insertSale,
  updateSale as apiUpdateSale,
  deleteSale as apiDeleteSale,
} from "@/integrations/supabase/sales-api";

export function useSales(year: number, month: number) {
  const queryClient = useQueryClient();

  const salesQuery = useQuery<Sale[]>({
    queryKey: ["sales", year, month],
    queryFn: () => fetchSalesForMonth(year, month),
  });

  const yearsQuery = useQuery<number[]>({
    queryKey: ["sale-years"],
    queryFn: fetchSaleYears,
    staleTime: 5 * 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: (input: SaleInput) => insertSale(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sale-years"] });
      toast.success("המכירה נוספה בהצלחה");
    },
    onError: (err: Error) => {
      toast.error(`שגיאה בהוספת המכירה: ${err.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<SaleInput> }) =>
      apiUpdateSale(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      toast.success("המכירה עודכנה בהצלחה");
    },
    onError: (err: Error) => {
      toast.error(`שגיאה בעדכון המכירה: ${err.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteSale(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sale-years"] });
      toast.success("המכירה נמחקה");
    },
    onError: (err: Error) => {
      toast.error(`שגיאה במחיקת המכירה: ${err.message}`);
    },
  });

  return {
    sales: salesQuery.data ?? [],
    isLoading: salesQuery.isLoading,
    availableYears: yearsQuery.data ?? [],
    addSale: (input: SaleInput) => addMutation.mutate(input),
    updateSale: (id: string, patch: Partial<SaleInput>) => updateMutation.mutate({ id, patch }),
    deleteSale: (id: string) => deleteMutation.mutate(id),
  };
}
