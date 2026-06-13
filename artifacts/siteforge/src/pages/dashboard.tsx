import { useGetDashboardMetrics, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, FileText, Users2, TrendingUp, ArrowRight, Zap, BarChart2,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

const statCards = [
  {
    key: "leadsFound" as const,
    label: "Leads Found",
    sub: "Total in pipeline",
    icon: Search,
    iconBg: "bg-indigo-900/60",
    iconColor: "text-indigo-400",
  },
  {
    key: "proposalsGenerated" as const,
    label: "Proposals Sent",
    sub: "AI-generated",
    icon: FileText,
    iconBg: "bg-purple-900/60",
    iconColor: "text-purple-400",
  },
  {
    key: "clientsWon" as const,
    label: "Clients Won",
    sub: "Active clients",
    icon: Users2,
    iconBg: "bg-emerald-900/60",
    iconColor: "text-emerald-400",
  },
  {
    key: "conversionRate" as const,
    label: "Conversion Rate",
    sub: "Lead to client",
    icon: TrendingUp,
    iconBg: "bg-orange-900/60",
    iconColor: "text-orange-400",
    suffix: "%",
  },
];

const quickActions = [
  {
    href: "/discovery",
    label: "Find New Leads",
    sub: "Search businesses in any city",
    icon: Search,
    iconBg: "bg-indigo-900",
    iconColor: "text-indigo-400",
  },
  {
    href: "/scanner",
    label: "Scan a Website",
    sub: "Analyze any business URL",
    icon: BarChart2,
    iconBg: "bg-blue-900",
    iconColor: "text-blue-400",
  },
  {
    href: "/generator",
    label: "Create Proposal",
    sub: "Generate an AI proposal",
    icon: FileText,
    iconBg: "bg-emerald-900",
    iconColor: "text-emerald-400",
  },
];

export default function Dashboard() {
  const { data: metrics, isLoading } = useGetDashboardMetrics();
  const { data: me } = useGetMe();

  const firstName = me?.name?.split(" ")[0] || "Owner";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
        <div className="grid gap-4 grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse h-32">
              <CardContent className="p-4">
                <div className="h-4 w-20 bg-muted rounded mb-3" />
                <div className="h-8 w-12 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const metricValues: Record<string, number> = {
    leadsFound: metrics.leadsFound,
    proposalsGenerated: metrics.proposalsGenerated,
    clientsWon: metrics.clientsWon,
    conversionRate: metrics.conversionRate,
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Upgrade banner */}
      <Card className="border-indigo-500/30 bg-indigo-950/40">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600/30 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug">Start your subscription to unlock all features</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              Business discovery, scanning, AI generation, and proposals
            </p>
          </div>
          <Button
            size="sm"
            className="shrink-0 h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 rounded-xl"
            asChild
          >
            <Link href="/settings">
              Upgrade Now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card) => (
          <Card key={card.key} className="border-white/8 bg-card/80">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-muted-foreground leading-snug">{card.label}</p>
                <div className={`h-9 w-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                  <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="text-3xl font-bold leading-none">
                {metricValues[card.key]}{card.suffix ?? ""}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="space-y-3">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="border-white/8 bg-card/80 hover:border-primary/40 transition-all cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-11 w-11 rounded-xl ${action.iconBg} flex items-center justify-center shrink-0`}>
                  <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.sub}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Leads */}
      <Card className="border-white/8 bg-card/80">
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Leads</CardTitle>
          <Link href="/crm" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {metrics.recentLeads.length === 0 ? (
            <div className="text-center py-8">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No leads yet. Start discovering businesses!</p>
              <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl" asChild>
                <Link href="/discovery">Find Leads</Link>
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {metrics.recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/3">
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm truncate">{lead.businessName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {[lead.city, lead.businessType].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize text-xs shrink-0 ml-2">
                      {lead.crmStage.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Recent Proposals */}
      <Card className="border-white/8 bg-card/80">
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Proposals</CardTitle>
          <Link href="/proposals" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {metrics.recentProposals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No proposals yet. Scan a website to get started!</p>
              <Button size="sm" variant="outline" className="h-8 text-xs rounded-xl" asChild>
                <Link href="/scanner">Scan Website</Link>
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {metrics.recentProposals.map((proposal) => (
                  <div key={proposal.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/3">
                    <div className="overflow-hidden">
                      <p className="font-medium text-sm truncate">{proposal.businessName || proposal.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(proposal.createdAt), "MMM d, yyyy")}
                        {proposal.pricingMonthly ? ` · €${proposal.pricingMonthly}/mo` : ""}
                      </p>
                    </div>
                    <Badge
                      variant={proposal.status === "accepted" ? "default" : proposal.status === "rejected" ? "destructive" : "secondary"}
                      className="capitalize text-xs shrink-0 ml-2"
                    >
                      {proposal.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
