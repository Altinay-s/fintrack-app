import { CreateLoanForm } from '@/components/create-loan-form'
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Overview } from '@/components/overview'
import { DollarSign, CreditCard, Activity, Calendar } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { AIAdvisor } from '@/components/ai-advisor'

export default async function Dashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch Loans with Installments
    const loansData = await prisma.kredi.findMany({
        where: { userId: user.id },
        include: { taksitler: true },
        orderBy: { createdAt: 'desc' },
    })

    // Map to match AIAdvisor interface if needed, or just let 'as any' handle it if names align enough.
    // AIAdvisor expects 'interestRate', DB has 'monthlyInterestRate'.
    // Also mapping 'taksitler' to 'installments' for Frontend compatibility
    const loans = loansData.map(l => ({
        ...l,
        interestRate: l.monthlyInterestRate,
        installments: l.taksitler
    }))

    // 1. Calculate Total Debt (Total Loan Volume)
    const totalDebt = loans.reduce((sum, loan) => sum + Number(loan.totalAmount), 0)

    // 2. Calculate Remaining Installments count
    const remainingInstallments = loans.reduce((count, loan) => {
        const unpaid = loan.installments.filter((i) => i.status !== 'PAID').length
        return count + unpaid
    }, 0)

    // 3. Prepare Chart Data (Monthly)
    // Initialize 12 months with 0
    const months = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
    ]

    const chartData = months.map(name => ({ name, total: 0 }))

    // Aggregate installment amounts by month
    loans.forEach((loan) => {
        loan.installments.forEach((inst) => {
            const monthIndex = new Date(inst.dueDate).getMonth()
            if (monthIndex >= 0 && monthIndex < 12) {
                chartData[monthIndex].total += Number(inst.amount)
            }
        })
    })

    // 4. Get Upcoming Payments
    const allInstallments = loans.flatMap((loan) =>
        loan.installments.map((inst) => ({
            ...inst,
            bankName: loan.bankName,
        }))
    )

    const upcomingPayments = allInstallments
        .filter((i) => i.status !== 'PAID')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5)

    // 5. Active Loans Count
    const activeLoansCount = loans.filter((l) => l.status === 'ACTIVE').length

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Panel</h2>
            </div>

            {/* AI Asistanı */}
            <div className="mb-6">
                <AIAdvisor loans={loans as any} />
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Kredi Hacmi</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalDebt)}</div>
                        <p className="text-xs text-muted-foreground">Geçen aydan bu yana +%20.1</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kalan Taksitler</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{remainingInstallments}</div>
                        <p className="text-xs text-muted-foreground">{loans.length} aktif kredi genelinde</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sıradaki Ödeme</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {upcomingPayments.length > 0 ? (
                            <>
                                <div className="text-2xl font-bold">
                                    {formatDate(upcomingPayments[0].dueDate).split(' ').slice(0, 2).join(' ')}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {upcomingPayments[0].bankName}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-bold">-</div>
                                <p className="text-xs text-muted-foreground">Ödeme yok</p>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Aktif Krediler</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeLoansCount}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Monthly Overview Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Genel Bakış</CardTitle>
                        <CardDescription>Aylık ödeme projeksiyonu.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <Overview data={chartData} />
                    </CardContent>
                </Card>

                {/* Create Loan Form */}
                <div className="col-span-3">
                    <CreateLoanForm />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Recent Loans List */}
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Son Krediler</CardTitle>
                        <CardDescription>Toplam {loans.length} krediniz var.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {loans.slice(0, 5).map((loan) => (
                                <div key={loan.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{loan.bankName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(loan.startDate)}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        +{formatCurrency(Number(loan.totalAmount))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Payments List */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Yaklaşan Ödemeler</CardTitle>
                        <CardDescription>Sıradaki 5 taksit.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {upcomingPayments.map((payment, idx) => (
                                <div key={payment.id || idx} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{payment.bankName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(payment.dueDate)}
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {formatCurrency(Number(payment.amount))}
                                    </div>
                                </div>
                            ))}
                            {upcomingPayments.length === 0 && (
                                <p className="text-sm text-muted-foreground">Yaklaşan ödeme bulunmuyor.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
