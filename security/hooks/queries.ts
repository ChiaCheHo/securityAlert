import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/utils/client';

export interface FloorData {
  id: number;
  name: string;
  floor: number;
  is_alert: boolean;
}

interface FloorDetailData extends Omit<FloorData, 'is_alert'> {
  floor_plan_url: string;
  pin_type_arr: PinTypeData[];
  pin_arr: PinData[];
}

interface PinTypeData {
  id: number;
  type: string;
  text: {
    abnormal: string;
    normal: string;
  };
}

interface PinData {
  id: number;
  title: string;
  description: string;
  device_name: string;
  pin_type: string;
  is_alert: boolean;
  x: number;
  y: number;
}

export const useGetFloorList = () =>
  useQuery({
    queryKey: ['security-system', 'floor-list'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<FloorData[]>>(`security-system/floor`);
      return res.data.data;
    },
  });

export const useGetFloor = (id?: number) =>
  useQuery({
    queryKey: ['security-system', 'floor', id],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<FloorDetailData>>(`security-system/floor/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
