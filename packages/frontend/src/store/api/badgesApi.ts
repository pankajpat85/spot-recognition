import { baseApi } from './baseApi'

export interface Badge {
  value: string
  label: string
  imageUrl: string
}

export const badgesApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getBadges: builder.query<Badge[], void>({
      query: () => '/badges',
      providesTags: ['Badge'],
    }),
  }),
})

export const { useGetBadgesQuery } = badgesApi
