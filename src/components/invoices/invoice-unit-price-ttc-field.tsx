"use client";

import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { unitPriceHTFromUnitTTC, unitPriceTTCFromHT } from "@/lib/invoice";

interface InvoiceUnitPriceTtcFieldProps {
  unitPriceHT: number;
  vatRate: number;
  onUnitPriceHTChange: (unitPriceHT: number) => void;
  error?: string;
}

export function InvoiceUnitPriceTtcField({
  unitPriceHT,
  vatRate,
  onUnitPriceHTChange,
  error,
}: InvoiceUnitPriceTtcFieldProps) {
  const unitPriceTTC = unitPriceTTCFromHT(unitPriceHT, vatRate);

  return (
    <FormField label="P.U. TTC" error={error} required>
      <Input
        type="number"
        min={0}
        step={0.01}
        value={unitPriceTTC}
        onChange={(e) => {
          const ttc = Number(e.target.value) || 0;
          onUnitPriceHTChange(unitPriceHTFromUnitTTC(ttc, vatRate));
        }}
      />
    </FormField>
  );
}
