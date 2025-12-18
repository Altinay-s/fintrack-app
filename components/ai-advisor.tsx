import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { Lightbulb, TrendingUp } from 'lucide-react'

// Define Loan type locally or import from Prisma types
interface Installment {
    id: string
    amount: number | string | any // Handle Decimal
    dueDate: Date
    isPaid: boolean
}

interface Loan {
    id: string
    bankName: string
    totalAmount: number | string | any // Handle Decimal
    interestRate: number | string | any // Handle Decimal
    status: string
    installments: Installment[]
}

interface AIAdvisorProps {
    loans: Loan[]
}

export function AIAdvisor({ loans }: AIAdvisorProps) {
    // Strategy: Avalanche Method (Highest Interest Rate First)
    const activeLoans = loans.filter((loan) => loan.status === 'ACTIVE')

    // Find the active loan with the highest interest rate
    const targetLoan = activeLoans.sort((a, b) => {
        return Number(b.interestRate) - Number(a.interestRate)
    })[0]

    if (!targetLoan) {
        return (
            <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                        <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Finansal Durumunuz Harika!</CardTitle>
                        <CardDescription>
                            Şu anda ödenmesi gereken aktif bir krediniz bulunmuyor.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        )
    }

    // Calculate potential savings (simplified logic for MVP)
    // Assuming if you pay it off now vs full term.
    // Real calculation is complex (remaining principal * rate...), but let's give a catchy estimate.
    // Estimate: Monthly Interest * Remaining Months
    const remainingInstallments = targetLoan.installments.filter(i => !i.isPaid)
    const remainingPrincipal = remainingInstallments.reduce((sum, i) => sum + Number(i.amount), 0)
    // Simple heuristic: 10% of remaining principal as "Potential Savings" if paid early
    // or just show the interest rate impact.
    const potentialSavings = remainingPrincipal * (Number(targetLoan.interestRate) / 100) * (remainingInstallments.length / 12)

    return (
        <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 shadow-sm animate-pulse">
                    <Lightbulb className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-lg text-indigo-700 dark:text-indigo-300">
                        Yapay Zeka Finansal Tavsiyesi
                    </CardTitle>
                    <CardDescription>
                        Finansal sağlığınızı en iyi duruma getirmek için kişiselleştirilmiş öneri.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mt-2 space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        <strong className="text-foreground">Analiz:</strong> Portföyünüzdeki {activeLoans.length} aktif krediyi inceledik.
                        <strong className="text-foreground"> {targetLoan.bankName}</strong> krediniz
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mx-1">
                            %{Number(targetLoan.interestRate)} Faiz
                        </span>
                        ile maliyeti en yüksek olan borcunuz.
                    </p>

                    <div className="rounded-md bg-background/50 p-3 border border-indigo-100 dark:border-indigo-900">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="mt-0.5 h-5 w-5 text-indigo-600" />
                            <div className="text-sm">
                                <span className="font-semibold text-foreground">Öneri:</span> Elinize geçen toplu bir para olursa, öncelikle bu krediyi kapatmalısınız.
                                Bunu yapmak size tahmini olarak <strong className="text-green-600">{formatCurrency(potentialSavings)}</strong> tasarruf sağlayabilir.
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function CheckIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}
