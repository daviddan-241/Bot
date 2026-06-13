import { useState, useEffect } from "react";
import {
  useAutoScanArea,
  useCreateLead,
  useGetAutoscanStatus,
  useTriggerAutoscan,
} from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Radar,
  Loader2,
  MapPin,
  Globe,
  Phone,
  BookmarkPlus,
  CheckCircle2,
  Zap,
  Clock,
  Building2,
  MessageCircle,
  Instagram,
  Facebook,
  Copy,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const scanSchema = z.object({
  city: z.string().min(2, "City is required"),
  country: z.string().optional(),
  categories: z.string().optional(),
});

type BusinessResult = {
  businessName: string;
  businessType: string;
  address?: string | null;
  city: string;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  hasWebsite: boolean;
  leadScore: number;
  placeId?: string | null;
  googleMapsUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  whatsappNumber?: string | null;
  whatsappUrl?: string | null;
  whatsappMessage?: string | null;
};

function BusinessCard({
  business,
  onSave,
  isSaved,
  isSaving,
}: {
  business: BusinessResult;
  onSave: (b: BusinessResult) => void;
  isSaved: boolean;
  isSaving: boolean;
}) {
  const { toast } = useToast();
  const [showMessage, setShowMessage] = useState(false);

  const handleWhatsApp = () => {
    if (business.whatsappUrl) {
      window.open(business.whatsappUrl, "_blank", "noopener,noreferrer");
    } else if (business.phone) {
      const digits = business.phone.replace(/\D/g, "");
      const msg =
        business.whatsappMessage ||
        `Hi! I noticed ${business.businessName} doesn't have a website. I can help you get online and attract more customers!`;
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    } else {
      toast({ title: "No phone number", description: "No phone listed for this business.", variant: "destructive" });
    }
  };

  const copyMessage = () => {
    if (business.whatsappMessage) {
      navigator.clipboard.writeText(business.whatsappMessage);
      toast({ title: "Copied!", description: "Paste the pitch into WhatsApp or SMS." });
    }
  };

  const score = business.leadScore;
  const scoreColor = score >= 70 ? "default" : score >= 40 ? "secondary" : "outline";

  return (
    <Card className="flex flex-col h-full border-border hover:border-primary/50 transition-all hover:shadow-md hover:shadow-primary/10">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm line-clamp-2 leading-snug">{business.businessName}</CardTitle>
            <CardDescription className="capitalize text-xs mt-0.5">{business.businessType}</CardDescription>
          </div>
          <Badge variant={scoreColor} className="shrink-0 text-xs">
            {score}pts
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2 pb-3 text-sm">
        {business.address && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-1 text-xs">{business.address}</span>
          </div>
        )}

        {business.website ? (
          <a
            href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <span className="line-clamp-1 text-xs">
              {business.website.replace(/^https?:\/\/(www\.)?/, "")}
            </span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          <div className="flex items-center gap-2 text-destructive">
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-medium">No website</span>
          </div>
        )}

        {/* One-tap contact row */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700 text-white gap-1.5"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </Button>

          {business.phone && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => window.open(`tel:${business.phone}`, "_self")}
            >
              <Phone className="h-3.5 w-3.5" />
              Call
            </Button>
          )}

          {business.instagramUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs border-pink-500/40 text-pink-400 hover:bg-pink-500/10"
                  onClick={() => window.open(business.instagramUrl!, "_blank", "noopener,noreferrer")}
                >
                  <Instagram className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Instagram</TooltipContent>
            </Tooltip>
          )}

          {business.facebookUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 text-xs border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => window.open(business.facebookUrl!, "_blank", "noopener,noreferrer")}
                >
                  <Facebook className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Facebook</TooltipContent>
            </Tooltip>
          )}

          {business.googleMapsUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 w-7 p-0"
                  onClick={() => window.open(business.googleMapsUrl!, "_blank", "noopener,noreferrer")}
                >
                  <MapPin className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Maps</TooltipContent>
            </Tooltip>
          )}
        </div>

        {business.whatsappMessage && (
          <div>
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowMessage((m) => !m)}
            >
              {showMessage ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showMessage ? "Hide" : "Preview"} pitch
            </button>
            {showMessage && (
              <div className="mt-1.5 p-2 bg-muted/50 rounded text-xs text-muted-foreground leading-relaxed relative pr-7">
                {business.whatsappMessage}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 absolute top-1 right-1"
                  onClick={copyMessage}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 border-t bg-muted/10 pb-3">
        <Button
          className="w-full h-8 text-xs"
          variant={isSaved ? "secondary" : "default"}
          disabled={isSaved || isSaving}
          onClick={() => onSave(business)}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-primary" />
              Saved to CRM
            </>
          ) : (
            <>
              <BookmarkPlus className="mr-1.5 h-3.5 w-3.5" />
              Save Lead
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function SchedulerStatus() {
  const { data: status, refetch } = useGetAutoscanStatus({ query: { refetchInterval: 5000 } as never });
  const triggerScan = useTriggerAutoscan();
  const { toast } = useToast();

  const handleTrigger = () => {
    triggerScan.mutate({ data: {} }, {
      onSuccess: () => {
        toast({ title: "AutoScan triggered!", description: "Background scan started across all cities." });
        setTimeout(() => refetch(), 1500);
      },
    });
  };

  if (!status) return null;

  const cityPct = status.totalCities > 0
    ? Math.round((status.citiesScanned / status.totalCities) * 100)
    : 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              {status.isRunning ? (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
              ) : (
                <span className="inline-flex h-3 w-3 rounded-full bg-muted-foreground/40" />
              )}
            </div>
            <CardTitle className="text-base">
              Background Scheduler {status.isRunning ? "— Running" : "— Idle"}
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5 border-primary/40"
            onClick={handleTrigger}
            disabled={status.isRunning || triggerScan.isPending}
          >
            {triggerScan.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <PlayCircle className="h-3.5 w-3.5 text-primary" />
            )}
            Trigger Now
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-background/60 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-primary">{status.leadsCreated}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Leads Created</p>
          </div>
          <div className="bg-background/60 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{status.leadsFound}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Businesses Found</p>
          </div>
          <div className="bg-background/60 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{status.citiesScanned}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cities Scanned</p>
          </div>
          <div className="bg-background/60 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{status.totalCategories}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Categories</p>
          </div>
        </div>

        {status.isRunning && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {status.currentCity ?? "Starting..."} — {status.currentCategory ?? ""}
              </span>
              <span>{cityPct}%</span>
            </div>
            <Progress value={cityPct} className="h-1.5" />
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {status.lastRun && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last run: {new Date(status.lastRun).toLocaleString()}
            </span>
          )}
          {status.nextRun && !status.isRunning && (
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" />
              Next: {new Date(status.nextRun).toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AutoScan() {
  const { toast } = useToast();
  const autoScan = useAutoScanArea();
  const createLead = useCreateLead();
  const [savedLeads, setSavedLeads] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  const form = useForm<z.infer<typeof scanSchema>>({
    resolver: zodResolver(scanSchema),
    defaultValues: { city: "", country: "", categories: "" },
  });

  const onSubmit = (values: z.infer<typeof scanSchema>) => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) { clearInterval(interval); return prev; }
        return prev + 4;
      });
    }, 400);

    const categoriesList = values.categories
      ? values.categories.split(",").map((c) => c.trim()).filter(Boolean)
      : undefined;

    autoScan.mutate(
      { data: { city: values.city, country: values.country, categories: categoriesList } },
      {
        onSuccess: () => { clearInterval(interval); setProgress(100); },
        onError: () => { clearInterval(interval); setProgress(0); },
      },
    );
  };

  const handleSaveLead = (business: BusinessResult) => {
    createLead.mutate(
      {
        data: {
          businessName: business.businessName,
          businessType: business.businessType,
          address: business.address ?? undefined,
          city: business.city,
          country: business.country ?? undefined,
          phone: business.phone ?? undefined,
          email: business.email ?? undefined,
          website: business.website ?? undefined,
          hasWebsite: business.hasWebsite,
          leadScore: business.leadScore,
          placeId: business.placeId ?? undefined,
          googleMapsUrl: business.googleMapsUrl ?? undefined,
          instagramUrl: business.instagramUrl ?? undefined,
          facebookUrl: business.facebookUrl ?? undefined,
          whatsappNumber: business.whatsappNumber ?? undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Lead saved", description: `${business.businessName} added to CRM.` });
          if (business.placeId) setSavedLeads((prev) => new Set(prev).add(business.placeId!));
        },
        onError: (error) => {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        },
      },
    );
  };

  const results = autoScan.data ?? [];
  const noWebsite = results.filter((b) => !b.hasWebsite);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Radar className="h-8 w-8 text-primary" /> AutoScan
        </h1>
        <p className="text-muted-foreground mt-1">
          Global background scanner — automatically finds no-website businesses across 30+ cities every 2 hours.
        </p>
      </div>

      {/* Background Scheduler Status */}
      <SchedulerStatus />

      {/* Manual Scan Panel */}
      <Card className="border-primary/20 bg-card shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Manual Scan</CardTitle>
          <CardDescription>Target a specific city right now — results appear below instantly.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-wrap gap-3 items-end">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[150px]">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Austin, Lagos, Dubai..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="US" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem className="flex-1 min-w-[200px]">
                      <FormLabel>Categories (comma-separated, optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="restaurant, salon, clinic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={autoScan.isPending} className="mb-0.5">
                  {autoScan.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Radar className="mr-2 h-4 w-4" />
                  )}
                  Scan Now
                </Button>
              </div>

              {autoScan.isPending && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="animate-pulse">Scanning businesses...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold">
              <span className="relative inline-flex h-2.5 w-2.5 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              {results.length} businesses found
            </h2>
            {noWebsite.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                🔥 {noWebsite.length} without website
              </Badge>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {results.map((business, i) => (
              <BusinessCard
                key={business.placeId || `b-${i}`}
                business={business as BusinessResult}
                onSave={handleSaveLead}
                isSaved={!!(business.placeId && savedLeads.has(business.placeId))}
                isSaving={createLead.isPending}
              />
            ))}
          </div>

          {results.length === 0 && (
            <div className="text-center py-12 border rounded-lg bg-card/50">
              <Radar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No results</h3>
              <p className="text-muted-foreground mt-1">Try a different city or categories.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
