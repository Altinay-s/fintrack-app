import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { PaymentsList } from '@/components/payments-list'
import { TaksitDurumu } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch installments that are not fully paid (Upcoming)
    const rawUpcoming = await prisma.taksit.findMany({
        where: {
            kredi: { userId: user.id },
            status: { in: [TaksitDurumu.PENDING, TaksitDurumu.PARTIALLY_PAID, TaksitDurumu.OVERDUE] }
        },
        include: {
            kredi: {
                select: {
                    bankName: true,
                    totalAmount: true
                }
            }
        },
        orderBy: { dueDate: 'asc' }
    })

    const upcomingInstallments = rawUpcoming.map(i => ({
        ...i,
        amount: Number(i.amount),
        kredi: {
            ...i.kredi,
            totalAmount: Number(i.kredi.totalAmount)
        }
    }))

    // Fetch installments that are fully paid
    const rawPaid = await prisma.taksit.findMany({
        where: {
            kredi: { userId: user.id },
            status: TaksitDurumu.PAID
        },
        include: {
            kredi: {
                select: {
                    bankName: true,
                    totalAmount: true
                }
            }
        },
        orderBy: { dueDate: 'desc' }, // Show most recently paid first (or by due date)
        take: 50 // Limit history to last 50 payments to avoid overload
    })

    const paidInstallments = rawPaid.map(i => ({
        ...i,
        amount: Number(i.amount),
        kredi: {
            ...i.kredi,
            totalAmount: Number(i.kredi.totalAmount)
        }
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Ödemeler</h1>
                <p className="text-muted-foreground">Yaklaşan ödemelerinizi takip edin ve yönetin.</p>
            </div>

            <PaymentsList
                upcomingPayments={upcomingInstallments}
                paidPayments={paidInstallments}
            />
        </div>
    )
}
