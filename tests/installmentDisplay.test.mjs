import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateInstallmentDisplayTerms,
  formatInstallmentDisplaySummary,
} from "../src/lib/installmentTerms.js";

const formatMoney = (cents) => `$${(cents / 100).toFixed(2)}`;

test("registration display matches the exact $2,000 Stripe installment totals", () => {
  const weekly = calculateInstallmentDisplayTerms({
    tuitionTotalCents: 200_000,
    registrationFeeCents: 1_000,
    installmentsTotal: 12,
  });
  const biweekly = calculateInstallmentDisplayTerms({
    tuitionTotalCents: 200_000,
    registrationFeeCents: 1_000,
    installmentsTotal: 6,
  });

  assert.equal(
    formatInstallmentDisplaySummary(weekly, "weekly", formatMoney),
    "11 weekly payments of $165.83, then a final payment of $165.87"
  );
  assert.equal(
    formatInstallmentDisplaySummary(biweekly, "biweekly", formatMoney),
    "5 biweekly payments of $331.66, then a final payment of $331.70"
  );
});
