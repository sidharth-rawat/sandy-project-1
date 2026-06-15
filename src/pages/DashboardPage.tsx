import { useState } from "react"
import type { ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coins,
  KeyRound,
  Mail,
  Phone,
  Search,
  TrendingUp,
  X,
} from "lucide-react"

import { logout } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// ─── Mock data ────────────────────────────────────────────────────────────────

const WALLET = {
  balance: 12_500.0,
  equivalentAmount: 1_043_250.0,
  upcomingDividendAmount: 250.0,
  upcomingDividendDate: "12 June 2025",
  numberOfTokens: 100,
  adminRate: 125.0,
}

interface Transaction {
  id: number
  type: "deposit" | "withdrawal"
  amount: number
  referenceNumber: string
  notes: string
}

const TRANSACTIONS: Transaction[] = [
  { id:  1, type: "deposit",    amount: 5_000, referenceNumber: "REF-2025-001", notes: "Initial deposit" },
  { id:  2, type: "withdrawal", amount: 1_000, referenceNumber: "REF-2025-002", notes: "Partial withdrawal" },
  { id:  3, type: "deposit",    amount: 3_000, referenceNumber: "REF-2025-003", notes: "Monthly contribution" },
  { id:  4, type: "withdrawal", amount:   500, referenceNumber: "REF-2025-004", notes: "Service fee" },
  { id:  5, type: "deposit",    amount: 2_000, referenceNumber: "REF-2025-005", notes: "Dividend reinvestment" },
  { id:  6, type: "withdrawal", amount: 1_500, referenceNumber: "REF-2025-006", notes: "Emergency withdrawal" },
  { id:  7, type: "deposit",    amount: 8_000, referenceNumber: "REF-2025-007", notes: "Bonus deposit" },
  { id:  8, type: "withdrawal", amount:   250, referenceNumber: "REF-2025-008", notes: "Admin fee" },
  { id:  9, type: "deposit",    amount: 4_500, referenceNumber: "REF-2025-009", notes: "Quarterly top-up" },
  { id: 10, type: "withdrawal", amount:   750, referenceNumber: "REF-2025-010", notes: "Platform fee" },
  { id: 11, type: "deposit",    amount: 6_200, referenceNumber: "REF-2025-011", notes: "Wire transfer" },
  { id: 12, type: "withdrawal", amount: 2_300, referenceNumber: "REF-2025-012", notes: "Scheduled payout" },
]

const USER = {
  name: "Demo",
  email: "Demo@example.com",
  contactNo: "+91 (123) 456-789",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function usd(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Wallet Card ──────────────────────────────────────────────────────────────

function StatCell({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 px-5 py-4">
      <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest">
        {icon}
        {label}
      </div>
      <p className="font-mono text-sm font-semibold tabular-nums">{value}</p>
      {sub && (
        <p className="text-muted-foreground font-mono text-xs tabular-nums">{sub}</p>
      )}
    </div>
  )
}

function WalletCard() {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      {/* Hero gradient */}
      <div className="bg-primary relative overflow-hidden px-6 pt-7 pb-7">
        {/* Decorative rings */}
        <div className="bg-primary-foreground/[0.06] absolute -top-10 -right-10 h-40 w-40 rounded-full" />
        <div className="bg-primary-foreground/[0.04] absolute -bottom-14 right-6 h-32 w-32 rounded-full" />
        <div className="bg-primary-foreground/[0.03] absolute top-2 right-24 h-16 w-16 rounded-full" />

        <div className="relative">
          <p className="text-primary-foreground/55 text-[10px] font-semibold uppercase tracking-widest">
            Wallet Balance
          </p>
          <p className="text-primary-foreground mt-2 font-mono text-[2.5rem] font-bold tabular-nums leading-none tracking-tight">
            ${usd(WALLET.balance)}
          </p>
          <p className="text-primary-foreground/45 mt-2 font-mono text-sm tabular-nums">
            ≈&nbsp;₹{WALLET.equivalentAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 divide-x border-t">
        <StatCell
          icon={<Coins className="size-3" />}
          label="Tokens"
          value={String(WALLET.numberOfTokens)}
        />
        <StatCell
          icon={<TrendingUp className="size-3" />}
          label="Token Rate"
          value={`$${usd(WALLET.adminRate)}`}
          // sub={`× ${WALLET.numberOfTokens} = $${usd(tokenValue)}`}
        />
        <StatCell
          icon={<CalendarDays className="size-3" />}
          label="Dividend"
          value={`$${usd(WALLET.upcomingDividendAmount)}`}
          
        />
        <StatCell
          icon={<CalendarDays className="size-3" />}
          label="Dividend Date"
          value={WALLET.upcomingDividendDate}
          // sub={WALLET.upcomingDividendDate}
        />
      </div>
      
    </Card>
  )
}

// ─── Transaction History ──────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: Transaction }) {
  const isDeposit = tx.type === "deposit"

  return (
    <div className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40">
      {/* Icon */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isDeposit
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        )}
      >
        {isDeposit
          ? <ArrowDownToLine className="size-3.5" />
          : <ArrowUpFromLine className="size-3.5" />
        }
      </div>

      {/* Type */}
      <span className="w-20 shrink-0 text-sm font-medium capitalize">{tx.type}</span>

      {/* Amount */}
      <span
        className={cn(
          "w-24 shrink-0 font-mono text-sm font-semibold tabular-nums",
          isDeposit
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-rose-600 dark:text-rose-400"
        )}
      >
        {isDeposit ? "+" : "−"}${tx.amount.toLocaleString()}
      </span>

      {/* Reference */}
      <span className="text-muted-foreground w-32 shrink-0 font-mono text-xs">
        {tx.referenceNumber}
      </span>

      {/* Notes */}
      <span className="text-muted-foreground truncate text-xs">{tx.notes}</span>
    </div>
  )
}

type FilterType = "all" | "deposit" | "withdrawal"

const PAGE_SIZE_OPTIONS = [5, 10, 25] as const

function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | "…")[] = [1]
  if (current > 3) pages.push("…")
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push("…")
  pages.push(total)
  return pages
}

function TransactionList() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<FilterType>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)

  const counts: Record<FilterType, number> = {
    all: TRANSACTIONS.length,
    deposit: TRANSACTIONS.filter((t) => t.type === "deposit").length,
    withdrawal: TRANSACTIONS.filter((t) => t.type === "withdrawal").length,
  }

  const filtered = TRANSACTIONS.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      tx.type.includes(q) ||
      String(tx.amount).includes(q) ||
      tx.referenceNumber.toLowerCase().includes(q) ||
      tx.notes.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleFilter(value: FilterType) {
    setFilter(value)
    setPage(1)
  }

  function handlePageSize(value: number) {
    setPageSize(value)
    setPage(1)
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      {/* ── Toolbar ── */}
      <div className="space-y-2.5 border-b p-3">
        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search by type, amount, reference, notes…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="h-8 pl-8 pr-8 text-sm"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="text-muted-foreground hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5">
          {(["all", "deposit", "withdrawal"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                filter === f
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {f}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                  filter === f ? "bg-background/20 text-background" : "bg-muted"
                )}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Column headers ── */}
      <div className="bg-muted/40 flex items-center gap-4 border-b px-4 py-2.5">
        <span className="w-8 shrink-0" />
        <span className="text-muted-foreground w-20 shrink-0 text-[10px] font-semibold uppercase tracking-widest">
          Type
        </span>
        <span className="text-muted-foreground w-24 shrink-0 text-[10px] font-semibold uppercase tracking-widest">
          Amount
        </span>
        <span className="text-muted-foreground w-32 shrink-0 text-[10px] font-semibold uppercase tracking-widest">
          Reference
        </span>
        <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">
          Notes
        </span>
      </div>

      {/* ── Rows / empty state ── */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <Search className="text-muted-foreground/30 mb-3 size-8" />
          <p className="text-muted-foreground text-sm">No matching transactions.</p>
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="text-muted-foreground hover:text-foreground mt-1.5 text-xs underline underline-offset-2 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y">
          {paginated.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </div>
      )}

      {/* ── Pagination footer ── */}
      <div className="bg-muted/20 flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
        {/* Result count */}
        <p className="text-muted-foreground text-xs tabular-nums">
          {filtered.length === 0
            ? "No results"
            : `${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length}`}
        </p>

        {/* Page controls */}
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30 flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:pointer-events-none"
            aria-label="Previous page"
          >
            <ChevronLeft className="size-3.5" />
          </button>

          {/* Page numbers */}
          {getPageNumbers(currentPage, totalPages).map((n, i) =>
            n === "…" ? (
              <span
                key={`ellipsis-${i}`}
                className="text-muted-foreground flex h-7 w-7 items-center justify-center text-xs"
              >
                …
              </span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium tabular-nums transition-colors",
                  currentPage === n
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {n}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="text-muted-foreground hover:text-foreground disabled:opacity-30 flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:pointer-events-none"
            aria-label="Next page"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        {/* Rows per page */}
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs">Rows</span>
          <div className="flex gap-1">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                onClick={() => handlePageSize(size)}
                className={cn(
                  "flex h-6 min-w-[1.75rem] items-center justify-center rounded px-1.5 text-[11px] font-medium tabular-nums transition-colors",
                  pageSize === size
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─── Profile Card ─────────────────────────────────────────────────────────────

function ProfileCard() {
  const initials = USER.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card>
      <CardContent className="pt-5">
        {/* Avatar + name */}
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{USER.name}</p>
            <p className="text-muted-foreground truncate text-xs">{USER.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2.5 border-t pt-4">
          <div className="flex items-center gap-2.5">
            <Mail className="text-muted-foreground size-3.5 shrink-0" />
            <span className="text-muted-foreground truncate text-xs">{USER.email}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone className="text-muted-foreground size-3.5 shrink-0" />
            <span className="text-muted-foreground text-xs">{USER.contactNo}</span>
          </div>
        </div>

        <div className="mt-4 border-t pt-3.5">
          <button className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs transition-colors">
            <KeyRound className="size-3.5 shrink-0" />
            Change Password
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Amount Modal ─────────────────────────────────────────────────────────────

type ModalAction = "deposit" | "withdraw"

function AmountModal({ action, onClose }: { action: ModalAction; onClose: () => void }) {
  const [amount, setAmount] = useState("")
  const isDeposit = action === "deposit"

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: wire up real submission
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <Card className="relative z-10 w-full max-w-sm gap-0 overflow-hidden py-0">
        {/* Accent stripe */}
        <div
          className={cn(
            "h-1 w-full",
            isDeposit ? "bg-emerald-500" : "bg-rose-500"
          )}
        />

        <CardHeader className="border-b pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full",
                isDeposit
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              )}
            >
              {isDeposit
                ? <ArrowDownToLine className="size-3.5" />
                : <ArrowUpFromLine className="size-3.5" />
              }
            </div>
            <CardTitle className="capitalize">{action}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-5 pb-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="modal-amount">Amount</Label>
              <Input
                id="modal-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!amount || Number(amount) <= 0}
              >
                Submit
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const navigate = useNavigate()
  const [modal, setModal] = useState<ModalAction | null>(null)

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-6 py-3">
        <span className="text-lg font-semibold tracking-tight">Sandy</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Left: wallet + transactions */}
          <div className="space-y-5 lg:col-span-2">
            <WalletCard />

            <div>
              <p className="text-muted-foreground mb-2.5 text-[10px] font-semibold uppercase tracking-widest">
                Transaction History
              </p>
              <TransactionList />
            </div>
          </div>

          {/* Right: actions + profile */}
          <div className="space-y-4">
            {/* Action buttons */}
            <div className="space-y-2.5">
              <Button
                className="w-full gap-2"
                onClick={() => setModal("deposit")}
              >
                <ArrowDownToLine className="size-4" />
                Deposit
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setModal("withdraw")}
              >
                <ArrowUpFromLine className="size-4" />
                Withdraw
              </Button>
            </div>

            <ProfileCard />
          </div>
        </div>
      </main>

      {modal && <AmountModal action={modal} onClose={() => setModal(null)} />}
    </div>
  )
}
