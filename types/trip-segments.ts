export interface TripSegment {
  id: string;
  trip_id: string;
  order_index: number;
  city_place_id: string;
  city_name: string;
  start_date: string;
  end_date: string;
  transport_type: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SegmentInput {
  cityPlaceId: string;
  cityName: string;
  startDate: string;
  endDate: string;
  transportType?: string;
  notes?: string;
}

export interface CreateSegmentPayload {
  cityPlaceId: string;
  cityName: string;
  nights: number;
  transportType?: string;
  notes?: string;
}

export interface UpdateSegmentPayload {
  cityPlaceId?: string;
  cityName?: string;
  startDate?: string;
  endDate?: string;
  transportType?: string;
  notes?: string;
  orderIndex?: number;
}

