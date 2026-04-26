import { baseApi } from './baseApi'
import { setCredentials } from '../features/authSlice'

export const authApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    register: builder.mutation({
      query: body => ({ url: '/auth/register', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled
        dispatch(setCredentials(data))
      },
    }),
    login: builder.mutation({
      query: body => ({ url: '/auth/login', method: 'POST', body }),
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        const { data } = await queryFulfilled
        dispatch(setCredentials(data))
      },
    }),
    logout: builder.mutation({
      query: body => ({ url: '/auth/logout', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation({
      query: body => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation({
      query: body => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
  }),
})

export const { useRegisterMutation, useLoginMutation, useLogoutMutation, useForgotPasswordMutation, useResetPasswordMutation, useGetMeQuery } = authApi
