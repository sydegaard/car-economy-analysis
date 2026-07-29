import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap, ExternalLink } from "lucide-react";
import { formatKR } from "@/hooks/useCalculations";
import { EV_MODELS } from "@/data/evModels";

const PLACEHOLDER_IMAGE = "/car-placeholder.svg";

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

export default function CarCarousel({ bilPris, selectedCar }) {
  const [cars, setCars] = useState([]);
  const [index, setIndex] = useState(0);

  // With an explicitly selected car, show that car only — budget-matched suggestions
  // would otherwise contradict the choice the user just made in the comparison.
  useEffect(() => {
    setCars(selectedCar ? [selectedCar] : getMatchingCars(bilPris));
    setIndex(0);
  }, [bilPris, selectedCar]);

  if (cars.length === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + cars.length) % cars.length);
  const next = () => setIndex((i) => (i + 1) % cars.length);

  const car = cars[index];

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-card border border-border/50 flex flex-col">
      {/* Image */}
      <div className="relative flex-1 min-h-0">
        <img
          key={car.name}
          src={car.image}
          alt={car.name}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Degrade gracefully if a hotlinked image fails to load; guard against loops.
            if (e.currentTarget.dataset.fallback) return;
            e.currentTarget.dataset.fallback = "1";
            e.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
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
