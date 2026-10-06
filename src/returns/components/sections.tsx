import * as React from "react";
import {
  Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertTriangle, ArrowUpRight, Check, CheckCircle2, ChevronRight, Copy, DollarSign, Flame, Layers,
  Package, RefreshCw, Search, ShieldCheck, Sparkles, TrendingDown, TrendingUp, X, Zap,
} from "lucide-react";
import type {
  HighSpikeSku, Marketplace, ProfitabilityBreakdown, ProfitabilityParams, ReturnCategory, ReturnLog, Timeframe,
} from "../lib/types";
import { cn, formatCurrency } from "../lib/utils";
import { buildJiraAdfPayload, buildLinearGraphQLPayload } from "../lib/webhookSimulator";
import { CATEGORY_META, CHANNEL_META, WEEKLY_TREND } from "../data/dashboard";
import { AnimatedNumber, Badge, Button, Card, CardHeader, SegmentedControl, Slider, StatCard } from "./primitives";

export interface CategorySlice {
  category: ReturnCategory;
  percentage: number;
  count: number;
  color: string;
  description: string;
}

/* ---------------- ChannelBadge ---------------- */
export interface ChannelBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  channel: Exclude<Marketplace, "all">;
}
export const ChannelBadge = React.forwardRef<HTMLSpanElement, ChannelBadgeProps>(({ channel, className, ...props }, ref) => (
  <span ref={ref} className={cn("inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", CHANNEL_META[channel].className, className)} {...props}>
    {CHANNEL_META[channel].label}
  </span>
));
ChannelBadge.displayName = "ChannelBadge";

/* ---------------- DashboardHeader ---------------- */
export interface DashboardHeaderProps {
  marketplace: Marketplace;
  onMarketplaceChange: (m: Marketplace) => void;
  timeframe: Timeframe;
  onTimeframeChange: (t: Timeframe) => void;
  onSimulateWebhook: () => void;
  onRefresh: () => void;
  isSimulating: boolean;
  autoStream: boolean;
  onAutoStreamChange: (v: boolean) => void;
}
export function DashboardHeader(p: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-border pb-6 xl:flex-row xl:items-end xl:justify-between">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-gradient-to-br from-primary to-primary-strong p-3 text-primary-foreground shadow-glow">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">Returns Intelligence</h1>
            <Badge variant={p.autoStream ? "success" : "neutral"}>
              <span className={cn("h-1.5 w-1.5 rounded-full", p.autoStream ? "animate-pulse bg-success" : "bg-subtle")} />
              {p.autoStream ? "Live stream" : "Stream paused"}
            </Badge>
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Turn customer return feedback into listing fixes — and returns losses into recovered profit.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <SegmentedControl
          aria-label="Marketplace"
          value={p.marketplace}
          onChange={p.onMarketplaceChange}
          options={[
            { value: "all", label: "All" },
            { value: "amazon", label: "Amazon" },
            { value: "flipkart", label: "Flipkart" },
            { value: "shopify", label: "Shopify" },
          ]}
        />
        <SegmentedControl
          aria-label="Timeframe"
          value={p.timeframe}
          onChange={p.onTimeframeChange}
          options={[{ value: "7d", label: "7D" }, { value: "30d", label: "30D" }, { value: "90d", label: "QTD" }]}
        />
        <Button variant="secondary" size="sm" onClick={() => p.onAutoStreamChange(!p.autoStream)} aria-pressed={p.autoStream}>
          <span className={cn("h-2 w-2 rounded-full", p.autoStream ? "bg-success" : "bg-subtle")} />
          Auto-stream
        </Button>
        <Button size="sm" onClick={p.onSimulateWebhook} disabled={p.isSimulating}>
          <Zap className={cn("h-3.5 w-3.5", p.isSimulating && "animate-bounce")} />
          {p.isSimulating ? "Ingesting…" : "Simulate return"}
        </Button>
        <Button variant="secondary" size="icon" onClick={p.onRefresh} aria-label="Reset signals">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

/* ---------------- MetricsGrid ---------------- */
export interface MetricsGridProps {
  totalReturns: number;
  misalignmentRate: number;
  publishedTickets: number;
  breakdown: ProfitabilityBreakdown;
}
export function MetricsGrid({ totalReturns, misalignmentRate, publishedTickets, breakdown }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Returns ingested" value={totalReturns} icon={<Package className="h-4 w-4" />}
        trend={<span className="flex items-center gap-1 text-warning"><TrendingUp className="h-3.5 w-3.5" />+12% vs prior period</span>} />
      <StatCard label="Listing mismatch rate" value={misalignmentRate} format={(v) => `${v.toFixed(1)}%`} icon={<AlertTriangle className="h-4 w-4" />}
        trend={<span className="flex items-center gap-1 text-success"><TrendingDown className="h-3.5 w-3.5" />−3.2% after AI fixes</span>} />
      <StatCard label="Prevention savings" value={breakdown.preventionSavings} format={(v) => formatCurrency(v)} icon={<ShieldCheck className="h-4 w-4" />}
        trend={<span className="text-muted">{breakdown.preventedUnits.toLocaleString()} units never shipped back</span>} />
      <StatCard tone="highlight" label="Value recovered" value={breakdown.netTurnaroundGain} format={(v) => `+${formatCurrency(v)}`} icon={<DollarSign className="h-4 w-4" />}
        trend={<span className="font-medium text-success">{breakdown.netTurnaroundPercentage}% loss reduction</span>} />
      <StatCard label="Fix tickets shipped" value={publishedTickets} icon={<CheckCircle2 className="h-4 w-4" />}
        trend={<span className="text-muted">Synced to Linear & Jira</span>} />
    </div>
  );
}

/* ---------------- ProfitModeler ---------------- */
export interface ProfitModelerProps {
  params: ProfitabilityParams;
  onParamsChange: (p: ProfitabilityParams) => void;
  breakdown: ProfitabilityBreakdown;
}
const LEVERS: { key: keyof ProfitabilityParams; label: string; hint: string; min: number; max: number; format?: (v: number) => string }[] = [
  { key: "preventionRate", label: "Prevent with listing fixes", hint: "Share of returns stopped by better copy & size charts", min: 0, max: 60 },
  { key: "exchangeConversionRate", label: "Exchange instead of refund", hint: "Shoppers nudged to swap with bonus credit", min: 0, max: 80 },
  { key: "keepItItemValueThreshold", label: "“Keep it” price ceiling", hint: "Below this value, refund without a return trip", min: 0, max: 60, format: (v) => `$${v}` },
  { key: "recommerceRecoveryRate", label: "Open-box resale recovery", hint: "Value recovered by grading & reselling", min: 0, max: 90 },
];
export function ProfitModeler({ params, onParamsChange, breakdown }: ProfitModelerProps) {
  const bars = [
    { name: "Prevention", value: breakdown.preventionSavings, fill: "var(--chart-1)" },
    { name: "Exchanges", value: breakdown.exchangeRetainedMargin, fill: "var(--chart-2)" },
    { name: "Keep-it", value: breakdown.keepItLogisticsSaved, fill: "var(--chart-3)" },
    { name: "Resale", value: breakdown.recommerceResaleRecovered, fill: "var(--chart-4)" },
  ];
  const recoveredShare = Math.min(100, Math.max(0, breakdown.netTurnaroundPercentage));
  return (
    <Card padding="lg" className="animate-fade-up">
      <CardHeader
        icon={<Sparkles className="h-4 w-4" />}
        title="Return-to-profit simulator"
        description="Drag the levers to see how much of your returns loss you can win back."
        actions={<Button variant="ghost" size="sm" onClick={() => onParamsChange({ ...params, preventionRate: 24, exchangeConversionRate: 36, keepItItemValueThreshold: 22, recommerceRecoveryRate: 58 })}>Reset levers</Button>}
      />
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          {LEVERS.map((l) => (
            <Slider key={l.key} label={l.label} hint={l.hint} min={l.min} max={l.max} formatValue={l.format}
              value={params[l.key]} onValueChange={(v) => onParamsChange({ ...params, [l.key]: v })} />
          ))}
        </div>
        <div className="space-y-5 lg:col-span-3">
          <div className="grid grid-cols-2 gap-3">
            <Card variant="sunken" padding="sm">
              <div className="text-xs text-muted">Loss without action</div>
              <AnimatedNumber value={breakdown.baselineTotalLoss} format={(v) => formatCurrency(v)} className="mt-1 block font-display text-xl font-semibold text-danger" />
            </Card>
            <Card variant="sunken" padding="sm">
              <div className="text-xs text-muted">Recovered with levers</div>
              <AnimatedNumber value={breakdown.netTurnaroundGain} format={(v) => `+${formatCurrency(v)}`} className="mt-1 block font-display text-xl font-semibold text-success" />
            </Card>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-muted"><span>Share of loss recovered</span><span className="font-mono text-foreground">{recoveredShare}%</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-raised">
              <div className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-success transition-all duration-500" style={{ width: `${recoveredShare}%` }} />
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fill: "var(--subtle)", fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
                <Tooltip cursor={{ fill: "var(--surface-raised)" }} content={<ChartTooltip money />} />
                <Bar dataKey="value" radius={[8, 8, 2, 2]} animationDuration={500}>
                  {bars.map((b) => <Cell key={b.name} fill={b.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ChartTooltipProps { active?: boolean; payload?: { name?: string; value?: number; payload?: Record<string, unknown> }[]; label?: string; money?: boolean }
function ChartTooltip({ active, payload, label, money }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs shadow-card">
      {label && <div className="mb-1 font-medium text-foreground">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex gap-3 text-muted">
          <span>{p.name}</span>
          <span className="ml-auto font-mono text-foreground">{money ? formatCurrency(p.value ?? 0) : (p.value ?? 0).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- RootCauseChart ---------------- */
export interface RootCauseChartProps {
  distribution: CategorySlice[];
  signalsProcessed: number;
  activeCategory: ReturnCategory | null;
  onCategoryChange: (c: ReturnCategory | null) => void;
}
export function RootCauseChart({ distribution, signalsProcessed, activeCategory, onCategoryChange }: RootCauseChartProps) {
  const [hovered, setHovered] = React.useState<ReturnCategory | null>(null);
  const focus = distribution.find((d) => d.category === (hovered ?? activeCategory));
  return (
    <Card padding="lg" className="h-full animate-fade-up">
      <CardHeader icon={<Flame className="h-4 w-4" />} title="Why products come back"
        description="Click a reason to filter the fix queue below."
        actions={activeCategory && <Button variant="ghost" size="sm" onClick={() => onCategoryChange(null)}><X className="h-3.5 w-3.5" />Clear</Button>} />
      <div className="grid items-center gap-6 md:grid-cols-2">
        <div className="relative h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={distribution} dataKey="count" nameKey="category" innerRadius="64%" outerRadius="92%" paddingAngle={3} stroke="none"
                onMouseLeave={() => setHovered(null)}
                onMouseEnter={(_, i) => setHovered(distribution[i].category)}
                onClick={(_, i) => onCategoryChange(activeCategory === distribution[i].category ? null : distribution[i].category)}>
                {distribution.map((d) => (
                  <Cell key={d.category} fill={d.color} className="cursor-pointer outline-none transition-opacity"
                    opacity={!activeCategory || activeCategory === d.category ? 1 : 0.25} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <AnimatedNumber value={focus ? focus.count : signalsProcessed} className="font-display text-2xl font-semibold" />
            <span className="max-w-28 text-[11px] text-muted">{focus ? focus.category : "signals analysed"}</span>
          </div>
        </div>
        <ul className="space-y-1.5">
          {distribution.map((d) => {
            const active = activeCategory === d.category;
            return (
              <li key={d.category}>
                <button type="button" aria-pressed={active}
                  onClick={() => onCategoryChange(active ? null : d.category)}
                  onMouseEnter={() => setHovered(d.category)} onMouseLeave={() => setHovered(null)}
                  className={cn("w-full rounded-lg border px-3 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    active ? "border-border-strong bg-surface-raised" : "border-transparent hover:bg-surface-raised/60")}>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="font-medium text-foreground">{d.category}</span>
                    <span className="ml-auto font-mono text-muted">{d.percentage}%</span>
                  </div>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-sunken">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.percentage}%`, background: d.color }} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}

/* ---------------- TrendChart ---------------- */
export function TrendChart() {
  return (
    <Card padding="lg" className="animate-fade-up">
      <CardHeader icon={<TrendingDown className="h-4 w-4" />} title="Returns vs prevented, 8 weeks" description="Prevented returns climb as listing fixes ship." />
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={WEEKLY_TREND} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gReturns" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--danger)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--danger)" stopOpacity={0} /></linearGradient>
              <linearGradient id="gPrevented" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--success)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--success)" stopOpacity={0} /></linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fill: "var(--subtle)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--subtle)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="returns" name="Returns" stroke="var(--danger)" strokeWidth={2} fill="url(#gReturns)" />
            <Area type="monotone" dataKey="prevented" name="Prevented" stroke="var(--success)" strokeWidth={2} fill="url(#gPrevented)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ---------------- SpikeAlerts ---------------- */
export interface SpikeAlertsProps {
  alerts: HighSpikeSku[];
  logs: ReturnLog[];
  onOpenInspector: (log: ReturnLog) => void;
}
const BADGE_TONE = { Critical: "danger", Warning: "warning", Investigate: "accent" } as const;
export function SpikeAlerts({ alerts, logs, onOpenInspector }: SpikeAlertsProps) {
  const [expanded, setExpanded] = React.useState<string | null>(alerts[0]?.sku ?? null);
  return (
    <Card padding="lg" className="h-full animate-fade-up">
      <CardHeader icon={<AlertTriangle className="h-4 w-4" />} title="Return spikes" description="Products with unusual return jumps." />
      {alerts.length === 0 && <p className="py-8 text-center text-sm text-muted">No spikes on this marketplace.</p>}
      <ul className="space-y-2.5">
        {alerts.map((a) => {
          const open = expanded === a.sku;
          const linked = logs.find((l) => l.sku === a.sku);
          return (
            <li key={a.sku} className={cn("rounded-lg border transition-all", open ? "border-border-strong bg-surface-raised" : "border-border hover:border-border-strong")}>
              <button type="button" aria-expanded={open} onClick={() => setExpanded(open ? null : a.sku)}
                className="flex w-full items-center gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><Badge variant={BADGE_TONE[a.badge]}>{a.badge}</Badge><ChannelBadge channel={a.marketplace} /></div>
                  <div className="mt-1.5 truncate text-sm font-medium">{a.productName}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5 font-mono text-sm font-semibold text-danger"><ArrowUpRight className="h-3.5 w-3.5" />{a.returnSpikePercent}%</div>
                  <div className="text-[10px] text-subtle">{a.totalReturns} returns</div>
                </div>
                <ChevronRight className={cn("h-4 w-4 text-subtle transition-transform", open && "rotate-90")} />
              </button>
              {open && (
                <div className="animate-fade-up space-y-3 px-3 pb-3 text-xs">
                  <p className="text-muted">{a.primaryDriver}</p>
                  <blockquote className="border-l-2 border-primary pl-3 italic text-foreground/80">“{a.complaintQuote}”</blockquote>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">{a.preventableRate}% preventable · <span className="text-success">{formatCurrency(a.potentialAnnualSavings)}/yr</span></span>
                    {linked && <Button size="sm" variant="secondary" onClick={() => onOpenInspector(linked)}>Review fix</Button>}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/* ---------------- RemediationQueue ---------------- */
export interface RemediationQueueProps {
  logs: ReturnLog[];
  activeCategory: ReturnCategory | null;
  onCategoryChange: (c: ReturnCategory | null) => void;
  onOpenInspector: (log: ReturnLog) => void;
  onPushTicket: (id: string, target: "linear" | "jira") => void;
  onDismiss: (id: string) => void;
}
const PRIORITY_TONE = { P1: "danger", P2: "warning", P3: "neutral" } as const;
export function RemediationQueue({ logs, activeCategory, onCategoryChange, onOpenInspector, onPushTicket, onDismiss }: RemediationQueueProps) {
  const [search, setSearch] = React.useState("");
  const [priority, setPriority] = React.useState<"all" | "P1" | "P2" | "P3">("all");
  const [status, setStatus] = React.useState<"open" | "done" | "all">("open");
  const rows = logs.filter((l) => {
    const q = search.toLowerCase();
    const matchesQ = !q || [l.sku, l.productName, l.customerFeedback].some((s) => s.toLowerCase().includes(q));
    const isOpen = l.status === "Pending";
    return matchesQ && (priority === "all" || l.priority === priority) && (!activeCategory || l.category === activeCategory)
      && (status === "all" || (status === "open" ? isOpen : !isOpen));
  });
  return (
    <Card padding="none" className="animate-fade-up overflow-hidden">
      <div className="p-6 pb-4">
        <CardHeader className="mb-4" icon={<Sparkles className="h-4 w-4" />} title="Listing fix queue"
          description={`${rows.length} of ${logs.length} returns · AI-drafted listing corrections ready to ship`} />
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, SKU or feedback…" aria-label="Search returns"
              className="h-9 w-full rounded-md border border-border bg-surface-sunken pl-9 pr-3 text-sm text-foreground placeholder:text-subtle focus:border-primary focus:outline-none" />
          </div>
          <SegmentedControl aria-label="Status" value={status} onChange={setStatus}
            options={[{ value: "open", label: "Open" }, { value: "done", label: "Shipped" }, { value: "all", label: "All" }]} />
          <SegmentedControl aria-label="Priority" value={priority} onChange={setPriority}
            options={[{ value: "all", label: "Any" }, { value: "P1", label: "P1" }, { value: "P2", label: "P2" }, { value: "P3", label: "P3" }]} />
          {activeCategory && (
            <Badge variant="primary" className="py-1">
              {activeCategory}
              <button type="button" aria-label="Clear reason filter" onClick={() => onCategoryChange(null)} className="ml-1 rounded-full hover:text-foreground"><X className="h-3 w-3" /></button>
            </Badge>
          )}
        </div>
      </div>
      <div className="divide-y divide-border border-t border-border">
        {rows.length === 0 && <div className="py-14 text-center text-sm text-muted">Nothing matches — try clearing a filter.</div>}
        {rows.map((l) => {
          const done = l.status !== "Pending";
          return (
            <div key={l.id} className={cn("group grid gap-4 px-6 py-4 transition-colors hover:bg-surface-raised/50 md:grid-cols-12 md:items-center", done && "opacity-70")}>
              <button type="button" onClick={() => onOpenInspector(l)} className="text-left md:col-span-4 focus-visible:outline-none">
                <div className="flex items-center gap-2"><Badge variant={PRIORITY_TONE[l.priority]}>{l.priority}</Badge><ChannelBadge channel={l.marketplace} /><span className="text-[11px] text-subtle">{l.timestamp}</span></div>
                <div className="mt-1.5 text-sm font-medium text-foreground group-hover:text-primary">{l.productName}</div>
                <div className="mt-0.5 line-clamp-1 text-xs text-muted">“{l.customerFeedback}”</div>
              </button>
              <div className="md:col-span-5">
                <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: CATEGORY_META[l.category].color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: CATEGORY_META[l.category].color }} />{l.category}
                  <span className="ml-auto font-mono text-subtle">{Math.round(l.confidenceScore * 100)}% sure</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-foreground/80">{l.suggestedFix}</p>
              </div>
              <div className="flex items-center justify-end gap-1.5 md:col-span-3">
                {done ? (
                  <Badge variant={l.status === "Dismissed" ? "neutral" : "success"}>
                    {l.status === "Dismissed" ? "Dismissed" : <><Check className="h-3 w-3" />{l.ticketIdentifier}</>}
                  </Badge>
                ) : (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => onPushTicket(l.id, "linear")}>Linear</Button>
                    <Button size="sm" variant="secondary" onClick={() => onPushTicket(l.id, "jira")}>Jira</Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" aria-label={`Dismiss ${l.id}`} onClick={() => onDismiss(l.id)}><X className="h-4 w-4" /></Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------------- RemediationDrawer ---------------- */
export interface RemediationDrawerProps {
  log: ReturnLog;
  onClose: () => void;
  onApproveAndPush: (id: string, target: "linear" | "jira", customFix?: string) => void;
}
export function RemediationDrawer({ log, onClose, onApproveAndPush }: RemediationDrawerProps) {
  const [fix, setFix] = React.useState(log.suggestedFix);
  const [tab, setTab] = React.useState<"editor" | "linear" | "jira">("editor");
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const payload = tab === "linear" ? buildLinearGraphQLPayload(log, fix) : tab === "jira" ? buildJiraAdfPayload(log, fix) : null;
  const payloadText = payload ? JSON.stringify(payload, null, 2) : "";
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
      <aside role="dialog" aria-modal="true" aria-label={`Review ${log.productName}`}
        className="relative flex h-full w-full max-w-xl animate-slide-in flex-col border-l border-border bg-surface shadow-card">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <div className="flex items-center gap-2"><Badge variant={PRIORITY_TONE[log.priority]}>{log.priority}</Badge><ChannelBadge channel={log.marketplace} /><span className="font-mono text-[11px] text-subtle">{log.sku}</span></div>
            <h3 className="mt-2 font-display text-lg font-semibold">{log.productName}</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close panel"><X className="h-4 w-4" /></Button>
        </div>
        <div className="px-5 pt-4">
          <SegmentedControl aria-label="View" value={tab} onChange={setTab}
            options={[{ value: "editor", label: "Edit fix" }, { value: "linear", label: "Linear preview" }, { value: "jira", label: "Jira preview" }]} />
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
          {tab === "editor" ? (
            <>
              <section>
                <h4 className="mb-1.5 text-xs font-medium text-muted">What the customer said</h4>
                <blockquote className="rounded-lg border border-border bg-surface-sunken p-3 italic">“{log.customerFeedback}”</blockquote>
              </section>
              <section>
                <h4 className="mb-1.5 text-xs font-medium text-muted">Current listing copy</h4>
                <p className="rounded-lg border border-danger/25 bg-danger/5 p-3 text-foreground/80 line-through decoration-danger/40">{log.originalListingCopy}</p>
              </section>
              <section>
                <label htmlFor="fix" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted"><Sparkles className="h-3.5 w-3.5 text-primary" />Suggested fix (editable)</label>
                <textarea id="fix" value={fix} onChange={(e) => setFix(e.target.value)} rows={5}
                  className="w-full rounded-lg border border-success/30 bg-success/5 p-3 text-foreground focus:border-success focus:outline-none" />
              </section>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <Card variant="sunken" padding="sm"><div className="text-subtle">Item value</div><div className="mt-1 font-mono">${log.itemValue}</div></Card>
                <Card variant="sunken" padding="sm"><div className="text-subtle">Return cost</div><div className="mt-1 font-mono text-danger">${log.returnCost}</div></Card>
                <Card variant="sunken" padding="sm"><div className="text-subtle">AI confidence</div><div className="mt-1 font-mono text-primary">{Math.round(log.confidenceScore * 100)}%</div></Card>
              </div>
            </>
          ) : (
            <div className="relative">
              <Button variant="secondary" size="sm" className="absolute right-2 top-2"
                onClick={() => { navigator.clipboard?.writeText(payloadText); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? "Copied" : "Copy"}
              </Button>
              <pre className="max-h-[60vh] overflow-auto rounded-lg border border-border bg-surface-sunken p-4 font-mono text-[11px] leading-relaxed text-muted">{payloadText}</pre>
            </div>
          )}
        </div>
        <div className="flex gap-2 border-t border-border p-5">
          <Button className="flex-1" onClick={() => onApproveAndPush(log.id, "linear", fix)} disabled={log.status !== "Pending"}>Approve & send to Linear</Button>
          <Button variant="secondary" className="flex-1" onClick={() => onApproveAndPush(log.id, "jira", fix)} disabled={log.status !== "Pending"}>Send to Jira</Button>
        </div>
      </aside>
    </div>
  );
}

/* ---------------- Toast ---------------- */
export interface ToastProps {
  title: string;
  description: string;
  onClose: () => void;
}
export function Toast({ title, description, onClose }: ToastProps) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div role="status" className="fixed bottom-6 right-6 z-50 flex max-w-sm animate-slide-in items-start gap-3 rounded-xl border border-success/30 bg-surface-raised p-4 shadow-glow">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
      <div className="text-sm"><div className="font-medium">{title}</div><div className="text-xs text-muted">{description}</div></div>
      <button type="button" onClick={onClose} aria-label="Dismiss notification" className="text-subtle hover:text-foreground"><X className="h-4 w-4" /></button>
    </div>
  );
}
