import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  FiArrowUpRight,
  FiBookOpen,
  FiBriefcase,
  FiChevronDown,
  FiHeart,
  FiInfo,
  FiMoon,
  FiRotateCcw,
  FiSun,
  FiTrendingUp,
  FiUser,
} from "react-icons/fi";
import GrowthChart from "./GrowthChart.jsx";
import {
  ACCOUNT_TYPES,
  annualLimit,
  defaultPlan,
  money,
  normalizePlan,
  projectInvestment,
} from "./projection.js";
import {
  openInvestingSession,
  saveInvestingSession,
} from "./investingStorage.js";
import { getInitialUserLanguage } from "../utils/defaultLanguage.js";
import { getLocalThemeMode, persistThemeMode } from "../useThemeStore.jsx";
import { translate } from "./investingTranslations.js";
import "./investing.css";

const getAccounts = (t) => ({
  child: {
    label: t("account.530a.label"),
    subtitle: t("account.530a.subtitle"),
    icon: FiHeart,
    limit: t("account.530a.limit"),
    link: "https://www.irs.gov/trumpaccounts",
  },
  "401k": {
    label: t("account.401k.label"),
    subtitle: t("account.401k.subtitle"),
    icon: FiBriefcase,
    title: t("account.401k.title"),
    description: t("account.401k.description"),
    limit: t("account.401k.limit"),
    link: "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500",
  },
  ira: {
    label: t("account.ira.label"),
    subtitle: t("account.ira.subtitle"),
    icon: FiUser,
    title: t("account.ira.title"),
    description: t("account.ira.description"),
    limit: t("account.ira.limit"),
    link: "https://www.irs.gov/retirement-plans/individual-retirement-arrangements-iras",
  },
});

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 1000000,
  prefix,
  suffix,
  step = 1,
  help,
}) {
  const id = useId();
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);
  return (
    <div className="inv-field">
      <label htmlFor={id}>{label}</label>
      <div className="inv-input-wrap">
        {prefix && <span>{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode={step < 1 ? "decimal" : "numeric"}
          min={min}
          max={max}
          step={step}
          value={draft}
          onFocus={() => setFocused(true)}
          onChange={(event) => {
            const text = event.target.value;
            setDraft(text);
            const numeric = Number(text);
            if (
              text !== "" &&
              Number.isFinite(numeric) &&
              numeric >= min &&
              numeric <= max
            )
              onChange(numeric);
          }}
          onBlur={() => {
            const parsed = draft === "" ? value : Number(draft);
            const next = Math.max(
              min,
              Math.min(max, Number.isFinite(parsed) ? parsed : value),
            );
            onChange(next);
            setDraft(String(next));
            setFocused(false);
          }}
          aria-describedby={help ? `${id}-help` : undefined}
        />
        {suffix && <span>{suffix}</span>}
      </div>
      {help && <small id={`${id}-help`}>{help}</small>}
    </div>
  );
}

function Toggle({ checked, onChange, title, description }) {
  return (
    <label className="inv-toggle-label">
      <span>
        <strong>{title}</strong>
        {description && <small>{description}</small>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="inv-toggle" aria-hidden="true" />
    </label>
  );
}

function sanitizePlans(plans) {
  if (!plans) return plans;
  const sanitized = { ...plans };
  for (const key of Object.keys(sanitized)) {
    if (sanitized[key]) {
      let updated = sanitized[key];
      if (updated.annualReturn === 7 || !updated.annualReturn) {
        updated = { ...updated, annualReturn: 10 };
      }
      if (updated.amount === 100 || updated.amount === 250) {
        updated = { ...updated, amount: 25 };
      }
      sanitized[key] = updated;
    }
  }
  return sanitized;
}

function initialSession() {
  try {
    const session = openInvestingSession();
    return { ...session, plans: sanitizePlans(session.plans), error: "" };
  } catch (error) {
    return {
      profile: null,
      account: "child",
      plans: Object.fromEntries(
        ACCOUNT_TYPES.map((type) => [type, defaultPlan(type)]),
      ),
      error: error.message || "Browser storage is unavailable.",
    };
  }
}

export default function InvestingApp() {
  const [session] = useState(initialSession);
  const [account, setAccount] = useState(session.account);
  const [plans, setPlans] = useState(() => sanitizePlans(session.plans));
  const [saveError, setSaveError] = useState(session.error);
  const [selectedAge, setSelectedAge] = useState(
    session.plans[session.account].endAge,
  );
  const [controlsOpen, setControlsOpen] = useState(false);

  useEffect(() => {
    setPlans((current) => sanitizePlans(current));
  }, []);

  // Language & Theme State
  const [userLanguage, setUserLanguage] = useState(() =>
    getInitialUserLanguage(),
  );
  const [themeMode, setThemeMode] = useState(() => getLocalThemeMode());

  const t = useCallback(
    (key, params) => translate(userLanguage, key, params),
    [userLanguage],
  );

  const toggleLanguage = () => {
    const next = userLanguage === "es" ? "en" : "es";
    setUserLanguage(next);
    try {
      localStorage.setItem("userLanguage", next);
    } catch {}
  };

  const setLanguage = (next) => {
    if (userLanguage === next) return;
    setUserLanguage(next);
    try {
      localStorage.setItem("userLanguage", next);
    } catch {}
  };


  const toggleTheme = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    persistThemeMode(next);
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = themeMode;
      document.documentElement.dataset.themeMode = themeMode;
      document.documentElement.style.colorScheme = themeMode;
    }
  }, [themeMode]);

  const plan = plans[account];
  const accountsData = useMemo(() => getAccounts(t), [t]);
  const details = accountsData[account];
  const { points, limited } = useMemo(() => projectInvestment(plan), [plan]);
  const age = Math.max(plan.startAge, Math.min(plan.endAge, selectedAge));
  const selected = points[age - plan.startAge];
  const final = points.at(-1);
  const depositsEndAge =
    plan.frequency === "once" && !plan.employerMonthly
      ? plan.startAge
      : plan.stopAge;
  const stopPoint = points[Math.max(0, depositsEndAge - plan.startAge)];
  const currentLimit = annualLimit(plan, plan.startAge);
  const milestoneAges = [
    ...new Set([
      account === "child"
        ? 18
        : Math.round(plan.startAge + (plan.endAge - plan.startAge) / 3),
      account === "child"
        ? 40
        : Math.round(plan.startAge + (2 * (plan.endAge - plan.startAge)) / 3),
      plan.endAge,
    ]),
  ]
    .filter((a) => a >= plan.startAge && a <= plan.endAge)
    .sort((a, b) => a - b);

  useEffect(() => {
    const title = document.title;
    const viewport = document.querySelector('meta[name="viewport"]');
    const originalViewport = viewport?.content;
    document.title = t("page.title");
    if (viewport) viewport.content = "width=device-width, initial-scale=1.0";
    return () => {
      document.title = title;
      if (viewport) viewport.content = originalViewport;
    };
  }, [t]);

  useEffect(() => {
    if (!session.profile) return;
    try {
      saveInvestingSession({ profile: session.profile, plans, account });
      setSaveError("");
    } catch {
      setSaveError(t("notice.saveError"));
    }
  }, [session.profile, plans, account, t]);

  function update(changes) {
    setPlans((current) => ({
      ...current,
      [account]: normalizePlan({ ...current[account], ...changes }),
    }));
  }
  function switchAccount(next) {
    setAccount(next);
    setSelectedAge(plans[next].endAge);
  }
  function setFrequency(frequency) {
    // Preserve the annual saving rate when switching recurring schedules.
    const amount =
      plan.frequency === "monthly" && frequency === "yearly"
        ? plan.amount * 12
        : plan.frequency === "yearly" && frequency === "monthly"
          ? Math.round((plan.amount / 12) * 100) / 100
          : plan.amount;
    update({
      frequency,
      amount,
      maxContributions: frequency === "once" ? false : plan.maxContributions,
    });
  }

  return (
    <div className="investing-page" data-theme={themeMode}>
      <header className="inv-header">
        <div className="inv-brand">
          <div className="inv-brand-symbol">✳</div>
          <span>
            {t("brand.title")}
            <span className="inv-brand-divider">/</span>
            <b>{t("brand.subtitle")}</b>
          </span>
        </div>
        <div className="inv-header-right">
          <div
            role="switch"
            tabIndex={0}
            aria-checked={userLanguage === "es"}
            className={`inv-lang-switch ${userLanguage === "es" ? "is-es" : "is-en"}`}
            onClick={toggleLanguage}
            onKeyDown={(event) => {
              if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                toggleLanguage();
              }
            }}
            aria-label={t("header.langToggle")}
            title={
              userLanguage === "es" ? "Switch to English" : "Cambiar a Español"
            }
          >
            <span
              className={`inv-lang-label ${userLanguage === "en" ? "is-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setLanguage("en");
              }}
            >
              EN
            </span>
            <span
              className={`inv-lang-track ${userLanguage === "es" ? "is-es" : "is-en"}`}
              aria-hidden="true"
            >
              <span className="inv-lang-thumb" />
            </span>
            <span
              className={`inv-lang-label ${userLanguage === "es" ? "is-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setLanguage("es");
              }}
            >
              ES
            </span>
          </div>
          <button
            type="button"
            className="inv-theme-btn"
            onClick={toggleTheme}
            aria-label={
              themeMode === "dark"
                ? t("header.themeLight")
                : t("header.themeDark")
            }
            title={
              themeMode === "dark"
                ? t("header.themeLight")
                : t("header.themeDark")
            }
          >
            {themeMode === "dark" ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </header>

      <main className="inv-main">
        <div className="inv-layout">
          <aside
            id="inv-settings"
            className={`inv-controls ${controlsOpen ? "is-expanded" : ""}`}
            aria-label="Investment settings"
          >
            <div className="inv-section-label">
              <button
                className="inv-reset"
                onClick={() => {
                  setPlans((current) => ({
                    ...current,
                    [account]: defaultPlan(account),
                  }));
                  setSelectedAge(defaultPlan(account).endAge);
                }}
                title={t("account.reset")}
                aria-label={t("account.reset")}
              >
                <FiRotateCcw />
              </button>
            </div>
            <button
              className="inv-mobile-settings"
              aria-expanded={controlsOpen}
              aria-controls="inv-controls-body"
              onClick={() => setControlsOpen(!controlsOpen)}
            >
              <span>
                <b>{details.label}</b> ·{" "}
                {plan.maxContributions
                  ? t("plan.annualMaximum")
                  : `${money(plan.amount)} ${plan.frequency === "monthly" ? t("plan.perMonth") : plan.frequency === "yearly" ? t("plan.perYear") : t("plan.oneTime")}`}
              </span>
              <span className="inv-mobile-edit-btn">
                {controlsOpen ? t("projection.close") : t("projection.edit")}
                <FiChevronDown />
              </span>
            </button>
            <div id="inv-controls-body" className="inv-controls-body">
              <fieldset className="inv-account-fieldset">
                <legend>{t("account.where")}</legend>
                <div className="inv-accounts">
                  {ACCOUNT_TYPES.map((type) => {
                    const Icon = accountsData[type].icon;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => switchAccount(type)}
                        className={`inv-account ${account === type ? "is-active" : ""}`}
                        aria-pressed={account === type}
                      >
                        <Icon />
                        <strong>{accountsData[type].label}</strong>
                        <span>{accountsData[type].subtitle}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div className="inv-account-description">
                {details.title && <strong>{details.title}</strong>}
                {details.description && <p>{details.description}</p>}
                <a href="#inv-account-details">
                  {t("account.understand")} <FiArrowUpRight />
                </a>
              </div>

              {account === "ira" && (
                <div
                  className="inv-segment inv-ira-type"
                  role="group"
                  aria-label={t("ira.taxTreatment")}
                >
                  {["traditional", "roth"].map((type) => (
                    <button
                      key={type}
                      aria-pressed={plan.iraType === type}
                      onClick={() => update({ iraType: type })}
                    >
                      {type === "roth" ? t("ira.roth") : t("ira.traditional")}
                    </button>
                  ))}
                </div>
              )}
              {account === "ira" && (
                <p className="inv-ira-note">
                  {plan.iraType === "roth"
                    ? t("ira.rothNote")
                    : t("ira.tradNote")}{" "}
                  {t("ira.growthNote")}
                </p>
              )}
              <div className="inv-field">
                <label id="inv-frequency-label">
                  {t("plan.frequency")}
                </label>
                <div
                  className="inv-segment"
                  role="group"
                  aria-labelledby="inv-frequency-label"
                >
                  {[
                    ["monthly", t("plan.monthly")],
                    ["yearly", t("plan.yearly")],
                    ["once", t("plan.once")],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      aria-pressed={plan.frequency === key}
                      onClick={() => setFrequency(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {plan.maxContributions ? (
                <div className="inv-max-amount">
                  <span>{t("plan.startingContribution")}</span>
                  <strong>
                    {money(
                      plan.frequency === "monthly"
                        ? currentLimit / 12
                        : currentLimit,
                    )}
                    <small>
                      {" "}
                      {plan.frequency === "monthly" ? t("plan.perMonth") : t("plan.perYear")}
                    </small>
                  </strong>
                  <p>{t("plan.modeledLimitNote")}</p>
                </div>
              ) : (
                <NumberField
                  label={
                    plan.frequency === "once"
                      ? t("plan.oneTimeInvestment")
                      : t("plan.yourContribution")
                  }
                  value={plan.amount}
                  onChange={(amount) => update({ amount })}
                  prefix="$"
                  suffix={
                    plan.frequency === "monthly"
                      ? t("plan.perMonth")
                      : plan.frequency === "yearly"
                        ? t("plan.perYear")
                        : t("plan.today")
                  }
                  step={0.01}
                />
              )}
              {plan.frequency !== "once" && (
                <label className="inv-checkbox-row">
                  <input
                    type="checkbox"
                    checked={plan.maxContributions}
                    onChange={(event) =>
                      update({ maxContributions: event.target.checked })
                    }
                  />
                  <span>{t("plan.useAnnualMax")}</span>
                </label>
              )}
              <div className="inv-age-fields">
                <NumberField
                  label={
                    account === "child" ? t("plan.childAgeNow") : t("plan.yourAgeNow")
                  }
                  value={plan.startAge}
                  max={account === "child" ? 17 : 89}
                  onChange={(startAge) => update({ startAge })}
                />
                <NumberField
                  label={
                    plan.frequency === "once" && !plan.employerMonthly
                      ? t("plan.lookAheadTo")
                      : t("plan.stopAddingAt")
                  }
                  value={
                    plan.frequency === "once" && !plan.employerMonthly
                      ? plan.endAge
                      : plan.stopAge
                  }
                  min={
                    plan.frequency === "once" && !plan.employerMonthly
                      ? plan.startAge + 1
                      : plan.startAge
                  }
                  max={
                    plan.frequency === "once" && !plan.employerMonthly
                      ? 90
                      : account === "child"
                        ? Math.min(18, plan.endAge)
                        : plan.endAge
                  }
                  onChange={(value) =>
                    update(
                      plan.frequency === "once" && !plan.employerMonthly
                        ? { endAge: value }
                        : { stopAge: value },
                    )
                  }
                />
              </div>
              {account === "child" && (
                <div className="inv-seed">
                  <Toggle
                    checked={plan.seed}
                    onChange={(seed) => update({ seed })}
                    title={t("plan.seedHeadStart")}
                    description={t("plan.seedQualifies")}
                  />
                </div>
              )}
              <div className="inv-return">
                <label htmlFor="inv-return">
                  {t("plan.avgYearlyGrowth")} <strong>{plan.annualReturn}%</strong>
                </label>
                <input
                  id="inv-return"
                  type="range"
                  min="-20"
                  max="20"
                  step="0.5"
                  value={plan.annualReturn}
                  onChange={(event) =>
                    update({ annualReturn: Number(event.target.value) })
                  }
                />
                <div className="inv-range-labels">
                  <span>−20%</span>
                  <span>{t("plan.tryPossibilities")}</span>
                  <span>20%</span>
                </div>
                <small>{t("plan.assumptionNote")}</small>
              </div>
              <div className="inv-inflation-toggle">
                <label className="inv-checkbox-row">
                  <input
                    type="checkbox"
                    checked={plan.applyInflation}
                    onChange={(event) =>
                      update({ applyInflation: event.target.checked })
                    }
                  />
                  <span>{t("plan.applyInflation")}</span>
                </label>
                {plan.applyInflation && (
                  <div className="inv-inflation-input">
                    <NumberField
                      label={t("plan.inflationRate")}
                      value={plan.inflation}
                      min={0}
                      max={15}
                      step={0.1}
                      suffix="%"
                      onChange={(inflation) => update({ inflation })}
                      help={t("plan.inflationHelp")}
                    />
                  </div>
                )}
              </div>
              <div className="inv-more">
                <div className="inv-more-title">
                  {t("plan.fineTune")}
                </div>
                <div className="inv-more-content">
                  <NumberField
                    label={t("plan.alreadyInvested")}
                    value={plan.initialBalance}
                    onChange={(initialBalance) => update({ initialBalance })}
                    prefix="$"
                    max={100000000}
                    help={t("plan.existingBalanceHelp")}
                  />
                  <NumberField
                    label={t("plan.projectThroughAge")}
                    value={plan.endAge}
                    min={plan.startAge + 1}
                    max={90}
                    onChange={(endAge) => update({ endAge })}
                  />
                  <NumberField
                    label={t("plan.yearlyGrowthAssumption")}
                    value={plan.annualReturn}
                    min={-20}
                    max={20}
                    step={0.1}
                    suffix="%"
                    onChange={(annualReturn) => update({ annualReturn })}
                  />
                  <NumberField
                    label={t("plan.inflationRate")}
                    value={plan.inflation}
                    min={0}
                    max={15}
                    step={0.1}
                    suffix="%"
                    onChange={(inflation) => update({ inflation })}
                    help={t("plan.inflationHelp")}
                  />
                  {!plan.maxContributions && plan.frequency !== "once" && (
                    <NumberField
                      label={t("plan.increaseContributionsYearly")}
                      value={plan.contributionGrowth}
                      max={15}
                      step={0.5}
                      suffix="%"
                      onChange={(contributionGrowth) =>
                        update({ contributionGrowth })
                      }
                    />
                  )}
                  {account === "401k" && (
                    <NumberField
                      label={t("plan.employerContribution")}
                      value={plan.employerMonthly}
                      max={100000}
                      prefix="$"
                      suffix="/ month"
                      onChange={(employerMonthly) =>
                        update({ employerMonthly })
                      }
                      help={t("plan.employerContributionHelp")}
                    />
                  )}
                </div>
              </div>
            </div>
          </aside>

          <section
            id="inv-projection"
            className="inv-results"
            aria-label="Investment projection"
          >
            <div className="inv-insight">
              <span className="inv-insight-icon">
                <FiTrendingUp />
              </span>
              <div>
                <strong>
                  {depositsEndAge < plan.endAge && plan.annualReturn > 0
                    ? t("insight.canKeepGrowing")
                    : t("insight.habitSmall")}
                </strong>
                <p>
                  {depositsEndAge < plan.endAge ? (
                    t("insight.coastText", {
                      stopAge: depositsEndAge,
                      stopBalance: money(stopPoint.balance),
                      endAge: plan.endAge,
                      finalBalance: money(final.balance),
                    })
                  ) : (
                    t("insight.contributeText", {
                      endAge: plan.endAge,
                      personal: money(final.personal),
                      finalBalance: money(final.balance),
                    })
                  )}
                </p>
              </div>
            </div>
            <div className="inv-chart-card">
              <div className="inv-results-top">
                <span className="inv-live">
                  <span /> {t("projection.live")}
                </span>
                <a
                  className="inv-mobile-edit"
                  href="#inv-settings"
                  onClick={() => setControlsOpen(true)}
                >
                  {t("projection.edit")}
                </a>
              </div>
              <div className="inv-summary">
                <div>
                  <p className="inv-overline">
                    {t("projection.balanceAtAge")} <b>{age}</b>
                  </p>
                  <div className="inv-balance">{money(selected.balance)}</div>
                  <p className="inv-summary-note">
                    {plan.applyInflation
                      ? t("projection.inReal")
                      : t("projection.inFuture")}{" "}
                    <span>·</span> {t("projection.beforeTaxes")}
                  </p>
                </div>
              </div>
              <div className="inv-breakdown">
                <div>
                  <span>
                    <i className="inv-dot inv-dot-added" />{" "}
                    {plan.initialBalance > 0
                      ? t("projection.startingDeposits")
                      : t("projection.youPutIn")}
                  </span>
                  <strong>{money(selected.personal)}</strong>
                </div>
                {(plan.seed || plan.employerMonthly > 0) && (
                  <div>
                    <span>
                      <i className="inv-dot inv-dot-other" />{" "}
                      {account === "child"
                        ? t("projection.govSeed")
                        : t("projection.employerAdds")}
                    </span>
                    <strong>{money(selected.seed + selected.employer)}</strong>
                  </div>
                )}
                <div>
                  <span>
                    <i className="inv-dot inv-dot-growth" />{" "}
                    {selected.growth < 0
                      ? t("projection.investmentLoss")
                      : t("projection.investmentGrowth")}
                  </span>
                  <strong
                    className={
                      selected.growth < 0 ? "inv-negative" : "inv-positive"
                    }
                  >
                    {money(selected.growth)}
                  </strong>
                </div>
              </div>
              <GrowthChart
                points={points}
                selectedAge={age}
                onSelectAge={setSelectedAge}
                stopAge={depositsEndAge}
                plan={plan}
                t={t}
              />
              <div className="inv-milestones">
                {milestoneAges.map((milestoneAge) => (
                  <button
                    key={milestoneAge}
                    aria-label={`At age ${milestoneAge}, ${money(points[milestoneAge - plan.startAge].balance)}`}
                    onClick={() => setSelectedAge(milestoneAge)}
                    className={age === milestoneAge ? "is-active" : ""}
                  >
                    <span>
                      {t("milestone.atAge", { age: milestoneAge })}
                      <FiArrowUpRight />
                    </span>
                    <strong>
                      {money(
                        points[milestoneAge - plan.startAge].balance,
                        true,
                      )}
                    </strong>
                    <small>
                      {milestoneAge === depositsEndAge
                        ? t("milestone.saving")
                        : milestoneAge === plan.endAge
                          ? t("milestone.longView")
                          : t("milestone.alongWay")}
                    </small>
                  </button>
                ))}
              </div>
            </div>
            {limited && (
              <p className="inv-limit-notice" role="status">
                <FiInfo /> {t("notice.limitsExceeded")}
              </p>
            )}
            {saveError && (
              <p className="inv-limit-notice" role="status">
                <FiInfo /> {saveError}
              </p>
            )}
          </section>
        </div>

        <section className="inv-details-section" id="inv-account-details">
          <details>
            <summary>
              <span>
                <FiInfo /> {t("details.about", {
                  label: details.label,
                  childExtra: account === "child" ? t("details.childExtra") : "",
                })}
              </span>
              <FiChevronDown />
            </summary>
            <div className="inv-details-content">
              {account === "child" ? (
                <>
                  <p>{t("details.childP1")}</p>
                  <p>{t("details.childP2")}</p>
                </>
              ) : (
                <>
                  <p>
                    <b>{t("details.limitBaseline", { limit: details.limit })}</b>
                    {account === "401k"
                      ? t("details.401kText")
                      : t("details.iraText")}
                  </p>
                  <p>
                    {account === "401k"
                      ? t("details.pCatchup401k")
                      : t("details.pCatchupIra")}
                  </p>
                </>
              )}
              <a href={details.link} target="_blank" rel="noreferrer">
                {t("details.irsGuidance")} <FiArrowUpRight />
              </a>
              {account === "child" && (
                <a
                  href="https://www.irs.gov/newsroom/treasury-irs-issue-guidance-on-trump-accounts-established-under-the-working-families-tax-cuts-notice-announces-upcoming-regulations"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("details.transitionRules")} <FiArrowUpRight />
                </a>
              )}
              {account !== "child" && (
                <a
                  href={
                    account === "401k"
                      ? "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits"
                      : "https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500"
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  {account === "401k"
                    ? t("details.combinedRules")
                    : t("details.limitRules")}{" "}
                  <FiArrowUpRight />
                </a>
              )}
            </div>
          </details>
          <details>
            <summary>
              <span>
                <FiBookOpen /> {t("details.projectionHow")}
              </span>
              <FiChevronDown />
            </summary>
            <div className="inv-details-content">
              <p>{t("details.pReturns")}</p>
              <p>{t("details.pYears")}</p>
              <p>
                {plan.applyInflation
                  ? t("details.inflationMath")
                  : t("details.pFutureDollars")}
              </p>
              <p>{t("details.disclaimer")}</p>
            </div>
          </details>
        </section>
      </main>
    </div>
  );
}
