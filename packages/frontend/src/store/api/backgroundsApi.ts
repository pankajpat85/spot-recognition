import { baseApi } from './baseApi'

export interface Background {
  id: string
  name: string
  imageUrl: string
  isDefault: boolean
  orgId: string
}

export const backgroundsApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getBackgrounds: builder.query<Background[], void>({
      query: () => '/backgrounds',
      providesTags: ['Background'],
    }),
    createBackground: builder.mutation<Background, FormData>({
      query: body => ({ url: '/backgrounds', method: 'POST', body }),
      invalidatesTags: ['Background'],
    }),
    deleteBackground: builder.mutation<void, string>({
      query: id => ({ url: `/backgrounds/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Background'],
    }),
  }),
})

export const { useGetBackgroundsQuery, useCreateBackgroundMutation, useDeleteBackgroundMutation } = backgroundsApi
