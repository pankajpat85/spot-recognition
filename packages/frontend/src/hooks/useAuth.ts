import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser, selectCurrentOrg, selectIsAuthenticated, logout } from '@/store/features/authSlice'
import { useLogoutMutation } from '@/store/api/authApi'

export function useAuth() {
  const user = useSelector(selectCurrentUser)
  const org = useSelector(selectCurrentOrg)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const dispatch = useDispatch()
  const [logoutMutation] = useLogoutMutation()

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem('sr_refresh')
      if (refreshToken) await logoutMutation({ refreshToken })
    } finally {
      dispatch(logout())
    }
  }

  return { user, org, isAuthenticated, signOut }
}
