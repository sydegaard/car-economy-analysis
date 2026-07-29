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
  if (annualRate === 0 || principal === 0 || years <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

function calcTotalInterest(principal, annualRate, years, monthly) {
  if (annualRate === 0 || principal === 0 || years <= 0) return 0;
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

// Running costs that rise with the car's age. `annualBase` is the first-year cost;
// each later year grows by `growthPct`. Sum = base·((1+g)^n − 1)/g  (= base·n when g=0).
export function totalRunningCost(annualBase, years, growthPct) {
  const g = (growthPct || 0) / 100;
  if (years <= 0) return 0;
  if (g === 0) return annualBase * years;
  return annualBase * ((Math.pow(1 + g, years) - 1) / g);
}

// Reusable total-cost-of-ownership calculation for a single car/price. Same formulas
// as the main scenario loop (annuity loan, after-tax interest, depreciation on the full
// price, running costs that escalate over time). Used by useCalculations and CompareCars.
export function computeOwnership(price, { egenkapital, løpetid, skatt, verditap, driftskostnader, kostnadsøkning, rate, fee = 0 }) {
  const loanAmount = Math.max(0, price - egenkapital);
  const totalDepreciation = price * (1 - Math.pow(1 - verditap / 100, løpetid));
  const totalDrift = totalRunningCost(driftskostnader, løpetid, kostnadsøkning);
  const monthlyDrift = løpetid > 0 ? totalDrift / (løpetid * 12) : driftskostnader / 12;
  const monthly = calcMonthly(loanAmount, rate, løpetid);
  const totalInterest = calcTotalInterest(loanAmount, rate, løpetid, monthly);
  const interestAfterTax = totalInterest * (1 - skatt / 100);
  const monthlyTotal = monthly + monthlyDrift;
  const totalCost = interestAfterTax + fee + totalDepreciation + totalDrift;
  return { loanAmount, monthly, totalInterest, interestAfterTax, fee, totalDepreciation, totalDrift, monthlyTotal, totalCost };
}

// Compound (rentes-rente) GAIN on K over n years at ratePct: K·((1+r)^n − 1).
export function compound(K, ratePct, years) {
  if (years <= 0 || !K) return 0;
  return K * (Math.pow(1 + ratePct / 100, years) - 1);
}

// Residual (rest-) value of a car after `years` given annual depreciation %.
export function residualValue(price, verditapPct, years) {
  return price * Math.pow(1 - verditapPct / 100, years);
}

// Remaining annuity-loan balance after `monthsPaid` months of an `years`-year loan.
function remainingBalance(principal, annualRate, years, monthsPaid) {
  if (principal <= 0 || years <= 0) return 0;
  const n = years * 12;
  const m = Math.min(Math.max(0, monthsPaid), n);
  if (annualRate === 0) return principal * (1 - m / n);
  const i = annualRate / 100 / 12;
  return principal * (Math.pow(1 + i, n) - Math.pow(1 + i, m)) / (Math.pow(1 + i, n) - 1);
}

const BSU_RATE = 3.5; // risk-free savings / BSU assumption (%)

// Leasing vs. owning over a long horizon, incl. residual value. Pure so the UI can pass
// an adjustable horizon without recomputing the whole hook. `rate` = the chosen loan rate.
export function compareLeaseVsOwn({ bilPris, egenkapital, løpetid, skatt, verditap, driftskostnader, kostnadsøkning, leasingpris, innskudd = 0, rate, horisont, kjørelengde }) {
  const loanAmount = Math.max(0, bilPris - egenkapital);
  const monthly = calcMonthly(loanAmount, rate, løpetid);
  const interestAfterTax = calcTotalInterest(loanAmount, rate, løpetid, monthly) * (1 - skatt / 100);
  const residual = residualValue(bilPris, verditap, horisont);
  const ownDrift = totalRunningCost(driftskostnader, horisont, kostnadsøkning);
  const leaseDrift = ownDrift; // same car usage either way
  const ownNet = interestAfterTax + (bilPris - residual) + ownDrift; // you still own `residual` at the end
  const leaseNet = innskudd + leasingpris * 12 * horisont + leaseDrift; // startleie upfront; own nothing at the end

  const series = [];
  for (let y = 1; y <= horisont; y++) {
    const resY = residualValue(bilPris, verditap, y);
    const driftY = totalRunningCost(driftskostnader, y, kostnadsøkning);
    const intY = løpetid > 0 ? interestAfterTax * Math.min(1, y / løpetid) : interestAfterTax;
    series.push({
      år: y,
      eie: Math.round(intY + (bilPris - resY) + driftY),
      leasing: Math.round(innskudd + leasingpris * 12 * y + driftY),
    });
  }

  return {
    horisont,
    residual,
    own: { net: ownNet, interestAfterTax, depreciation: bilPris - residual, drift: ownDrift },
    lease: { net: leaseNet, drift: leaseDrift },
    diff: leaseNet - ownNet, // positive → owning is cheaper net over the horizon
    kmWarning: kjørelengde > 15000,
    kjørelengde,
  };
}

export default function useCalculations(inputs) {
  const { bilPris, egenkapital, løpetid, avkastning, skatt, sparepenger, inntekt, verditap, driftskostnader, kostnadsøkning, leasingpris, innskudd, renteJustering, kjørelengde } = inputs;

  return useMemo(() => {
    const loanAmount = Math.max(0, bilPris - egenkapital);

    // Total depreciation over the ownership period — on the FULL car price,
    // not the loan amount (you lose value on the whole car regardless of financing).
    const totalDepreciation = bilPris * (1 - Math.pow(1 - verditap / 100, løpetid));
    // Running costs (fuel/charging, insurance, service, tolls) — equal across all
    // scenarios since it's the same car; applies to leasing too. Escalates with car age.
    const totalDrift = totalRunningCost(driftskostnader, løpetid, kostnadsøkning);
    const monthlyDrift = løpetid > 0 ? totalDrift / (løpetid * 12) : driftskostnader / 12;

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
          totalCost: (innskudd || 0) + leasingpris * 12 * løpetid + totalDrift,
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

    // Detailed opportunity cost: compound (rentes-rente) growth of the tied-up equity
    // under different uses, vs. today's simple linear figure (`lostTotal`).
    const lostTotalCompound = compound(egenkapital, avkastning, løpetid);
    const equityAlternatives = [
      { key: 'fond', label: `Indeksfond (${avkastning} %)`, rate: avkastning, gain: compound(egenkapital, avkastning, løpetid) },
      { key: 'bsu', label: `BSU/sparekonto (${BSU_RATE} %)`, rate: BSU_RATE, gain: compound(egenkapital, BSU_RATE, løpetid) },
      { key: 'bolig', label: `Nedbetaling boliglån (${RATES.bolig.rate} %)`, rate: RATES.bolig.rate, gain: compound(egenkapital, RATES.bolig.rate, løpetid) },
    ];

    // Per-year data series for the charts (Phase 2). Interest is spread linearly for a
    // smooth curve — good enough for a guiding visual.
    const bestLoan = bestKey ? scenarios[bestKey] : null;
    const perYearInterest = løpetid > 0 && bestLoan ? bestLoan.interestAfterTax / løpetid : 0;
    const growth = 1 + avkastning / 100;
    const yearlySeries = [];
    const wealthSeries = [];
    for (let y = 1; y <= Math.max(1, løpetid); y++) {
      const depCum = bilPris * (1 - Math.pow(1 - verditap / 100, y));
      const driftCum = totalRunningCost(driftskostnader, y, kostnadsøkning);
      const loanExtra = bestLoan ? perYearInterest * y + bestLoan.fee : 0;
      yearlySeries.push({
        år: y,
        kontant: Math.round(depCum + driftCum),
        lån: Math.round(depCum + driftCum + loanExtra),
        leasing: Math.round(leasingpris * 12 * y + driftCum),
      });

      const resY = bilPris * Math.pow(1 - verditap / 100, y);
      const cashWealth = (sparepenger - bilPris) * Math.pow(growth, y) + resY;
      const loanWealth = (sparepenger - egenkapital) * Math.pow(growth, y) + resY
        - remainingBalance(loanAmount, bestLoan ? bestLoan.rate : 0, løpetid, y * 12);
      wealthSeries.push({ år: y, kontant: Math.round(cashWealth), lån: Math.round(loanWealth) });
    }

    // Fixed vs. variable cost split (for the best loan scenario).
    const costSplit = {
      fast: Math.round(totalDepreciation + (bestLoan ? bestLoan.interestAfterTax + bestLoan.fee : 0)),
      variabel: Math.round(totalDrift),
    };

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

    // Context-based recommendation (simple decision tree over the user's inputs).
    const bestRate = bestLoan ? bestLoan.rate : RATES.billån1.rate;
    const lvo8 = compareLeaseVsOwn({
      bilPris, egenkapital, løpetid, skatt, verditap, driftskostnader, kostnadsøkning,
      leasingpris, innskudd, rate: bestRate, horisont: 8, kjørelengde,
    });
    const ownCheaper = lvo8.diff > 0;
    const recommendation = { type: '', headline: '', rationale: '', caveats: [] };

    if (!ownCheaper) {
      recommendation.type = 'lease';
      recommendation.headline = 'Leasing ser mest gunstig ut';
      recommendation.rationale = `Over 8 år er leasing ${formatKR(Math.abs(lvo8.diff))} billigere enn å eie i dette regnestykket — men du eier ingenting til slutt.`;
    } else if (conclusion.type === 'loan') {
      recommendation.type = 'loan';
      recommendation.headline = 'Kjøp bilen med lån — behold sparingen';
      recommendation.rationale = `Å eie er ${formatKR(lvo8.diff)} billigere enn leasing over 8 år, og forventet avkastning (${avkastning} %) er høyere enn lånerenten (${bestRate.toFixed(2)} %), så det lønner seg å låne og la sparepengene stå.`;
    } else if (conclusion.type === 'cash') {
      recommendation.type = 'cash';
      recommendation.headline = 'Kjøp bilen — helst med mye egenkapital';
      recommendation.rationale = `Å eie er ${formatKR(lvo8.diff)} billigere enn leasing over 8 år, og tapt avkastning er lavere enn lånekostnaden — da lønner det seg å betale mest mulig kontant.`;
    } else {
      recommendation.type = 'mixed';
      recommendation.headline = 'Kjøp bilen — vurder delvis finansiering';
      recommendation.rationale = `Å eie er ${formatKR(lvo8.diff)} billigere enn leasing over 8 år. Forskjellen mellom kontant og lån er liten, så en kombinasjon kan være fornuftig.`;
    }

    // Caveats ("men vær oppmerksom på …")
    if (bufferAfterPurchase < 50000) {
      recommendation.caveats.push('Lav likviditetsbuffer etter kjøp — behold nok til uforutsette utgifter (mål gjerne 2–3 månedslønner).');
    }
    if (kjørelengde > 15000) {
      recommendation.caveats.push(`Kjørelengden din (${(kjørelengde || 0).toLocaleString('nb-NO')} km/år) overstiger typisk leasing km-tak (~15 000 km) — leasing kan bli dyrere pga. overkjørte km.`);
    }
    if (monthlyPercent > 15) {
      recommendation.caveats.push(`Lånets månedskostnad er ~${monthlyPercent.toFixed(0)} % av inntekten din — over ~15 % blir økonomien stram.`);
    }
    if (recommendation.type !== 'lease') {
      recommendation.caveats.push(`Ved leasing eier du ingenting til slutt; ved eie sitter du igjen med en bil verdt ~${formatKR(lvo8.residual)} etter 8 år.`);
    }
    recommendation.caveats.push('Verditap og drift er større kostnader enn rentene — la total kostnad, ikke renten alene, styre valget.');
    recommendation.caveats.push('Forventet avkastning er usikker; se følsomhets-scenariene (3/5/7 %) for hvordan anbefalingen kan snu.');

    return {
      loanAmount,
      scenarios,
      bestKey,
      worstKey,
      recommendation,
      totalDepreciation,
      totalDrift,
      monthlyDrift,
      opportunityCost: { lostPerYear, lostTotal, lostTotalCompound, bufferAfterPurchase, monthlyPercent, returnBands, equityAlternatives },
      yearlySeries,
      wealthSeries,
      costSplit,
      conclusion,
      advice,
    };
  }, [bilPris, egenkapital, løpetid, avkastning, skatt, sparepenger, inntekt, verditap, driftskostnader, kostnadsøkning, leasingpris, innskudd, renteJustering, kjørelengde]);
}
