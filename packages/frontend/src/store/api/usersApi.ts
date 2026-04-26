import { baseApi } from './baseApi'

export const usersApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query<{ users: User[]; total: number; pages: number }, { search?: string; limit?: number; page?: number }>({
      query: params => ({ url: '/users', params }),
      providesTags: ['User'],
    }),
    getUser: builder.query<User, string>({
      query: id => `/users/${id}`,
      providesTags: ['User'],
    }),
    createUser: builder.mutation({
      query: body => ({ url: '/users', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<User, { id: string; data: FormData }>({
      query: ({ id, data }) => ({ url: `/users/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['User'],
    }),
    deleteUser: builder.mutation<void, string>({
      query: id => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    importUsers: builder.mutation({
      query: (file: FormData) => ({ url: '/users/import', method: 'POST', body: file }),
      invalidatesTags: ['User'],
    }),
  }),
})

export interface User {
  id: string
  name: string
  email: string
  photoUrl: string | null
  isAdmin: boolean
  isAdSync: boolean
  orgId: string
  createdAt: string
}

export const { useGetUsersQuery, useGetUserQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, useImportUsersMutation } = usersApi
