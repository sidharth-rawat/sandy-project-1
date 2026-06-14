import * as React from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getProfile, logout, type Profile } from "@/lib/auth"
import { ApiError } from "@/lib/api"
import {
  createDeposit,
  createWithdrawal,
  getSettings,
  getTransactions,
  getWallet,
  type PublicSettings,
  type Transaction,
  type Wallet,
} from "@/lib/account"

function usd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString()
}

const statusStyles: Record<Transaction["status"], string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
}

export function DashboardPage() {
  const navigate = useNavigate()

  const [profile, setProfile] = React.useState<Profile | null>(null)
  const [wallet, setWallet] = React.useState<Wallet | null>(null)
  const [settings, setSettings] = React.useState<PublicSettings | null>(null)
  const [transactions, setTransactions] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    const [w, txns] = await Promise.all([getWallet(), getTransactions()])
    setWallet(w)
    setTransactions(txns)
  }, [])

  React.useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const [p, w, s, txns] = await Promise.all([
          getProfile(),
          getWallet(),
          getSettings(),
          getTransactions(),
        ])
        if (!active) return
        setProfile(p)
        setWallet(w)
        setSettings(s)
        setTransactions(txns)
      } catch (err) {
        if (!active) return
        // A dead session should bounce back to login.
        if (err instanceof ApiError && err.status === 401) {
          navigate("/login", { replace: true })
          return
        }
        setLoadError(err instanceof Error ? err.message : "Failed to load dashboard")
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [navigate])

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-3">
        <span className="text-lg font-semibold">Sandy</span>
        <div className="flex items-center gap-3">
          {profile && (
            <span className="text-sm text-muted-foreground">{profile.name}</span>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        {loading ? (
          <p className="text-muted-foreground">Loading your dashboard…</p>
        ) : loadError ? (
          <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {loadError}
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back{profile ? `, ${profile.name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage your tokens, deposits, and withdrawals.
              </p>
            </div>

            {wallet && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Token Balance" value={wallet.tokenCount.toLocaleString()} />
                <StatCard label="Wallet Value" value={usd(wallet.walletBalance)} />
                <StatCard label="Dividend Rate" value={`${wallet.dividendPercentage}%`} />
                <StatCard
                  label="Next Dividend"
                  value={usd(wallet.upcomingDividendAmount)}
                  sub={formatDate(wallet.upcomingDividendDate)}
                />
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <ActionCard
                title="Deposit Tokens"
                description={
                  settings
                    ? `Minimum ${settings.minimumTokenDeposit} tokens · ${usd(settings.tokenPrice)} each`
                    : "Submit a deposit request"
                }
                actionLabel="Submit Deposit"
                tokenPrice={settings?.tokenPrice ?? wallet?.tokenPrice ?? 1}
                onSubmit={async (tokens, remark) => {
                  await createDeposit(tokens, remark)
                  await refresh()
                }}
              />
              <ActionCard
                title="Withdraw Tokens"
                description={
                  settings
                    ? `Minimum ${settings.minimumTokenWithdrawal} tokens · ${usd(settings.tokenPrice)} each`
                    : "Submit a withdrawal request"
                }
                actionLabel="Submit Withdrawal"
                tokenPrice={settings?.tokenPrice ?? wallet?.tokenPrice ?? 1}
                onSubmit={async (tokens, remark) => {
                  await createWithdrawal(tokens, remark)
                  await refresh()
                }}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Your deposits and withdrawals. Requests stay pending until an
                  admin approves them.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-muted-foreground py-6 text-center text-sm">
                    No transactions yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="py-2 pr-4 font-medium">Date</th>
                          <th className="py-2 pr-4 font-medium">Type</th>
                          <th className="py-2 pr-4 font-medium">Tokens</th>
                          <th className="py-2 pr-4 font-medium">Amount</th>
                          <th className="py-2 pr-4 font-medium">Status</th>
                          <th className="py-2 font-medium">Remark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((t) => (
                          <tr key={t._id} className="border-b last:border-0">
                            <td className="py-2 pr-4">{formatDate(t.createdAt)}</td>
                            <td className="py-2 pr-4">{t.type}</td>
                            <td className="py-2 pr-4 tabular-nums">{t.tokens}</td>
                            <td className="py-2 pr-4 tabular-nums">{usd(t.amount)}</td>
                            <td className="py-2 pr-4">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[t.status]}`}
                              >
                                {t.status}
                              </span>
                            </td>
                            <td className="py-2 text-muted-foreground">
                              {t.remark || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</p>
        {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function ActionCard({
  title,
  description,
  actionLabel,
  tokenPrice,
  onSubmit,
}: {
  title: string
  description: string
  actionLabel: string
  tokenPrice: number
  onSubmit: (tokens: number, remark?: string) => Promise<void>
}) {
  const [tokens, setTokens] = React.useState("")
  const [remark, setRemark] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [message, setMessage] = React.useState<{ ok: boolean; text: string } | null>(null)

  const parsed = Number(tokens)
  const estimate = Number.isFinite(parsed) && parsed > 0 ? parsed * tokenPrice : 0

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setMessage({ ok: false, text: "Enter a positive token amount." })
      return
    }
    setBusy(true)
    try {
      await onSubmit(parsed, remark.trim() || undefined)
      setMessage({ ok: true, text: "Request submitted — pending admin approval." })
      setTokens("")
      setRemark("")
    } catch (err) {
      setMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Request failed.",
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          {message && (
            <p
              className={`rounded-md px-3 py-2 text-sm ${
                message.ok
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {message.text}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor={`${title}-tokens`}>Tokens</Label>
            <Input
              id={`${title}-tokens`}
              type="number"
              min={0}
              step="1"
              placeholder="0"
              value={tokens}
              onChange={(e) => setTokens(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              ≈ {usd(estimate)}
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`${title}-remark`}>Remark (optional)</Label>
            <Input
              id={`${title}-remark`}
              type="text"
              placeholder="Note for this request"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {actionLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
