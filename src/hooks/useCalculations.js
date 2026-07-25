import { useMemo } from 'react';

const RATES = {
  kontant: { rate: 0, fee: 0, label: '1. Kontant', short: 'Kontant' },
  billån1: { rate: 5.19, fee: 1500, label: '2. Billån (Spb. Sør)', short: 'Spb. Sør' },
  billån2: { rate: 8.06, fee: 1500, label: '3. Billån (Spb. 1)', short: 'Spb. 1' },
  grønt: { rate: 5.30, fee: 1500, label: '4. Grønt billån', short: 'Grønt' },
  bolig: { rate: 5.40, fee: 3500, label: '5. Boliglån', short: 'Boliglån' },
  forbruk: { rate: 16.40, fee: 1000, label: '6. Forbrukslån', short: 'Forbruk' },
  leasing: { rate: null, fee: 0, label: '7. Privatleasing', short: 'Leasing' },
};

function calcMonthly(principal, annualRate, years) {
  if (annualRate === 0 || principal === 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

function calcTotalInterest(principal, annualRate, years, monthly) {
  if (annualRate === 0 || principal === 0) return 0;
  return monthly * years * 12 - principal;
}

export function formatKR(value) {
  if (isNaN(value) || value === null || value === undefined) return '—';
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0,
  }).format(value);
}

// Financing options for the model-vs-model comparison: cash + the loans (leasing is
// excluded since its price is a single global input, not per-model). Labels have the
// leading "N." numbering stripped for a cleaner dropdown.
export const FINANCING_OPTIONS = Object.entries(RATES)
  .filter(([, r]) => r.rate !== null)
  .map(([key, r]) => ({ key, label: r.label.replace(/^\d+\.\s*/, ''), rate: r.rate, fee: r.fee }));

// Reusable total-cost-of-ownership calculation for a single car/price. Same formulas
// as the main scenario loop (annuity loan, after-tax interest, depreciation on the full
// price, flat running costs). Used by useCalculations and by CompareCars.
export function computeOwnership(price, { egenkapital, løpetid, skatt, verditap, driftskostnader, rate, fee = 0 }) {
  const loanAmount = Math.max(0, price - egenkapital);
  const totalDepreciation = price * (1 - Math.pow(1 - verditap / 100, løpetid));
  const monthlyDrift = driftskostnader / 12;
  const totalDrift = driftskostnader * løpetid;
  const monthly = calcMonthly(loanAmount, rate, løpetid);
  const totalInterest = calcTotalInterest(loanAmount, rate, løpetid, monthly);
  const interestAfterTax = totalInterest * (1 - skatt / 100);
  const monthlyTotal = monthly + monthlyDrift;
  const totalCost = interestAfterTax + fee + totalDepreciation + totalDrift;
  return { loanAmount, monthly, totalInterest, interestAfterTax, fee, totalDepreciation, totalDrift, monthlyTotal, totalCost };
}

export default function useCalculations(inputs) {
  const { bilPris, egenkapital, løpetid, avkastning, skatt, sparepenger, inntekt, verditap, driftskostnader, leasingpris, renteJustering } = inputs;

  return useMemo(() => {
    const loanAmount = Math.max(0, bilPris - egenkapital);

    // Total depreciation over the ownership period — on the FULL car price,
    // not the loan amount (you lose value on the whole car regardless of financing).
    const totalDepreciation = bilPris * (1 - Math.pow(1 - verditap / 100, løpetid));
    // Running costs (fuel/charging, insurance, service, tolls) — equal across all
    // scenarios since it's the same car; applies to leasing too.
    const monthlyDrift = driftskostnader / 12;
    const totalDrift = driftskostnader * løpetid;

    const scenarios = {};
    let minCost = Infinity;
    let maxCost = -Infinity;
    let bestKey = null;
    let worstKey = null;

    const rateShift = renteJustering || 0;

    Object.entries(RATES).forEach(([key, { rate, fee, label, short }]) => {
      if (rate === null) {
        // Leasing: computed from the user's monthly lease price. No equity or
        // depreciation (you don't own it); drift still applies. Not rate-sensitive.
        scenarios[key] = {
          label,
          short,
          rate: null,
          fee,
          monthly: leasingpris,
          totalInterest: null,
          interestAfterTax: null,
          monthlyTotal: leasingpris + monthlyDrift,
          totalCost: leasingpris * 12 * løpetid + totalDrift,
        };
        return;
      }

      // Sensitivity: shift loan rates by renteJustering (kontant stays 0, no rate
      // to shift). Floor at 0 so a large negative shift can't invent a discount.
      const adjRate = key === 'kontant' ? 0 : Math.max(0, rate + rateShift);
      const monthly = calcMonthly(loanAmount, adjRate, løpetid);
      const totalInterest = calcTotalInterest(loanAmount, adjRate, løpetid, monthly);
      const interestAfterTax = totalInterest * (1 - skatt / 100);
      const monthlyTotal = monthly + monthlyDrift;
      const totalCost = interestAfterTax + fee + totalDepreciation + totalDrift;

      scenarios[key] = { label, short, rate: adjRate, fee, monthly, totalInterest, interestAfterTax, monthlyTotal, totalCost };

      if (key !== 'kontant') {
        // Rank loans by after-tax interest plus the establishment fee.
        const loanCost = interestAfterTax + fee;
        if (loanCost < minCost) { minCost = loanCost; bestKey = key; }
        if (loanCost > maxCost) { maxCost = loanCost; worstKey = key; }
      }
    });

    // Opportunity cost
    const lostPerYear = egenkapital * (avkastning / 100);
    const lostTotal = lostPerYear * løpetid;
    // Risk bands: what the tied-up equity would earn under pessimistic / moderate /
    // optimistic return assumptions (linear, matching the base opportunity-cost model).
    const returnBands = [
      { pct: 3, label: 'Pessimistisk', lostTotal: egenkapital * 0.03 * løpetid },
      { pct: 5, label: 'Moderat', lostTotal: egenkapital * 0.05 * løpetid },
      { pct: 7, label: 'Optimistisk', lostTotal: egenkapital * 0.07 * løpetid },
    ];
    const bufferAfterPurchase = sparepenger - bilPris;
    const monthlyPercent = inntekt > 0 && scenarios.billån1?.monthly
      ? (scenarios.billån1.monthly / inntekt) * 100
      : 0;

    // Conclusion
    let conclusion = { type: '', title: '', detail: '' };
    const cheapestLoan = minCost;

    if (lostTotal < cheapestLoan) {
      conclusion = {
        type: 'cash',
        title: 'BETAL KONTANT — billigst totalt',
        detail: `Tapt avkastning (${formatKR(lostTotal)}) er lavere enn rentekostnaden på selv det billigste lånet (${formatKR(cheapestLoan)}). Du sparer penger på å betale bilen kontant.`,
      };
    } else if (avkastning > scenarios.billån1.rate && scenarios.billån1.interestAfterTax < lostTotal) {
      conclusion = {
        type: 'loan',
        title: 'TA OPP LÅN — Behold sparingen',
        detail: `Forventet avkastning (${avkastning}%) er høyere enn billånsrenten (${scenarios.billån1.rate.toFixed(2)}%). Ved å låne kan du tjene ${formatKR(lostTotal - scenarios.billån1.interestAfterTax)} mer enn rentekostnaden.`,
      };
    } else {
      conclusion = {
        type: 'mixed',
        title: 'VURDER DELVIS FINANSIERING',
        detail: `Forskjellen er liten. Vurder å betale 50–70% kontant og låne resten. Da beholder du likviditet uten å betale for mye i renter.`,
      };
    }

    // The largest real cost is usually depreciation, not interest — flag it so the
    // recommendation is read in a total-cost-of-ownership context.
    if (totalDepreciation > 0) {
      conclusion.detail += ` Merk: Verditapet over ${løpetid} år (${formatKR(totalDepreciation)}) er som regel den største kostnaden ved bileie — se «Total kostnad» i tabellen for det fulle bildet.`;
    }

    // Risk sensitivity of the cash-vs-loan call: the recommendation flips depending
    // on realised return. Show both ends of the band.
    const lowBand = returnBands[0].lostTotal;
    const highBand = returnBands[2].lostTotal;
    if (cheapestLoan < Infinity && egenkapital > 0) {
      const lowPart = lowBand < cheapestLoan
        ? `Ved lav avkastning (3%) lønner det seg å betale kontant`
        : `Ved lav avkastning (3%) er lån fortsatt konkurransedyktig`;
      const highPart = highBand > cheapestLoan
        ? `ved høy avkastning (7%) lønner det seg å låne og beholde sparingen`
        : `selv ved høy avkastning (7%) er forskjellen liten`;
      conclusion.detail += ` Følsomhet: ${lowPart}, mens ${highPart}.`;
    }

    // Reflect an active rate-sensitivity shift in the recommendation text.
    if (rateShift !== 0) {
      conclusion.detail += ` (Beregnet med en rentejustering på ${rateShift > 0 ? '+' : ''}${rateShift.toFixed(2)} prosentpoeng.)`;
    }

    // Advice
    const advice = [
      {
        icon: '📊',
        title: 'Likviditet',
        text: bufferAfterPurchase < 50000
          ? 'ADVARSEL: Svært lav buffer etter kjøp! Vurder å låne 50–100k for å beholde sikkerhetsnett.'
          : 'God buffer — du tåler uforutsette utgifter.',
        type: bufferAfterPurchase < 50000 ? 'warning' : 'success',
      },
      {
        icon: '🏦',
        title: 'Lånevalg',
        text: RATES.billån1.rate < 5.5
          ? 'Billån fra Sparebanken Sør (5,19%) er best i test. Be om fast rente hvis du vil sikre deg.'
          : 'Sjekk om du kan forhandle ned renten — be om tilbud fra 2–3 banker.',
        type: 'info',
      },
      {
        icon: '💰',
        title: 'Forhandling',
        text: bilPris > 300000
          ? 'Ved kjøp over 300k kan du ofte forhandle om kampanjefinansiering. Spør om 0–3% rente.'
          : 'Vurder å betale kontant — lave beløp gir sjelden gode lånevilkår.',
        type: 'info',
      },
      {
        icon: '📉',
        title: 'Nedbetaling',
        text: scenarios.billån1?.monthly > 0
          ? `Ved lån på ${formatKR(loanAmount)} over ${løpetid} år: Ekstrainnbetaling på 2 000 kr/mnd kan kutte nedbetalingstiden med ca. ${Math.round(løpetid * 0.3)} år.`
          : 'Uten lån? Flott! Da har du full kontroll.',
        type: 'info',
      },
    ];

    return {
      loanAmount,
      scenarios,
      bestKey,
      worstKey,
      totalDepreciation,
      totalDrift,
      monthlyDrift,
      opportunityCost: { lostPerYear, lostTotal, bufferAfterPurchase, monthlyPercent, returnBands },
      conclusion,
      advice,
    };
  }, [bilPris, egenkapital, løpetid, avkastning, skatt, sparepenger, inntekt, verditap, driftskostnader, leasingpris, renteJustering]);
}
