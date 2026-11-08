export type Metal = {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change_percent: number;
};

export type MetalsResponse = {
  metals: Metal[];
  updated_at?: string | null;
};

export type GoldPrice = {
  date: string;
  close: number;
  high: number;
  low: number;
};

export type GoldHistoryResponse = {
  symbol: string;
  currency: string;
  unit: string;
  prices: GoldPrice[];
};

export type SpotResponse = {
  gold: { price: number; currency: string; unit: string };
  silver: { price: number; currency: string; unit: string };
  updated_at?: string | null;
  stale?: boolean;
  data_state?: {
    status: string;
    as_of: string;
    source: string;
    age_seconds: number;
  };
};
