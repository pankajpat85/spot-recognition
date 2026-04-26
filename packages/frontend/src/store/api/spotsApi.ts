import { baseApi } from './baseApi'

export interface SpotWinner {
  id: string
  userId: string | null
  freeTextName: string | null
  freeTextEmail: string | null
  user: { id: string; name: string; email: string; photoUrl: string | null } | null
}

export interface Spot {
  id: string
  orgId: string
  description: string
  startDate: string
  endDate: string
  imageUrl: string | null
  sentAt: string | null
  createdAt: string
  winners: SpotWinner[]
  senders: SpotWinner[]
  badges: { id: string; badgeValue: string }[]
  background: { id: string; name: string; imageUrl: string } | null
}

export const spotsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getSpots: builder.query<{ spots: Spot[]; total: number; pages: number }, Record<string, string | number | undefined>>({
      query: params => ({ url: '/spots', params }),
      providesTags: ['Spot'],
    }),
    getSpot: builder.query<Spot, string>({
      query: id => `/spots/${id}`,
      providesTags: ['Spot'],
    }),
    createSpot: builder.mutation<Spot, unknown>({
      query: body => ({ url: '/spots', method: 'POST', body }),
      invalidatesTags: ['Spot'],
    }),
    deleteSpot: builder.mutation<void, string>({
      query: id => ({ url: `/spots/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Spot'],
    }),
    uploadSpotImage: builder.mutation<{ imageUrl: string }, { id: string; form: FormData }>({
      query: ({ id, form }) => ({ url: `/spots/${id}/image`, method: 'POST', body: form }),
      invalidatesTags: ['Spot'],
    }),
    sendSpot: builder.mutation<void, string>({
      query: id => ({ url: `/spots/${id}/send`, method: 'POST' }),
      invalidatesTags: ['Spot'],
    }),
    getSpotStats: builder.query<{ totalSpots: number; sentThisMonth: number; recentSpots: Spot[] }, void>({
      query: () => '/spots/stats',
      providesTags: ['Spot'],
    }),
  }),
})

export const { useGetSpotsQuery, useGetSpotQuery, useCreateSpotMutation, useDeleteSpotMutation, useUploadSpotImageMutation, useSendSpotMutation, useGetSpotStatsQuery } = spotsApi
