import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Upload, Trash2, Edit } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useGetUsersQuery, useCreateUserMutation, useDeleteUserMutation, useImportUsersMutation, type User } from '@/store/api/usersApi'
import { userFormSchema } from '@/lib/zod-schemas'
import type { z } from 'zod'

type UserFormValues = z.infer<typeof userFormSchema>

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading } = useGetUsersQuery({ search: search || undefined })
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation()
  const [deleteUser] = useDeleteUserMutation()
  const [importUsers] = useImportUsersMutation()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({ resolver: zodResolver(userFormSchema) })

  const onSubmit = async (data: UserFormValues) => {
    const form = new FormData()
    form.append('name', data.name)
    form.append('email', data.email)
    await createUser(form).unwrap()
    reset()
    setShowForm(false)
  }

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    const result = await importUsers(form).unwrap()
    alert(`Import complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`)
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Users</h1>
          <p className="text-white/50">Manage your organization's members</p>
        </div>
        <div className="flex gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/5 transition-colors">
            <Upload className="w-4 h-4" /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
          </label>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-accent to-accent-light text-white text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl border border-white/10 bg-white/5">
          <h2 className="text-white font-semibold mb-4">Add New User</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 items-start">
            <div className="flex-1">
              <input {...register('name')} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50" placeholder="Full name" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div className="flex-1">
              <input type="email" {...register('email')} className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50" placeholder="Email address" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isCreating} className="px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-50">
              {isCreating ? 'Adding...' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm hover:bg-white/5 transition-colors">
              Cancel
            </button>
          </form>
        </motion.div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-accent/50" placeholder="Search users..." />
      </div>

      {isLoading ? (
        <div className="text-white/40 text-center py-16">Loading...</div>
      ) : (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                {['User', 'Email', 'Type', 'Joined', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data?.users?.map(user => (
                <UserRow key={user.id} user={user} onDelete={() => deleteUser(user.id)} />
              ))}
              {!data?.users?.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function UserRow({ user, onDelete }: { user: User; onDelete: () => void }) {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-accent-light text-sm font-semibold shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="text-white text-sm font-medium">{user.name}</div>
        </div>
      </td>
      <td className="px-4 py-3 text-white/60 text-sm">{user.email}</td>
      <td className="px-4 py-3">
        {user.isAdSync ? (
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 border border-blue-500/30 text-blue-300">AD Sync</span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/40">Manual</span>
        )}
      </td>
      <td className="px-4 py-3 text-white/40 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
      <td className="px-4 py-3">
        <button onClick={onDelete} className="text-white/30 hover:text-red-400 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}
