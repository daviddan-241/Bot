import { useState } from "react";
import { useSearchBusinesses, useCreateLead } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Search, Loader2, MapPin, Globe, Phone, CheckCircle2, BookmarkPlus,
  MessageCircle, Instagram, Facebook, ExternalLink, Copy, ChevronDown, ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const searchSchema = z.object({
  query: z.string().min(2, "Query must be at least 2 characters"),
  city: z.string().min(2, "City is required"),
  country: z.string().optional(),
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
        `Hi! I noticed ${business.businessName} doesn't have a website. I'd love to help you get online!`;
      window.open(
        `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      toast({
        title: "No phone number",
        description: "This business doesn't have a phone number listed.",
        variant: "destructive",
      });
    }
  };

  const copyMessage = () => {
    if (business.whatsappMessage) {
      navigator.clipboard.writeText(business.whatsappMessage);
      toast({ title: "Message copied!", description: "Paste it into WhatsApp or any messaging app." });
    }
  };

  const scoreColor =
    business.leadScore >= 70 ? "default" : business.leadScore >= 40 ? "secondary" : "outline";

  return (
    <Card className="flex flex-col h-full border-border hover:border-primary/50 transition-all hover:shadow-md hover:shadow-primary/10">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-2 leading-tight">{business.businessName}</CardTitle>
            <CardDescription className="capitalize text-xs mt-1">{business.businessType}</CardDescription>
          </div>
          <Badge variant={scoreColor} className="shrink-0 text-xs">
            {business.leadScore}pts
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2 pb-3 text-sm">
        {business.address && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="line-clamp-2 text-xs">{business.address}</span>
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
            <span className="text-xs font-medium">No website — HIGH OPPORTUNITY</span>
          </div>
        )}

        {business.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">{business.phone}</span>
          </div>
        )}

        {/* One-tap contact buttons */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Button
            size="sm"
            className="h-7 px-2.5 text-xs bg-green-600 hover:bg-green-700 text-white gap-1.5"
            onClick={handleWhatsApp}
            title="Open WhatsApp with pre-filled pitch message"
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
                  className="h-7 px-2.5 text-xs gap-1.5 border-pink-500/40 text-pink-400 hover:bg-pink-500/10"
                  onClick={() => window.open(business.instagramUrl!, "_blank", "noopener,noreferrer")}
                >
                  <Instagram className="h-3.5 w-3.5" />
                  IG
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Instagram</TooltipContent>
            </Tooltip>
          )}

          {business.facebookUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs gap-1.5 border-blue-500/40 text-blue-400 hover:bg-blue-500/10"
                  onClick={() => window.open(business.facebookUrl!, "_blank", "noopener,noreferrer")}
                >
                  <Facebook className="h-3.5 w-3.5" />
                  FB
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open Facebook</TooltipContent>
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
              <TooltipContent>View on Maps</TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Pre-filled pitch message preview */}
        {business.whatsappMessage && (
          <div>
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowMessage((m) => !m)}
            >
              {showMessage ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showMessage ? "Hide" : "Preview"} pitch message
            </button>
            {showMessage && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground leading-relaxed relative pr-7">
                {business.whatsappMessage}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 absolute top-1 right-1 hover:bg-muted"
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

export default function Discovery() {
  const { toast } = useToast();
  const searchBusinesses = useSearchBusinesses();
  const createLead = useCreateLead();
  const [savedLeads, setSavedLeads] = useState<Set<string>>(new Set());

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { query: "", city: "", country: "" },
  });

  const onSubmit = (values: z.infer<typeof searchSchema>) => {
    searchBusinesses.mutate({ data: values });
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
          toast({ title: "Error saving lead", description: error.message, variant: "destructive" });
        },
      },
    );
  };

  const results = searchBusinesses.data ?? [];
  const noWebsite = results.filter((b) => !b.hasWebsite);
  const hasWebsite = results.filter((b) => b.hasWebsite);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-8 w-8 text-primary" /> Discovery Engine
        </h1>
        <p className="text-muted-foreground mt-1">
          Find local businesses that need your services — then contact them instantly with one tap.
        </p>
      </div>

      <Card className="border-primary/20 bg-card shadow-md">
        <CardContent className="pt-5">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-wrap gap-3 items-end"
            >
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[200px]">
                    <FormLabel>Business Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Plumbers, Restaurants, Gyms..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <Button type="submit" disabled={searchBusinesses.isPending} className="mb-0.5">
                {searchBusinesses.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchBusinesses.isPending && (
        <div className="flex items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Scanning OpenStreetMap...</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h2 className="text-xl font-semibold">{results.length} businesses found</h2>
            <div className="flex gap-2">
              {noWebsite.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  🔥 {noWebsite.length} without website
                </Badge>
              )}
              {hasWebsite.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {hasWebsite.length} have websites
                </Badge>
              )}
            </div>
          </div>

          {noWebsite.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-destructive uppercase tracking-wide">
                🎯 No Website — Prime Targets ({noWebsite.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {noWebsite.map((business, i) => (
                  <BusinessCard
                    key={business.placeId || `nw-${i}`}
                    business={business as BusinessResult}
                    onSave={handleSaveLead}
                    isSaved={!!(business.placeId && savedLeads.has(business.placeId))}
                    isSaving={createLead.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {hasWebsite.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                🌐 Have a Website ({hasWebsite.length})
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {hasWebsite.map((business, i) => (
                  <BusinessCard
                    key={business.placeId || `hw-${i}`}
                    business={business as BusinessResult}
                    onSave={handleSaveLead}
                    isSaved={!!(business.placeId && savedLeads.has(business.placeId))}
                    isSaving={createLead.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!searchBusinesses.isPending && searchBusinesses.isSuccess && results.length === 0 && (
        <div className="text-center py-16 border rounded-lg bg-card/50">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No results found</h3>
          <p className="text-muted-foreground mt-1">Try a different city or business type.</p>
        </div>
      )}
    </div>
  );
}
