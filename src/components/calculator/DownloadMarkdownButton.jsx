import { Download } from "lucide-react";

const MD_CONTENT = `# Bilfinansieringsanalyse

> Sammenlign 7 finansieringsløsninger og finn den mest lønnsomme strategien for ditt bilkjøp i 2026.

## Oversikt

Dette er en interaktiv webapplikasjon som hjelper brukere med å analysere og sammenligne ulike finansieringsmetoder for bilkjøp i det norske markedet. Appen tar inn brukerens økonomiske parametere og beregner total kostnad, månedlige utgifter, alternativkostnad og gir personlig tilpassede råd.

## Nøkkelfunksjoner

- **7 finansieringsscenarioer** sammenlignes side om side: Kontant, Billån (Spb. Sør), Billån (Spb. 1), Grønt billån, Boliglån, Forbrukslån og Privatleasing.
- **Dynamisk EV-karusell** som anbefaler elbiler tilgjengelig i Norge basert på brukerens budsjett ("Bilens pris").
- **Alternativkostnad-beregning** som viser tapt avkastning ved å binde opp egenkapital i kontantkjøp.
- **Automatisk konklusjon** som anbefaler kontant vs. lån basert på rente vs. forventet avkastning.
- **Personlige råd** om likviditet, lånevalg, forhandling og nedbetaling.
- **Marginalskatt-kalkulator** med forklarende modal som viser effekten av rentefradrag.
- Mørkt, moderne "cyberpunk"-inspirert UI med neon-cyan og magenta aksenter.

## Teknologistakk

| Lag | Teknologi |
|-----|-----------|
| Frontend | React + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react |
| Ruting | react-router-dom |
| State | React hooks (useState, useMemo) |
| Backend | Ingen — 100% klientside |

## Finansieringsrenter (2026-markedet)

| # | Scenario | Effektiv rente |
|---|----------|---------------|
| 1 | Kontant | 0% |
| 2 | Billån (Sparebanken Sør) | 5,19% |
| 3 | Billån (Sparebanken 1) | 8,06% |
| 4 | Grønt billån | 5,30% |
| 5 | Boliglån | 5,40% |
| 6 | Forbrukslån | 16,40% |
| 7 | Privatleasing | — |

## Inndata-parametere

| Felt | Beskrivelse | Standardverdi |
|------|-------------|---------------|
| Bilens pris | Total kjøpesum inkl. mva | 350 000 kr |
| Egenkapital | Kontant du legger inn selv | 100 000 kr |
| Løpetid (år) | Nedbetalingstid for lån | 5 år |
| Forventet avkastning (%) | Årlig avkastning på indeksfond/aksjer | 5% |
| Marginalskatt (%) | Skattesats for rentefradrag | 28% |
| Totale sparepenger | Inkl. BSU, fond, bankinnskudd | 500 000 kr |
| Månedlig inntekt | Etter skatt ca. | 50 000 kr |

## Beregningslogikk

### Månedlig terminbeløp

\`\`\`
Månedlig = (Lånebeløp × r × (1 + r)^n) / ((1 + r)^n - 1)

hvor r = årlig rente / 100 / 12
      n = løpetid i år × 12
\`\`\`

### Total rentekostnad

\`\`\`
Total rente = (Månedlig × n) - Lånebeløp
\`\`\`

### Rente etter skatt

\`\`\`
Rente etter skatt = Total rente × (1 - marginalskatt / 100)
\`\`\`

### Alternativkostnad

\`\`\`
Tapt avkastning per år = Egenkapital × (Forventet avkastning / 100)
Tapt avkastning totalt = Tapt per år × Løpetid
\`\`\`

### Konklusjonslogikk

1. **BETAL KONTANT** — Hvis tapt avkastning er lavere enn rentekostnaden på det billigste lånet.
2. **TA OPP LÅN** — Hvis forventet avkastning er høyere enn billånsrenten, og man tjener mer på å la sparepengene stå.
3. **DELVIS FINANSIERING** — Hvis forskjellen er liten: betal 50–70% kontant, lån resten.

## EV-karusell

Karusellen viser elbiler tilgjengelig i Norge som matcher brukerens budsjett. Den filtrerer modeller hvor minimumspris ikke overstiger budsjettet, og viser spesifikasjoner som rekkevidde, prisintervall og direkte lenker til produsentens nettside.

**Inkluderte merker:** Tesla, Volkswagen, Polestar, Hyundai, Kia, BMW, Audi, Mercedes, Skoda, Nissan, Volvo, Renault, MG, BYD, Porsche, Citroën og Smart.

Bilder hentes via Unsplash med modell-spesifikke søkeord for relevant visuell representasjon.

## Filstruktur

\`\`\`
src/
├── App.jsx                          # Ruting (enkeltside-app)
├── index.css                        # Design tokens (farger, fonter)
├── pages/
│   └── Calculator.jsx               # Hovedside
├── components/
│   ├── calculator/
│   │   ├── InputSection.jsx         # Inndata-felt + marginalskatt
│   │   ├── InputField.jsx           # Gjenbrukbart tallfelt
│   │   ├── MarginalskattModal.jsx   # Forklarende modal for skatt
│   │   ├── ScenarioTable.jsx        # Sammenligningstabell
│   │   ├── OpportunityCost.jsx      # Alternativkostnad-kort
│   │   ├── ConclusionBox.jsx        # Automatisk konklusjon
│   │   ├── AdviceGrid.jsx           # Personlige råd
│   │   └── CarCarousel.jsx          # EV-anbefalinger
│   └── ui/                          # shadcn/ui komponenter
├── hooks/
│   └── useCalculations.js           # All beregningslogikk
└── lib/                             # utils
\`\`\`

## Designsystem

Appen bruker et mørkt tema med følgende fargetokens:

| Token | Hex (tilnærmet) | Bruk |
|-------|-----------------|------|
| Primary | Cyan (#14B8E6) | Hovedaksent, knapper |
| Accent | Magenta (#E64AC9) | Sekundæraksent |
| Background | Mørk blågrå (#14171F) | Bakgrunn |
| Card | Litt lysere (#1C2029) | Kort/paneler |
| Success/Neon Green | (#26D07C) | Positive indikatorer |
| Warning | (#FBBF24) | Advarsler |

Fonter: **Inter** (brukertekst) og **JetBrains Mono** (tall/mono).

## Ansvarsfraskrivelse

Dette er en veiledende analyse. Renter er basert på markedet 2026. Kontakt bank for nøyaktige tilbud. Privatleasing er vist som referanse.

---

*Generert fra Bilfinansieringsanalyse-appen.*
`;

export default function DownloadMarkdownButton() {
  const handleDownload = () => {
    const blob = new Blob([MD_CONTENT], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Bilfinansieringsanalyse.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-3 py-1.5 border border-border/40 rounded-lg"
    >
      <Download className="w-3.5 h-3.5" />
      Last ned prosjektbeskrivelse (.md)
    </button>
  );
}
