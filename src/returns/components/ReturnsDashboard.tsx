import * as React from "react";
import type { Marketplace, ProfitabilityParams, ReturnCategory, ReturnLog, Timeframe } from "../lib/types";
import { SAMPLE_RETURN_LOGS, simulateIncomingWebhook } from "../lib/webhookSimulator";
import { DEFAULT_PROFITABILITY_PARAMS, calculateProfitability } from "../lib/profitabilityEngine";
import { BASE_SIGNAL_COUNTS, CATEGORY_META, SPIKE_ALERTS, TIMEFRAME_MULTIPLIER } from "../data/dashboard";
import {
  DashboardHeader, MetricsGrid, ProfitModeler, RemediationDrawer, RemediationQueue, RootCauseChart, SpikeAlerts, Toast, TrendChart,
} from "./sections";

export interface ReturnsDashboardProps {
  /** Seed returns shown in the fix queue. */
  initialLogs?: ReturnLog[];
}

/** Full interactive returns-intelligence dashboard. */
export function ReturnsDashboard({ initialLogs = SAMPLE_RETURN_LOGS }: ReturnsDashboardProps) {
  const [logs, setLogs] = React.useState<ReturnLog[]>(initialLogs);
  const [marketplace, setMarketplace] = React.useState<Marketplace>("all");
  const [timeframe, setTimeframe] = React.useState<Timeframe>("7d");
  const [category, setCategory] = React.useState<ReturnCategory | null>(null);
  const [selected, setSelected] = React.useState<ReturnLog | null>(null);
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [autoStream, setAutoStream] = React.useState(false);
  const [params, setParams] = React.useState<ProfitabilityParams>(DEFAULT_PROFITABILITY_PARAMS);
  const [toast, setToast] = React.useState<{ title: string; description: string } | null>(null);

  const breakdown = React.useMemo(() => calculateProfitability(params), [params]);
  const filteredLogs = marketplace === "all" ? logs : logs.filter((l) => l.marketplace === marketplace);
  const alerts = marketplace === "all" ? SPIKE_ALERTS : SPIKE_ALERTS.filter((a) => a.marketplace === marketplace);

  const distribution = React.useMemo(() => {
    const cats = Object.keys(CATEGORY_META) as ReturnCategory[];
    const counts = Object.fromEntries(cats.map((c) => [c, 0])) as Record<ReturnCategory, number>;
    const channels = marketplace === "all" ? (["amazon", "flipkart", "shopify"] as const) : [marketplace];
    channels.forEach((ch) => cats.forEach((c) => { counts[c] += BASE_SIGNAL_COUNTS[ch][c]; }));
    cats.forEach((c) => { counts[c] = Math.round(counts[c] * TIMEFRAME_MULTIPLIER[timeframe]); });
    logs.slice(0, Math.max(0, logs.length - initialLogs.length)).forEach((l) => {
      if (marketplace === "all" || l.marketplace === marketplace) counts[l.category] += 1;
    });
    const total = cats.reduce((s, c) => s + counts[c], 0);
    let assigned = 0;
    return cats.map((c, i) => {
      const percentage = i === cats.length - 1 ? 100 - assigned : Math.round((counts[c] / total) * 100);
      assigned += percentage;
      return { category: c, percentage, count: counts[c], ...CATEGORY_META[c] };
    });
  }, [logs, marketplace, timeframe, initialLogs.length]);
  const signalsProcessed = distribution.reduce((s, d) => s + d.count, 0);

  const ingest = React.useCallback(() => {
    setIsSimulating(true);
    setTimeout(() => { setLogs((prev) => [simulateIncomingWebhook(), ...prev]); setIsSimulating(false); }, 450);
  }, []);

  React.useEffect(() => {
    if (!autoStream) return;
    const t = setInterval(ingest, 3500);
    return () => clearInterval(t);
  }, [autoStream, ingest]);

  const pushTicket = (id: string, target: "linear" | "jira", customFix?: string) => {
    const ticketId = target === "linear" ? `ENG-CAT-${Math.floor(100 + Math.random() * 900)}` : `JIRA-RET-${Math.floor(1000 + Math.random() * 9000)}`;
    setLogs((prev) => prev.map((l) => l.id === id ? {
      ...l,
      status: target === "linear" ? "Pushed to Linear" : "Pushed to Jira",
      suggestedFix: customFix || l.suggestedFix,
      ticketIdentifier: ticketId,
    } : l));
    setToast({ title: `Ticket ${ticketId} created`, description: `Sent to ${target === "linear" ? "Linear" : "Jira"} for the listing team.` });
  };
  const dismiss = (id: string) => setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Dismissed" } : l)));
  const shipped = logs.filter((l) => l.status === "Pushed to Linear" || l.status === "Pushed to Jira").length + 312;

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/10 to-transparent" />
      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <DashboardHeader marketplace={marketplace} onMarketplaceChange={setMarketplace} timeframe={timeframe} onTimeframeChange={setTimeframe}
          onSimulateWebhook={ingest} onRefresh={() => { setLogs([...initialLogs]); setCategory(null); }} isSimulating={isSimulating}
          autoStream={autoStream} onAutoStreamChange={setAutoStream} />
        <MetricsGrid totalReturns={signalsProcessed} misalignmentRate={18.4} publishedTickets={shipped} breakdown={breakdown} />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><RootCauseChart distribution={distribution} signalsProcessed={signalsProcessed} activeCategory={category} onCategoryChange={setCategory} /></div>
          <SpikeAlerts alerts={alerts} logs={logs} onOpenInspector={setSelected} />
        </div>
        <ProfitModeler params={params} onParamsChange={setParams} breakdown={breakdown} />
        <TrendChart />
        <RemediationQueue logs={filteredLogs} activeCategory={category} onCategoryChange={setCategory}
          onOpenInspector={setSelected} onPushTicket={pushTicket} onDismiss={dismiss} />
      </div>
      {selected && (
        <RemediationDrawer log={logs.find((l) => l.id === selected.id) ?? selected} onClose={() => setSelected(null)}
          onApproveAndPush={(id, t, fix) => { pushTicket(id, t, fix); setSelected(null); }} />
      )}
      {toast && <Toast title={toast.title} description={toast.description} onClose={() => setToast(null)} />}
    </div>
  );
}
