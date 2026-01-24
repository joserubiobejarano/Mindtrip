"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Plane, Navigation, DollarSign, Calendar, Home, CheckCircle } from "lucide-react";
import type { CityOverview } from "@/types/itinerary";
import { useLanguage } from "@/components/providers/language-provider";

interface CityOverviewCardsProps {
  cityOverview: CityOverview;
}

export function CityOverviewCards({ cityOverview }: CityOverviewCardsProps) {
  const { t } = useLanguage();
  const BORDER_COLOR = '#7b2b04';
  const ICON_BG = '#ffedd5';

  const cards = [
    {
      key: 'gettingThere',
      title: t('city_overview_getting_there'),
      icon: Plane,
      data: cityOverview.gettingThere,
      renderContent: (data: NonNullable<CityOverview['gettingThere']>) => {
        const items = [
          data.airports?.length ? { label: t('city_overview_main_airports'), value: data.airports.join(', ') } : null,
          data.distanceToCity ? { label: t('city_overview_distance_to_city'), value: data.distanceToCity } : null,
          data.transferOptions?.length ? { label: t('city_overview_transfer_options'), value: data.transferOptions.join(', ') } : null,
        ].filter(Boolean) as { label: string; value: string }[];
        return (
          <div className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{item.label}</span>
                <p className="text-sm text-slate-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: 'gettingAround',
      title: t('city_overview_getting_around'),
      icon: Navigation,
      data: cityOverview.gettingAround,
      renderContent: (data: NonNullable<CityOverview['gettingAround']>) => {
        const items = [
          data.publicTransport ? { label: t('city_overview_public_transport'), value: data.publicTransport } : null,
          data.walkability ? { label: t('city_overview_walkability'), value: data.walkability } : null,
          data.taxiRideshare ? { label: t('city_overview_taxi_rideshare'), value: data.taxiRideshare } : null,
        ].filter(Boolean) as { label: string; value: string }[];
        return (
          <div className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{item.label}</span>
                <p className="text-sm text-slate-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: 'budgetGuide',
      title: t('city_overview_budget_guide'),
      icon: DollarSign,
      data: cityOverview.budgetGuide,
      renderContent: (data: NonNullable<CityOverview['budgetGuide']>) => {
        const items = [
          data.budgetDaily ? { label: t('city_overview_budget_daily'), value: data.budgetDaily } : null,
          data.midRangeDaily ? { label: t('city_overview_mid_range_daily'), value: data.midRangeDaily } : null,
          data.luxuryDaily ? { label: t('city_overview_luxury_daily'), value: data.luxuryDaily } : null,
          data.transportPass ? { label: t('city_overview_transport_pass'), value: data.transportPass } : null,
        ].filter(Boolean) as { label: string; value: string }[];
        return (
          <div className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{item.label}</span>
                <p className="text-sm text-slate-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: 'bestTimeToVisit',
      title: t('city_overview_best_time_to_visit'),
      icon: Calendar,
      data: cityOverview.bestTimeToVisit,
      renderContent: (data: NonNullable<CityOverview['bestTimeToVisit']>) => {
        const items = [
          data.bestMonths ? { label: t('city_overview_best_months'), value: data.bestMonths } : null,
          data.shoulderSeason ? { label: t('city_overview_shoulder_season'), value: data.shoulderSeason } : null,
          data.peakLowSeason ? { label: t('city_overview_peak_low_season'), value: data.peakLowSeason } : null,
        ].filter(Boolean) as { label: string; value: string }[];
        return (
          <div className="divide-y divide-slate-200">
            {items.map((item, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{item.label}</span>
                <p className="text-sm text-slate-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      key: 'whereToStay',
      title: t('city_overview_where_to_stay'),
      icon: Home,
      data: cityOverview.whereToStay,
      renderContent: (data: NonNullable<CityOverview['whereToStay']>) => (
        <div className="divide-y divide-slate-200">
          {data.map((item, idx) => (
            <div key={idx} className="py-2 first:pt-0 last:pb-0">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{item.neighborhood}</span>
              <p className="text-sm text-slate-900 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'advancePlanning',
      title: t('city_overview_advance_planning'),
      icon: CheckCircle,
      data: cityOverview.advancePlanning,
      renderContent: (data: NonNullable<CityOverview['advancePlanning']>) => {
        const blocks = [
          data.bookEarly?.length ? { label: t('city_overview_book_early'), items: data.bookEarly } : null,
          data.spontaneous?.length ? { label: t('city_overview_can_be_spontaneous'), items: data.spontaneous } : null,
        ].filter(Boolean) as { label: string; items: string[] }[];
        return (
          <div className="divide-y divide-slate-200">
            {blocks.map((block, idx) => (
              <div key={idx} className="py-2 first:pt-0 last:pb-0">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{block.label}</span>
                <ul className="text-sm text-slate-900 mt-1 list-disc list-inside space-y-1">
                  {block.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      },
    },
  ].filter(card => card.data); // Only show cards with data

  if (cards.length === 0) {
    return null; // Don't render anything if no cards have data
  }

  return (
    <div className="mt-8 mb-10 max-w-4xl mx-auto">
      <h3 className="text-xl font-bold text-slate-900 mb-4" style={{ fontFamily: "'Patrick Hand', cursive" }}>
        {t('city_overview_title')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} className="p-4 shadow-sm border-2 border-[#7b2b04]">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 border-[#7b2b04]"
                    style={{ backgroundColor: ICON_BG }}
                  >
                    <Icon className="h-5 w-5" style={{ color: BORDER_COLOR }} />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Patrick Hand', cursive" }}>
                    {card.title}
                  </h4>
                </div>
                {card.renderContent(card.data as any)}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
