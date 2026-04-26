import { baseApi } from './baseApi'

export const orgApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getOrg: builder.query<{ id: string; name: string; slug: string; logoUrl: string | null; fromEmail: string | null; fromName: string | null; plan: string; hasSmtpConfig: boolean }, void>({
      query: () => '/org',
      providesTags: ['Org'],
    }),
    updateOrg: builder.mutation({
      query: (body: FormData) => ({ url: '/org', method: 'PUT', body }),
      invalidatesTags: ['Org'],
    }),
    updateSmtp: builder.mutation({
      query: body => ({ url: '/org/smtp', method: 'PUT', body }),
      invalidatesTags: ['Org'],
    }),
    testSmtp: builder.mutation<void, void>({
      query: () => ({ url: '/org/smtp/test', method: 'POST' }),
    }),
  }),
})

export const { useGetOrgQuery, useUpdateOrgMutation, useUpdateSmtpMutation, useTestSmtpMutation } = orgApi
