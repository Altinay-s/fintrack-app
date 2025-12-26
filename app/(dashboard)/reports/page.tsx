import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import {
    LoanDistributionChart,
    PaymentHistoryChart,
    FutureProjectionChart
} from '@/components/reports/charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from '@/lib/formatters'
import { addMonths, format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { tr } from 'date-fns/locale'

export default async function ReportsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch Data
    const loans = await prisma.kredi.findMany({
        where: { userId: user.id },
        select: {
            bankName: true,
            remainingPrincipal: true,
            totalAmount: true,
            status: true,
            taksitler: {
                select: {
                    dueDate: true,
                    amount: true,
                    status: true,
                    principalAmount: true
                }
            }
        }
    })

    // 2. Process: Loan Distribution by Bank (Pie Chart)
    const bankMap = new Map<string, number>()
    let totalDebt = 0
    let totalOriginal = 0

    loans.filter(l => l.status === 'ACTIVE').forEach(loan => {
        const current = bankMap.get(loan.bankName) || 0
        bankMap.set(loan.bankName, current + Number(loan.remainingPrincipal))
        totalDebt += Number(loan.remainingPrincipal)
        totalOriginal += Number(loan.totalAmount)
    })

    const loanDistributionData = Array.from(bankMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

    // 3. Process: Payment History (Last 6 Months vs Next 6 Months)
    // We want a bar chart with "Paid" vs "Pending" amounts per month
    const historyDataMap = new Map<string, { paid: number, pending: number, order: number }>()

    // Initialize last 6 months + next 6 months
    const today = new Date()
    for (let i = -5; i <= 5; i++) {
        const d = addMonths(today, i)
        const key = format(d, 'MMM yyyy', { locale: tr })
        historyDataMap.set(key, { paid: 0, pending: 0, order: d.getTime() })
    }

    loans.forEach(loan => {
        loan.taksitler.forEach(inst => {
            const key = format(inst.dueDate, 'MMM yyyy', { locale: tr })
            if (historyDataMap.has(key)) {
                const entry = historyDataMap.get(key)!
                if (inst.status === 'PAID') {
                    entry.paid += Number(inst.amount)
                } else {
                    entry.pending += Number(inst.amount)
                }
            }
        })
    })

    const paymentHistoryData = Array.from(historyDataMap.values())
        .map((val, idx) => ({
            name: format(new Date(val.order), 'MMM', { locale: tr }),
            paid: val.paid,
            pending: val.pending,
            fullDate: val.order
        }))
        .sort((a, b) => a.fullDate - b.fullDate)


    // 4. Process: Future Projection (Debt Reduction)
    // Start with current total debt, and subtract principal of each future installment month by month
    const projectionData = []
    let currentDebt = totalDebt

    for (let i = 0; i <= 11; i++) {
        const d = addMonths(today, i)
        const monthStart = startOfMonth(d)
        const monthEnd = endOfMonth(d)

        let principalReductionThisMonth = 0

        loans.forEach(loan => {
            loan.taksitler.forEach(inst => {
                if (inst.dueDate >= monthStart && inst.dueDate <= monthEnd) {
                    principalReductionThisMonth += Number(inst.principalAmount)
                }
            })
        })

        projectionData.push({
            name: format(d, 'MMM yy', { locale: tr }),
            remaining: Math.max(0, currentDebt)
        })

        // Prepare for next month
        currentDebt -= principalReductionThisMonth
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Finansal Raporlar</h1>
                <p className="text-muted-foreground">Kredileriniz ve ödemeleriniz hakkında detaylı içgörüler.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Kalan Borç</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalDebt)}</div>
                        <p className="text-xs text-muted-foreground">
                            Toplam {formatCurrency(totalOriginal)} krediden kalan
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktif Kredi Sayısı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loans.filter(l => l.status === 'ACTIVE').length}</div>
                        <p className="text-xs text-muted-foreground">Farklı bankalarda</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ödenen Oranı</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {((1 - (totalDebt / totalOriginal)) * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">Anapara bazında</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart: Payment History */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Ödeme Geçmişi ve Planı</CardTitle>
                        <CardDescription>
                            Son 6 ay ve gelecek 6 ay için ödeme yoğunluğu.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <PaymentHistoryChart data={paymentHistoryData} />
                    </CardContent>
                </Card>

                {/* Side Chart: Loan Distribution */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Banka Dağılımı</CardTitle>
                        <CardDescription>
                            Toplam borcun bankalara göre dağılımı.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoanDistributionChart data={loanDistributionData} />
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Chart: Debt Projection */}
            <Card>
                <CardHeader>
                    <CardTitle>Borç Eritme Projeksiyonu</CardTitle>
                    <CardDescription>
                        Mevcut ödeme planına göre önümüzdeki 1 yıl içinde borcunuzun azalma eğilimi.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <FutureProjectionChart data={projectionData} />
                </CardContent>
            </Card>
        </div>
    )
}
