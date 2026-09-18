import { useEffect, useId, useRef, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiMaximize2,
  FiZoomIn,
} from "react-icons/fi";
import { money } from "./projection.js";

export default function GrowthChart({
  points,
  selectedAge,
  onSelectAge,
  stopAge,
  plan,
  t,
}) {
  const host = useRef(null);
  const [width, setWidth] = useState(700);
  const [zoomed, setZoomed] = useState(false);
  const [viewStart, setViewStart] = useState(points[0].age);
  const gradient = useId().replace(/:/g, "");
  const firstAge = points[0].age;
  const lastAge = points.at(-1).age;
  const span = zoomed ? Math.min(20, lastAge - firstAge) : lastAge - firstAge;
  const start = zoomed
    ? Math.max(firstAge, Math.min(lastAge - span, viewStart))
    : firstAge;
  const end = start + span;
  const visible = points.filter((p) => p.age >= start && p.age <= end);
  const selected = points.find((p) => p.age === selectedAge) || points.at(-1);
  const height = width < 480 ? 265 : 300;
  const margin = {
    top: 28,
    right: 18,
    bottom: 32,
    left: width < 480 ? 52 : 62,
  };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const desiredStep =
    (Math.max(100, ...visible.flatMap((p) => [p.balance, p.added])) * 1.05) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(desiredStep));
  const tickStep =
    [1, 2, 2.5, 5, 10].find((step) => step * magnitude >= desiredStep) *
    magnitude;
  const max = tickStep * 4;
  const x = (age) => margin.left + ((age - start) / span) * chartWidth;
  const y = (amount) => margin.top + chartHeight - (amount / max) * chartHeight;
  const line = (key, data = visible) =>
    data.map((p, i) => `${i ? "L" : "M"}${x(p.age)},${y(p[key])}`).join(" ");
  const area = (key) =>
    `${line(key)} L${x(end)},${y(0)} L${x(start)},${y(0)} Z`;
  const tickCount = width < 480 ? 4 : 7;
  const ticks = [
    ...new Set(
      Array.from({ length: tickCount }, (_, i) =>
        Math.round(start + (span * i) / (tickCount - 1)),
      ),
    ),
  ];

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(240, entry.contentRect.width)),
    );
    observer.observe(host.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (zoomed && (selectedAge < start || selectedAge > end)) {
      setViewStart(
        Math.max(
          firstAge,
          Math.min(lastAge - span, selectedAge - Math.floor(span / 2)),
        ),
      );
    }
  }, [zoomed, selectedAge, start, end, firstAge, lastAge, span]);

  function pan(direction) {
    const nextStart = Math.max(
      firstAge,
      Math.min(lastAge - span, start + direction * 10),
    );
    setViewStart(nextStart);
    onSelectAge(Math.max(nextStart, Math.min(nextStart + span, selectedAge)));
  }

  function selectAtPointer(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relative = ((event.clientX - rect.left) * width) / rect.width;
    onSelectAge(
      Math.max(
        start,
        Math.min(
          end,
          Math.round(start + ((relative - margin.left) / chartWidth) * span),
        ),
      ),
    );
  }

  return (
    <div className="inv-chart" ref={host}>
      <div className="inv-chart-toolbar">
        <div className="inv-legend">
          <span>
            <i className="inv-dot inv-dot-growth" />{" "}
            {t ? t("chart.accountValue") : "Account value"}
          </span>
          <span>
            <i className="inv-dot inv-dot-added" />{" "}
            {t ? t("chart.moneyAdded") : "Money added"}
          </span>
        </div>
        <div className="inv-chart-navigation">
          {zoomed && (
            <>
              <button
                type="button"
                className="inv-pan"
                aria-label={t ? t("chart.earlierYears") : "Earlier years"}
                disabled={start === firstAge}
                onClick={() => pan(-1)}
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                className="inv-pan"
                aria-label={t ? t("chart.laterYears") : "Later years"}
                disabled={end === lastAge}
                onClick={() => pan(1)}
              >
                <FiChevronRight />
              </button>
            </>
          )}
          <button
            type="button"
            className="inv-icon-text"
            onClick={() => {
              setViewStart(
                Math.max(
                  firstAge,
                  Math.min(
                    lastAge - Math.min(20, lastAge - firstAge),
                    selectedAge - 10,
                  ),
                ),
              );
              setZoomed(!zoomed);
            }}
            aria-pressed={zoomed}
          >
            {zoomed ? <FiMaximize2 /> : <FiZoomIn />}{" "}
            {zoomed
              ? t
                ? t("chart.allYears")
                : "All years"
              : t
                ? t("chart.zoomIn")
                : "Zoom in"}
          </button>
        </div>
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="inv-chart-svg"
        role="img"
        aria-label={`Investment projection from age ${start} to ${end}. At age ${selectedAge}: ${money(selected.balance)} in ${plan?.applyInflation ? (t ? t("projection.todayDollars") : "today's dollars") : (t ? t("projection.futureDollars") : "future dollars")}. Use the age slider below to explore.`}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse")
            event.currentTarget.setPointerCapture(event.pointerId);
          selectAtPointer(event);
        }}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse" || event.buttons === 1)
            selectAtPointer(event);
        }}
      >
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#83ae92" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#83ae92" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((tick) => (
          <g key={tick}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={y((max * tick) / 4)}
              y2={y((max * tick) / 4)}
              className="inv-gridline"
            />
            <text
              x={margin.left - 12}
              y={y((max * tick) / 4) + 4}
              textAnchor="end"
              className="inv-axis"
            >
              {money((max * tick) / 4, true)}
            </text>
          </g>
        ))}
        <path d={area("balance")} fill={`url(#${gradient})`} />
        <path d={area("added")} className="inv-principal-area" />
        <path d={line("added")} className="inv-principal-line" />
        {stopAge > start && stopAge < end && (
          <g>
            <line
              x1={x(stopAge)}
              x2={x(stopAge)}
              y1={margin.top}
              y2={y(0)}
              className="inv-stop-line"
            />
            <text
              x={x(stopAge) > width - 110 ? x(stopAge) - 7 : x(stopAge) + 7}
              textAnchor={x(stopAge) > width - 110 ? "end" : "start"}
              y={margin.top - 10}
              className="inv-axis inv-stop-label"
            >
              {t ? t("chart.depositsStop") : "Deposits stop"}
            </text>
          </g>
        )}
        <path d={line("balance")} className="inv-balance-line" />
        {selectedAge >= start && selectedAge <= end && (
          <g>
            <line
              x1={x(selectedAge)}
              x2={x(selectedAge)}
              y1={y(selected.balance)}
              y2={y(0)}
              className="inv-selected-line"
            />
            <circle
              cx={x(selectedAge)}
              cy={y(selected.balance)}
              r="9"
              className="inv-selected-halo"
            />
            <circle
              cx={x(selectedAge)}
              cy={y(selected.balance)}
              r="4.5"
              className="inv-selected-point"
            />
          </g>
        )}
        {ticks.map((age) => (
          <text
            key={age}
            x={x(age)}
            y={height - 7}
            textAnchor="middle"
            className="inv-axis"
          >
            {age}
          </text>
        ))}
      </svg>
      <div className="inv-chart-hint">
        <span>{t ? t("chart.hint") : "Age · tap or move across the chart"}</span>
        <span>
          {plan?.applyInflation
            ? t
              ? `${t("projection.todayDollars")} · USD`
              : "Today’s dollars · USD"
            : t
              ? t("chart.currencyHint")
              : "Future dollars · USD"}
        </span>
      </div>
      <div className="inv-scrubber">
        <button
          className="inv-square-button"
          type="button"
          aria-label={t ? t("chart.prevAge") : "Previous age"}
          disabled={selectedAge <= firstAge}
          onClick={() => onSelectAge(selectedAge - 1)}
        >
          <FiChevronLeft />
        </button>
        <div className="inv-scrubber-track">
          <label htmlFor="inv-explore-age">
            {t ? t("chart.exploreYears") : "Explore the years"}{" "}
            <strong>
              {t ? t("chart.age") : "Age"} {selectedAge}
            </strong>
          </label>
          <input
            id="inv-explore-age"
            type="range"
            min={firstAge}
            max={lastAge}
            step="1"
            value={selectedAge}
            onChange={(event) => onSelectAge(Number(event.target.value))}
            aria-valuetext={`${t ? t("chart.age") : "Age"} ${selectedAge}, ${money(selected.balance)}`}
          />
        </div>
        <button
          className="inv-square-button"
          type="button"
          aria-label={t ? t("chart.nextAge") : "Next age"}
          disabled={selectedAge >= lastAge}
          onClick={() => onSelectAge(selectedAge + 1)}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
}
