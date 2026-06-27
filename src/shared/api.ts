export interface Market {
  id: string;
  question: string;
  outcomes: string[];
  outcomePrices: number[];
  bestBid: number;
  bestAsk: number;
  lastTradePrice: number;
  oneDayPriceChange: number;
  volume24hr: number;
  volume: number;
  liquidity: number;
  slug: string;
  endDate: string;
  active: boolean;
  clobTokenIds: string[];
}

export const fetchMarkets = async (): Promise<Market[]> => {
  const res = await fetch("https://gamma-api.polymarket.com/markets?limit=100&active=true");
  if (!res.ok) throw new Error("Failed to fetch markets");
  
  const data = await res.json();
  
  return data.map((raw: any) => {
    let outcomes = [];
    let outcomePrices = [];
    let clobTokenIds = [];
    
    try {
      outcomes = JSON.parse(raw.outcomes || "[]");
    } catch (e) {
      console.warn("Failed to parse outcomes for market", raw.id);
    }
    
    try {
      outcomePrices = JSON.parse(raw.outcomePrices || "[]").map(Number);
    } catch (e) {
      console.warn("Failed to parse outcomePrices for market", raw.id);
    }
    
    try {
      clobTokenIds = JSON.parse(raw.clobTokenIds || "[]");
    } catch (e) {
      console.warn("Failed to parse clobTokenIds for market", raw.id);
    }
    
    return {
      id: raw.id || raw.slug,
      question: raw.question,
      outcomes,
      outcomePrices,
      bestBid: Number(raw.bestBid) || 0,
      bestAsk: Number(raw.bestAsk) || 0,
      lastTradePrice: Number(raw.lastTradePrice) || 0,
      oneDayPriceChange: Number(raw.oneDayPriceChange) || 0,
      volume24hr: Number(raw.volume24hr) || 0,
      volume: Number(raw.volume) || 0,
      liquidity: Number(raw.liquidity) || 0,
      slug: raw.slug,
      endDate: raw.endDate,
      active: raw.active,
      clobTokenIds,
    };
  });
};

export const fetchPriceHistory = async (clobTokenId: string) => {
  const res = await fetch(`https://clob.polymarket.com/prices-history?interval=1d&market=${clobTokenId}`);
  if (!res.ok) throw new Error("Failed to fetch price history");
  const data = await res.json();
  return data.history || [];
};
