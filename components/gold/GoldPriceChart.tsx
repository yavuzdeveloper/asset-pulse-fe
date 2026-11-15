"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type MouseEventParams,
} from "lightweight-charts";

import GoldChartTooltip from "./GoldChartTooltip";

import type { ForecastResponse, ChartVisibility } from "./goldChart.types";

type Props = {
  forecast: ForecastResponse;
  visibility: ChartVisibility;
};

type TooltipValue = {
  series: string;
  price: number | null;
  color: string;
};

type TooltipState = {
  visible: boolean;
  date: string;
  values: TooltipValue[];
  x: number;
  y: number;
};

const SERIES_NAMES: Record<string, string> = {
  actual: "Actual Close",
  naive: "Naive (Last Close)",
  randomForest: "Random Forest",
  linearRegression: "Linear Regression",
  xgboost: "XGBoost",
};

export default function GoldPriceChart({ forecast, visibility }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const seriesRef = useRef<
    Partial<Record<keyof ChartVisibility, ISeriesApi<"Line">>>
  >({});

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    date: "",
    values: [],
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 440,

      layout: {
        background: {
          type: ColorType.Solid,
          color: "#18181b",
        },
        textColor: "#a1a1aa",
        attributionLogo: false,
      },

      grid: {
        vertLines: { color: "#27272a" },
        horzLines: { color: "#27272a" },
      },

      rightPriceScale: {
        borderColor: "#3f3f46",
        autoScale: true,
      },

      timeScale: {
        borderColor: "#3f3f46",
        timeVisible: true,
        rightOffset: 2,
        fixLeftEdge: false,
        fixRightEdge: false,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
      },

      crosshair: {
        mode: 1,
        vertLine: {
          color: "#71717a",
          width: 1,
          style: 2,
          labelBackgroundColor: "#3f3f46",
        },
        horzLine: {
          color: "#71717a",
          width: 1,
          style: 2,
          labelBackgroundColor: "#3f3f46",
        },
      },

      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },

      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisPressedMouseMove: true,
        axisDoubleClickReset: true,
      },
    });

    chartRef.current = chart;

    const createLine = (
      key: keyof ChartVisibility,
      color: string,
      lineWidth: 2 | 3,
      lineStyle: 0 | 2 = 0,
    ) => {
      const series = chart.addSeries(LineSeries, {
        color,
        lineWidth,
        lineStyle,
        priceLineVisible: false,
        lastValueVisible: true,
        crosshairMarkerVisible: true,
      });

      seriesRef.current[key] = series;

      return series;
    };

    const actualSeries = createLine("actual", "#16a34a", 2);
    const naiveSeries = createLine("naive", "#3b82f6", 2, 2);
    const rfSeries = createLine("randomForest", "#f59e0b", 3);
    const lrSeries = createLine("linearRegression", "#a78bfa", 2);
    const xgbSeries = createLine("xgboost", "#ef4444", 3);

    const lastPoint = forecast.historical[forecast.historical.length - 1];

    const actualData = forecast.historical.map(point => ({
      time: point.date as Time,
      value: point.close,
    }));

    actualSeries.setData(actualData);

    const forecastPoints = forecast.forecasts.filter(day => day.date !== null);

    const naiveData = lastPoint
      ? [
          {
            time: lastPoint.date as Time,
            value: lastPoint.close,
          },
          ...forecastPoints.map(day => ({
            time: day.date as Time,
            value: day.naive.close,
          })),
        ]
      : [];

    const rfData = lastPoint
      ? [
          {
            time: lastPoint.date as Time,
            value: lastPoint.close,
          },
          ...forecastPoints
            .filter(day => day.random_forest !== null)
            .map(day => ({
              time: day.date as Time,
              value: day.random_forest!.close,
            })),
        ]
      : [];

    const xgbData = lastPoint
      ? [
          {
            time: lastPoint.date as Time,
            value: lastPoint.close,
          },
          ...forecastPoints
            .filter(day => day.xgboost.close !== undefined)
            .map(day => ({
              time: day.date as Time,
              value: day.xgboost.close!,
            })),
        ]
      : [];

    naiveSeries.setData(naiveData);
    rfSeries.setData(rfData);
    lrSeries.setData([]);
    xgbSeries.setData(xgbData);

    // Tooltip interaction.
    const handleCrosshairMove = (param: MouseEventParams<Time>) => {
      if (
        !param.point ||
        param.point.x < 0 ||
        param.point.y < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y > 440 ||
        !param.time
      ) {
        setTooltip(current => ({
          ...current,
          visible: false,
        }));
        return;
      }

      const seriesList = [
        {
          key: "actual",
          series: actualSeries,
          color: "#16a34a",
        },
        {
          key: "naive",
          series: naiveSeries,
          color: "#3b82f6",
        },
        {
          key: "randomForest",
          series: rfSeries,
          color: "#f59e0b",
        },
        {
          key: "linearRegression",
          series: lrSeries,
          color: "#a78bfa",
        },
        {
          key: "xgboost",
          series: xgbSeries,
          color: "#ef4444",
        },
      ] as const;

      const values: TooltipValue[] = seriesList
        .filter(item => visibility[item.key])
        .map(item => {
          const data = param.seriesData.get(item.series);

          return {
            series: SERIES_NAMES[item.key],
            price: data && "value" in data ? data.value : null,
            color: item.color,
          };
        });

      const date =
        typeof param.time === "string"
          ? param.time
          : `${param.time.year}-${String(param.time.month).padStart(2, "0")}-${String(param.time.day).padStart(2, "0")}`;

      setTooltip({
        visible: true,
        date,
        values,
        x: param.point.x,
        y: param.point.y,
      });
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    // Forecast start marker.
    const firstForecastDate = forecastPoints[0]?.date;

    if (firstForecastDate) {
      const lastActualDate = lastPoint?.date;

      if (lastActualDate) {
        // Marker is placed on the last historical point.
        // Forecast dates are shown in the forecast series.
      }
    }

    // Resize chart.
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];

      if (!entry) return;

      chart.applyOptions({
        width: entry.contentRect.width,
      });
    });

    resizeObserver.observe(container);

    // Initial view.
    const visibleHistory = forecast.historical.slice(-7);
    const lastForecast = forecastPoints[forecastPoints.length - 1];

    if (visibleHistory.length > 0 && lastForecast?.date) {
      chart.timeScale().setVisibleRange({
        from: visibleHistory[0].date as Time,
        to: lastForecast.date as Time,
      });
    } else {
      chart.timeScale().fitContent();
    }

    // Forecast Focus.
    const showForecastFocus = () => {
      const history = forecast.historical.slice(-7);
      const last = forecastPoints[forecastPoints.length - 1];

      if (history.length > 0 && last?.date) {
        chart.timeScale().setVisibleRange({
          from: history[0].date as Time,
          to: last.date as Time,
        });
      }
    };

    // Show All.
    const showAll = () => {
      chart.timeScale().fitContent();
    };

    // Reset Zoom.
    const resetZoom = () => {
      showForecastFocus();

      chart.priceScale("right").applyOptions({
        autoScale: true,
      });
    };

    window.addEventListener("gold-chart-forecast-focus", showForecastFocus);

    window.addEventListener("gold-chart-show-all", showAll);
    window.addEventListener("gold-chart-reset-zoom", resetZoom);

    return () => {
      window.removeEventListener(
        "gold-chart-forecast-focus",
        showForecastFocus,
      );

      window.removeEventListener("gold-chart-show-all", showAll);

      window.removeEventListener("gold-chart-reset-zoom", resetZoom);

      chart.unsubscribeCrosshairMove(handleCrosshairMove);

      resizeObserver.disconnect();
      chart.remove();

      chartRef.current = null;
      seriesRef.current = {};
    };
  }, [forecast, visibility]);

  // Update series visibility.
  useEffect(() => {
    Object.entries(visibility).forEach(([key, visible]) => {
      const series = seriesRef.current[key as keyof ChartVisibility];

      series?.applyOptions({ visible });
    });
  }, [visibility]);

  return (
    <div className="relative w-full">
      <div ref={containerRef} className="w-full" style={{ height: 440 }} />

      <GoldChartTooltip
        visible={tooltip.visible}
        date={tooltip.date}
        values={tooltip.values}
        x={tooltip.x}
        y={tooltip.y}
      />
    </div>
  );
}
