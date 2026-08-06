export function calculateInstallmentDisplayTerms({
  tuitionTotalCents,
  registrationFeeCents,
  installmentsTotal,
}) {
  const tuition = Number(tuitionTotalCents);
  const registrationFee = Number(registrationFeeCents);
  const installments = Number(installmentsTotal);
  const tuitionBalanceCents = tuition - registrationFee;
  const installmentAmountCents = Math.floor(tuitionBalanceCents / installments);

  if (
    !Number.isInteger(tuition) ||
    !Number.isInteger(registrationFee) ||
    !Number.isInteger(installments) ||
    installments <= 0 ||
    installmentAmountCents <= 0
  ) {
    return null;
  }

  const finalInstallmentAmountCents =
    tuitionBalanceCents - installmentAmountCents * (installments - 1);
  const hasFinalAdjustment = finalInstallmentAmountCents !== installmentAmountCents;

  return {
    installmentsTotal: installments,
    regularInstallmentsTotal: hasFinalAdjustment ? installments - 1 : installments,
    installmentAmountCents,
    finalInstallmentAmountCents,
    hasFinalAdjustment,
  };
}

export function formatInstallmentDisplaySummary(terms, cadence, formatAmount) {
  if (!terms) {
    return "Not available";
  }

  const regularSummary = `${terms.regularInstallmentsTotal} ${cadence} payments of ${formatAmount(
    terms.installmentAmountCents
  )}`;

  return terms.hasFinalAdjustment
    ? `${regularSummary}, then a final payment of ${formatAmount(terms.finalInstallmentAmountCents)}`
    : regularSummary;
}
