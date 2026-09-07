import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/common/form-field'
import { Brand } from '@/components/layout/brand'
import { DEMO_USERS, useAuthStore } from '@/stores/auth-store'
import { organizationInfo } from '@/features/projects/data/projects'

export function SignInPage() {
  const navigate = useNavigate()
  const signIn = useAuthStore((s) => s.signIn)
  const [email, setEmail] = useState(DEMO_USERS[0].email)
  const [password, setPassword] = useState('demo1234')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const user = signIn(email)
    if (!user) {
      toast.error('Unknown account. Use one of the demo accounts listed below.')
      return
    }
    toast.success(`Welcome back, ${user.name.split(' ').slice(-1)[0]}.`)
    navigate('/dashboard')
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Brand className="mb-8" />
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use a demo account — this prototype has no backend.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <FormField id="email" label="Email" required>
              <Input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormField>
            <FormField id="password" label="Password" required hint="Any value works in the prototype.">
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>
            <Button type="submit" className="w-full">
              Sign in <ArrowRight className="size-4" />
            </Button>
          </form>

          <Card className="mt-6 gap-3 py-4">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ShieldCheck className="size-4 text-primary" /> Demo accounts
              </CardTitle>
              <CardDescription className="text-xs">Each maps to a different role and menu set.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 px-4">
              {DEMO_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => setEmail(user.email)}
                  className="flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-left text-xs hover:bg-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{user.email}</span>
                    <span className="block truncate text-muted-foreground">{user.designation}</span>
                  </span>
                  <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-medium capitalize">{user.role}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative hidden bg-primary/5 lg:block">
        <div className="flex h-full flex-col justify-center px-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">Government of Bangladesh</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance">{organizationInfo.name}</h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Integrated project, budget, accounting, payroll, asset and correspondence management for development
            projects under {organizationInfo.ministry}.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-6">
            {[
              ['11', 'Functional modules'],
              ['5', 'Projects tracked'],
              ['64', 'Districts covered'],
              ['412', 'Active employees'],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-2xl font-semibold tabular-nums">{value}</dt>
                <dd className="text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
