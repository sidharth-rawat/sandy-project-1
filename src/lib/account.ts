import { api } from "@/lib/api"

export type Wallet = {
  tokenCount: number
  tokenPrice: number
  walletBalance: number
  equivalentAmount: number
  dividendPercentage: number
  upcomingDividendAmount: number
  upcomingDividendDate: string | null
}

export type PublicSettings = {
  tokenPrice: number
  withdrawalFee: number
  withdrawalFeeType: "FLAT" | "PERCENT"
  minimumTokenDeposit: number
  minimumTokenWithdrawal: number
  defaultDividendPercentage: number
  upcomingDividendDate: string | null
}

export type Transaction = {
  _id: string
  type: "DEPOSIT" | "WITHDRAWAL" | "SEND"
  amount: number
  tokens: number
  fee: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  remark?: string
  comments?: string
  createdAt: string
}

export function getWallet(): Promise<Wallet> {
  return api<Wallet>("/wallet")
}

export async function getSettings(): Promise<PublicSettings> {
  const data = await api<{ settings: PublicSettings }>("/settings")
  return data.settings
}

export async function getTransactions(): Promise<Transaction[]> {
  const data = await api<{ transactions: Transaction[] }>("/transactions")
  return data.transactions
}

export async function createDeposit(tokens: number, remark?: string): Promise<Transaction> {
  const data = await api<{ transaction: Transaction }>("/deposit", {
    method: "POST",
    body: { tokens, remark },
  })
  return data.transaction
}

export async function createWithdrawal(tokens: number, remark?: string): Promise<Transaction> {
  const data = await api<{ transaction: Transaction }>("/withdrawal", {
    method: "POST",
    body: { tokens, remark },
  })
  return data.transaction
}
