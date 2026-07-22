import { useMemo } from 'react';

const RATES = {
  kontant: { rate: 0, label: '1. Kontant', short: 'Kontant' },
  billån1: { rate: 5.19, label: '2. Billån (Spb. Sør)', short: 'Spb. Sør' },
  billån2: { rate: 8.06, label: '3. Billån (Spb. 1)', short: 'Spb. 1' },
  grønt: { rate: 5.30, label: '4. Grønt billån', short: 'Grønt' },
  bolig: { rate: 5.40, label: '5. Boliglån', short: 'Boliglån' },
  forbruk: { rate: 16.40, label: '6. Forbrukslån', short: 'Forbruk' },
  leasing: { rate: null, label: '7. Privatleasing', short: 'Leasing' },
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

export default function useCalculations(inputs) {
  const { bilPris, egenkapital, løpetid, avkastning, skatt, sparepenger, inntekt } = inputs;

  return useMemo(() => {
    const loanAmount = Math.max(0, bilPris - egenkapital);

    const scenarios = {};
    let minCost = Infinity;
    let maxCost = -Infinity;
    let bestKey = null;
    let worstKey = null;

    Object.entries(RATES).forEach(([key, { rate, label, short }]) => {
      if (rate === null) {
        scenarios[key] = {
          label,
          short,
          rate: null,
          monthly: null,
          totalInterest: null,
          interestAfterTax: null,
        };
        return;
      }

      const monthly = calcMonthly(loanAmount, rate, løpetid);
      const totalInterest = calcTotalInterest(loanAmount, rate, løpetid, monthly);
      const interestAfterTax = totalInterest * (1 - skatt / 100);

      scenarios[key] = { label, short, rate, monthly, totalInterest, interestAfterTax };

      if (key !== 'kontant') {
        if (interestAfterTax < minCost) { minCost = interestAfterTax; bestKey = key; }
        if (interestAfterTax > maxCost) { maxCost = interestAfterTax; worstKey = key; }
      }
    });

    // Opportunity cost
    const lostPerYear = egenkapital * (avkastning / 100);
    const lostTotal = lostPerYear * løpetid;
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
    } else if (avkastning > RATES.billån1.rate && scenarios.billån1.interestAfterTax < lostTotal) {
      conclusion = {
        type: 'loan',
        title: 'TA OPP LÅN — Behold sparingen',
        detail: `Forventet avkastning (${avkastning}%) er høyere enn billånsrenten (${RATES.billån1.rate}%). Ved å låne kan du tjene ${formatKR(lostTotal - scenarios.billån1.interestAfterTax)} mer enn rentekostnaden.`,
      };
    } else {
      conclusion = {
        type: 'mixed',
        title: 'VURDER DELVIS FINANSIERING',
        detail: `Forskjellen er liten. Vurder å betale 50–70% kontant og låne resten. Da beholder du likviditet uten å betale for mye i renter.`,
      };
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
      opportunityCost: { lostPerYear, lostTotal, bufferAfterPurchase, monthlyPercent },
      conclusion,
      advice,
    };
  }, [bilPris, egenkapital, løpetid, avkastning, skatt, sparepenger, inntekt]);
}
