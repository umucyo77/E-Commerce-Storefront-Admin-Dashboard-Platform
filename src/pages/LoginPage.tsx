import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FormField } from '../components/FormField'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../lib/api'
import {
  type LoginSchema,
  type RegisterSchema,
  loginSchema,
  registerSchema,
} from '../lib/validators'

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const { login, register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from
    ?.pathname

  const loginForm = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    reValidateMode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const registerForm = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    reValidateMode: 'onBlur',
    defaultValues: { fullName: '', email: '', password: '' },
  })

  async function onLogin(values: LoginSchema) {
    try {
      const session = await login(values)
      showToast('Login successful')
      if (session.user.role === 'ADMIN') navigate('/admin')
      else navigate(from ?? '/')
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    }
  }

  async function onRegister(values: RegisterSchema) {
    try {
      await register(values)
      showToast('Account created. Please login.')
      setMode('login')
    } catch (error) {
      showToast(getErrorMessage(error), 'error')
    }
  }

  return (
    <section className="auth-wrap">
      <h1>Access Your Account</h1>
      <p className="muted">
        Users can register and login here. Admin must authenticate with a real backend admin account.
      </p>

      <div className="row">
        <button
          type="button"
          className={`btn ${mode === 'login' ? '' : 'btn-secondary'}`}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`btn ${mode === 'register' ? '' : 'btn-secondary'}`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
      </div>

      {mode === 'login' ? (
        <form className="form" onSubmit={loginForm.handleSubmit(onLogin)}>
          <FormField
            label="Email"
            type="email"
            register={loginForm.register('email')}
            error={loginForm.formState.errors.email}
          />
          <FormField
            label="Password"
            type="password"
            register={loginForm.register('password')}
            error={loginForm.formState.errors.password}
          />
          <button className="btn" type="submit" disabled={loginForm.formState.isSubmitting}>
            {loginForm.formState.isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      ) : (
        <form className="form" onSubmit={registerForm.handleSubmit(onRegister)}>
          <FormField
            label="Full Name"
            register={registerForm.register('fullName')}
            error={registerForm.formState.errors.fullName}
          />
          <FormField
            label="Email"
            type="email"
            register={registerForm.register('email')}
            error={registerForm.formState.errors.email}
          />
          <FormField
            label="Password"
            type="password"
            register={registerForm.register('password')}
            error={registerForm.formState.errors.password}
          />
          <button
            className="btn"
            type="submit"
            disabled={registerForm.formState.isSubmitting}
          >
            {registerForm.formState.isSubmitting
              ? 'Creating account...'
              : 'Create Account'}
          </button>
        </form>
      )}
    </section>
  )
}
