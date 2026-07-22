import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap, ExternalLink } from "lucide-react";
import { formatKR } from "@/hooks/useCalculations";

// EV models — images served via img.youtube.com thumbnail trick won't work,
// so we use the Unsplash API with specific car model search terms per entry.
// The `imageQuery` is used to build a reliable, model-specific Unsplash URL.
const EV_MODELS = [
  { name: "Tesla Model 3",        minPrice: 350000, maxPrice: 550000, range: "491 km", url: "https://www.tesla.com/no_no/model3",                                                    imageQuery: "Tesla+Model+3+electric+car" },
  { name: "Tesla Model Y",        minPrice: 450000, maxPrice: 750000, range: "533 km", url: "https://www.tesla.com/no_no/modely",                                                    imageQuery: "Tesla+Model+Y+electric+car" },
  { name: "Volkswagen ID.4",      minPrice: 350000, maxPrice: 550000, range: "522 km", url: "https://www.volkswagen.no/modeller/id4",                                                imageQuery: "Volkswagen+ID4+electric" },
  { name: "Volkswagen ID.3",      minPrice: 300000, maxPrice: 450000, range: "426 km", url: "https://www.volkswagen.no/modeller/id3",                                                imageQuery: "Volkswagen+ID3+electric" },
  { name: "Polestar 2",           minPrice: 400000, maxPrice: 600000, range: "476 km", url: "https://www.polestar.com/no/polestar-2/",                                               imageQuery: "Polestar+2+electric+car" },
  { name: "Hyundai IONIQ 6",      minPrice: 380000, maxPrice: 580000, range: "614 km", url: "https://www.hyundai.com/no/modeller/ioniq6",                                            imageQuery: "Hyundai+IONIQ+6+electric" },
  { name: "Hyundai IONIQ 5",      minPrice: 400000, maxPrice: 620000, range: "507 km", url: "https://www.hyundai.com/no/modeller/ioniq5",                                            imageQuery: "Hyundai+IONIQ+5+electric" },
  { name: "Kia EV6",              minPrice: 420000, maxPrice: 650000, range: "528 km", url: "https://www.kia.com/no/modeller/ev6/",                                                  imageQuery: "Kia+EV6+electric+car" },
  { name: "Kia EV9",              minPrice: 650000, maxPrice: 950000, range: "563 km", url: "https://www.kia.com/no/modeller/ev9/",                                                  imageQuery: "Kia+EV9+electric+SUV" },
  { name: "BMW iX3",              minPrice: 500000, maxPrice: 700000, range: "458 km", url: "https://www.bmw.no/no/all-models/bmw-x/ix3/2021/bmw-ix3.html",                         imageQuery: "BMW+iX3+electric" },
  { name: "BMW i4",               minPrice: 550000, maxPrice: 750000, range: "590 km", url: "https://www.bmw.no/no/all-models/4-series/i4/2021/bmw-i4.html",                        imageQuery: "BMW+i4+electric+car" },
  { name: "BMW iX",               minPrice: 700000, maxPrice: 1050000, range: "630 km", url: "https://www.bmw.no/no/all-models/bmw-x/ix/2021/bmw-ix.html",                         imageQuery: "BMW+iX+electric+SUV" },
  { name: "Audi Q4 e-tron",       minPrice: 500000, maxPrice: 750000, range: "520 km", url: "https://www.audi.no/no/web/no/modeller/q4-e-tron.html",                               imageQuery: "Audi+Q4+etron+electric" },
  { name: "Audi e-tron GT",       minPrice: 900000, maxPrice: 1400000, range: "488 km", url: "https://www.audi.no/no/web/no/modeller/e-tron-gt.html",                              imageQuery: "Audi+etron+GT+electric" },
  { name: "Mercedes EQA",         minPrice: 450000, maxPrice: 650000, range: "422 km", url: "https://www.mercedes-benz.no/passengercars/mercedes-benz-cars/models/eqa.html",       imageQuery: "Mercedes+EQA+electric" },
  { name: "Skoda Enyaq",          minPrice: 350000, maxPrice: 530000, range: "534 km", url: "https://www.skoda.no/modeller/enyaq-iv",                                               imageQuery: "Skoda+Enyaq+electric" },
  { name: "Nissan Ariya",         minPrice: 380000, maxPrice: 560000, range: "533 km", url: "https://www.nissan.no/vehicles/new-vehicles/ariya.html",                               imageQuery: "Nissan+Ariya+electric" },
  { name: "Volvo EX30",           minPrice: 280000, maxPrice: 400000, range: "344 km", url: "https://www.volvocars.com/no/cars/ex30",                                               imageQuery: "Volvo+EX30+electric" },
  { name: "Volvo EX40",           minPrice: 380000, maxPrice: 560000, range: "533 km", url: "https://www.volvocars.com/no/cars/ex40",                                               imageQuery: "Volvo+EX40+electric" },
  { name: "Volvo EX90",           minPrice: 700000, maxPrice: 1100000, range: "600 km", url: "https://www.volvocars.com/no/cars/ex90",                                              imageQuery: "Volvo+EX90+electric+SUV" },
  { name: "Renault Mégane E-Tech", minPrice: 320000, maxPrice: 460000, range: "450 km", url: "https://www.renault.no/biler/megane-e-tech-electric.html",                            imageQuery: "Renault+Megane+electric" },
  { name: "MG4 Electric",         minPrice: 250000, maxPrice: 380000, range: "450 km", url: "https://www.mgmotor.no/modeller/mg4-electric",                                         imageQuery: "MG4+electric+car" },
  { name: "BYD Atto 3",           minPrice: 320000, maxPrice: 460000, range: "420 km", url: "https://www.byd.com/no/car/atto3.html",                                                imageQuery: "BYD+Atto+3+electric" },
  { name: "BYD Seal",             minPrice: 380000, maxPrice: 520000, range: "570 km", url: "https://www.byd.com/no/car/seal.html",                                                 imageQuery: "BYD+Seal+electric+car" },
  { name: "Porsche Taycan",       minPrice: 800000, maxPrice: 1500000, range: "435 km", url: "https://www.porsche.com/norway/models/taycan/",                                       imageQuery: "Porsche+Taycan+electric" },
  { name: "Citroën ë-C3",         minPrice: 200000, maxPrice: 320000, range: "320 km", url: "https://www.citroen.no/modeller/ny-e-c3.html",                                        imageQuery: "Citroen+e-C3+electric" },
  { name: "Smart #1",             minPrice: 280000, maxPrice: 400000, range: "400 km", url: "https://www.smart.com/no/models/smart-1",                                              imageQuery: "Smart+1+electric+car" },
];

function getCarImageUrl(car) {
  // Use Unsplash source API with model-specific search term — reliable, no API key needed
  return `https://source.unsplash.com/800x500/?${car.imageQuery}`;
}

function getMatchingCars(price) {
  // Only include cars where minPrice does not exceed budget, and midPrice is within ±20%
  const margin = price * 0.20;
  const matches = EV_MODELS.filter(
    (car) => car.minPrice <= price && car.minPrice >= price - margin
  );
  if (matches.length === 0) {
    // fallback: closest cars that are still within budget
    return [...EV_MODELS]
      .filter((car) => car.minPrice <= price)
      .sort((a, b) => {
        const aMid = (a.minPrice + a.maxPrice) / 2;
        const bMid = (b.minPrice + b.maxPrice) / 2;
        return Math.abs(aMid - price) - Math.abs(bMid - price);
      })
      .slice(0, 5);
  }
  return matches;
}

export default function CarCarousel({ bilPris }) {
  const [cars, setCars] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const matched = getMatchingCars(bilPris);
    setCars(matched);
    setIndex(0);
  }, [bilPris]);

  if (cars.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + cars.length) % cars.length);
  const next = () => setIndex((i) => (i + 1) % cars.length);

  const car = cars[index];

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-card border border-border/50 flex flex-col">
      {/* Image */}
      <div className="relative flex-1 min-h-0">
        <img
          src={getCarImageUrl(car)}
          alt={car.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* EV badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary/90 text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
          <Zap className="w-3 h-3" />
          EL-BIL
        </div>

        {/* Nav arrows */}
        {cars.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label="Forrige bil"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              aria-label="Neste bil"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Car info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-bold text-sm leading-tight">{car.name}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-white/70 text-xs">
              {formatKR(car.minPrice)} – {formatKR(car.maxPrice)}
            </span>
            <span className="text-primary text-xs font-mono font-semibold">⚡ {car.range}</span>
          </div>
        </div>
      </div>

      {/* Dot indicators + link */}
      <div className="flex items-center justify-between px-3 py-2 bg-card">
        <div className="flex gap-1.5">
          {cars.length > 1 && cars.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "bg-primary w-4" : "bg-muted-foreground/40 w-1.5"
              }`}
              aria-label={`Gå til bil ${i + 1}`}
            />
          ))}
        </div>
        <a
          href={car.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
        >
          Se {car.name}
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
