export type HistoryPoint = {
  date: string;
  close: number;
};

export type ForecastDay = {
  horizon: number;
  date: string | null;
  naive: {
    high: number;
    low: number;
    close: number;
  };
  random_forest: {
    close: number;
  } | null;
  xgboost: {
    high?: number;
    low?: number;
    close?: number;
  };
};

export type ForecastResponse = {
  symbol?: string;
  currency?: string;
  unit?: string;
  status?: string;
  last_date: string;
  last_close: number;
  historical: HistoryPoint[];
  forecasts: ForecastDay[];
  warning: string;
};

export type SeriesKey =
  | "actual"
  | "naive"
  | "randomForest"
  | "linearRegression"
  | "xgboost";

export type ChartSeries = {
  key: SeriesKey;
  label: string;
  color: string;
};

export type ChartVisibility = Record<SeriesKey, boolean>;

export type ChartRange = {
  from: string;
  to: string;
};

export const SERIES: ChartSeries[] = [
  { key: "actual", label: "Actual Close", color: "#16a34a" },
  { key: "naive", label: "Naive (Last Close)", color: "#3b82f6" },
  { key: "randomForest", label: "Random Forest", color: "#f59e0b" },
  { key: "linearRegression", label: "Linear Regression", color: "#a78bfa" },
  { key: "xgboost", label: "XGBoost", color: "#ef4444" },
];

export const DEFAULT_VISIBILITY: ChartVisibility = {
  actual: true,
  naive: true,
  randomForest: true,
  linearRegression: true,
  xgboost: true,
};
