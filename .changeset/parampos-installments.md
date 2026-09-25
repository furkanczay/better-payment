---
'better-payment': minor
---

Parampos installments: `installmentInfo()` returns the card's available installment counts with
Param's totals (`BIN_SanalPos` + `TP_Ozel_Oran_SK_Liste`), `calculatePaidPrice()` computes
`paidPrice` (Toplam_Tutar) for an installment count, and `getInstallmentRates()` returns the rate
table. `InstallmentDetail` gains an optional `commissionRate`. Akbank's `installmentInfo()` now
explains that its API has no installment-rate query.
