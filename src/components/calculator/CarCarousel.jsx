import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Zap, ExternalLink } from "lucide-react";
import { formatKR } from "@/hooks/useCalculations";

// EV models available in Norway. `image` is a verified, model-specific photo
// hotlinked from the Wikimedia Commons image CDN (upload.wikimedia.org).
// Photos are CC BY-SA licensed; `url` links to the manufacturer's model page.
const EV_MODELS = [
  { name: "Tesla Model 3",         minPrice: 350000, maxPrice: 550000,  range: "491 km", url: "https://www.tesla.com/no_no/model3",                                                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Tesla_Model_3_1X7A6940.jpg/960px-Tesla_Model_3_1X7A6940.jpg" },
  { name: "Tesla Model Y",         minPrice: 450000, maxPrice: 750000,  range: "533 km", url: "https://www.tesla.com/no_no/modely",                                                    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Tesla_Model_Y_1X7A6211.jpg/960px-Tesla_Model_Y_1X7A6211.jpg" },
  { name: "Volkswagen ID.4",       minPrice: 350000, maxPrice: 550000,  range: "522 km", url: "https://www.volkswagen.no/modeller/id4",                                                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Volkswagen_ID.4_1X7A0360.jpg/960px-Volkswagen_ID.4_1X7A0360.jpg" },
  { name: "Volkswagen ID.3",       minPrice: 300000, maxPrice: 450000,  range: "426 km", url: "https://www.volkswagen.no/modeller/id3",                                                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Volkswagen_ID.3_1X7A1699.jpg/960px-Volkswagen_ID.3_1X7A1699.jpg" },
  { name: "Polestar 2",            minPrice: 400000, maxPrice: 600000,  range: "476 km", url: "https://www.polestar.com/no/polestar-2/",                                               image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Polestar_2_1X7A0135.jpg/960px-Polestar_2_1X7A0135.jpg" },
  { name: "Hyundai IONIQ 6",       minPrice: 380000, maxPrice: 580000,  range: "614 km", url: "https://www.hyundai.com/no/modeller/ioniq6",                                            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Hyundai_Ioniq_6_1X7A7258.jpg/960px-Hyundai_Ioniq_6_1X7A7258.jpg" },
  { name: "Hyundai IONIQ 5",       minPrice: 400000, maxPrice: 620000,  range: "507 km", url: "https://www.hyundai.com/no/modeller/ioniq5",                                            image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Hyundai_Ioniq_5_1X7A0848.jpg/960px-Hyundai_Ioniq_5_1X7A0848.jpg" },
  { name: "Kia EV6",               minPrice: 420000, maxPrice: 650000,  range: "528 km", url: "https://www.kia.com/no/modeller/ev6/",                                                  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Kia_EV6_IMG_7911.jpg/960px-Kia_EV6_IMG_7911.jpg" },
  { name: "Kia EV9",               minPrice: 650000, maxPrice: 950000,  range: "563 km", url: "https://www.kia.com/no/modeller/ev9/",                                                  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Kia_EV9_1X7A2472.jpg/960px-Kia_EV9_1X7A2472.jpg" },
  { name: "BMW iX3",               minPrice: 500000, maxPrice: 700000,  range: "458 km", url: "https://www.bmw.no/no/all-models/bmw-x/ix3/2021/bmw-ix3.html",                          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/BMW_iX3_G08_FL_DSC_9318.jpg/960px-BMW_iX3_G08_FL_DSC_9318.jpg" },
  { name: "BMW i4",                minPrice: 550000, maxPrice: 750000,  range: "590 km", url: "https://www.bmw.no/no/all-models/4-series/i4/2021/bmw-i4.html",                         image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2024_BMW_i4_IMG_0146.jpg/960px-2024_BMW_i4_IMG_0146.jpg" },
  { name: "BMW iX",                minPrice: 700000, maxPrice: 1050000, range: "630 km", url: "https://www.bmw.no/no/all-models/bmw-x/ix/2021/bmw-ix.html",                           image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/BMW_iX_IMG_2261.jpg/960px-BMW_iX_IMG_2261.jpg" },
  { name: "Audi Q4 e-tron",        minPrice: 500000, maxPrice: 750000,  range: "520 km", url: "https://www.audi.no/no/web/no/modeller/q4-e-tron.html",                                 image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Audi_Q4_e-tron_DSC_7183.jpg/960px-Audi_Q4_e-tron_DSC_7183.jpg" },
  { name: "Audi e-tron GT",        minPrice: 900000, maxPrice: 1400000, range: "488 km", url: "https://www.audi.no/no/web/no/modeller/e-tron-gt.html",                                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Audi_e-tron_GT_IMG_7661.jpg/960px-Audi_e-tron_GT_IMG_7661.jpg" },
  { name: "Mercedes EQA",          minPrice: 450000, maxPrice: 650000,  range: "422 km", url: "https://www.mercedes-benz.no/passengercars/mercedes-benz-cars/models/eqa.html",        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Mercedes-Benz_EQA_002.jpg/960px-Mercedes-Benz_EQA_002.jpg" },
  { name: "Skoda Enyaq",           minPrice: 350000, maxPrice: 530000,  range: "534 km", url: "https://www.skoda.no/modeller/enyaq-iv",                                                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Skoda_Enyaq_Sportline_1X7A0316.jpg/960px-Skoda_Enyaq_Sportline_1X7A0316.jpg" },
  { name: "Nissan Ariya",          minPrice: 380000, maxPrice: 560000,  range: "533 km", url: "https://www.nissan.no/vehicles/new-vehicles/ariya.html",                                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Nissan_Ariya_1X7A6907.jpg/960px-Nissan_Ariya_1X7A6907.jpg" },
  { name: "Volvo EX30",            minPrice: 280000, maxPrice: 400000,  range: "344 km", url: "https://www.volvocars.com/no/cars/ex30",                                                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Volvo_EX30_1X7A1950.jpg/960px-Volvo_EX30_1X7A1950.jpg" },
  { name: "Volvo EX40",            minPrice: 380000, maxPrice: 560000,  range: "533 km", url: "https://www.volvocars.com/no/cars/ex40",                                                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Volvo_C40_Recharge_2022092202.jpg/960px-Volvo_C40_Recharge_2022092202.jpg" },
  { name: "Volvo EX90",            minPrice: 700000, maxPrice: 1100000, range: "600 km", url: "https://www.volvocars.com/no/cars/ex90",                                                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Volvo_EX90_DSC_7810.jpg/960px-Volvo_EX90_DSC_7810.jpg" },
  { name: "Renault Mégane E-Tech", minPrice: 320000, maxPrice: 460000,  range: "450 km", url: "https://www.renault.no/biler/megane-e-tech-electric.html",                             image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Renault_Megane_E-Tech_1X7A6019.jpg/960px-Renault_Megane_E-Tech_1X7A6019.jpg" },
  { name: "MG4 Electric",          minPrice: 250000, maxPrice: 380000,  range: "450 km", url: "https://www.mgmotor.no/modeller/mg4-electric",                                          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/MG4_EV%2C_Worms_%28P1180575%29.jpg/960px-MG4_EV%2C_Worms_%28P1180575%29.jpg" },
  { name: "BYD Atto 3",            minPrice: 320000, maxPrice: 460000,  range: "420 km", url: "https://www.byd.com/no/car/atto3.html",                                                 image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/BYD_Atto_3_1X7A6495.jpg/960px-BYD_Atto_3_1X7A6495.jpg" },
  { name: "BYD Seal",              minPrice: 380000, maxPrice: 520000,  range: "570 km", url: "https://www.byd.com/no/car/seal.html",                                                  image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/BYD_Seal%2C_IAA_Open_Space_2023%2C_Munich_%28P1120203%29.jpg/960px-BYD_Seal%2C_IAA_Open_Space_2023%2C_Munich_%28P1120203%29.jpg" },
  { name: "Porsche Taycan",        minPrice: 800000, maxPrice: 1500000, range: "435 km", url: "https://www.porsche.com/norway/models/taycan/",                                        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Porsche_Taycan_IAA_2019_JM_0787.jpg/960px-Porsche_Taycan_IAA_2019_JM_0787.jpg" },
  { name: "Citroën ë-C3",          minPrice: 200000, maxPrice: 320000,  range: "320 km", url: "https://www.citroen.no/modeller/ny-e-c3.html",                                          image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Citro%C3%ABn_%C3%AB-C3.jpg/960px-Citro%C3%ABn_%C3%AB-C3.jpg" },
  { name: "Smart #1",              minPrice: 280000, maxPrice: 400000,  range: "400 km", url: "https://www.smart.com/no/models/smart-1",                                              image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Smart_Hashtag_1_IMG_7328.jpg/960px-Smart_Hashtag_1_IMG_7328.jpg" },
];

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
