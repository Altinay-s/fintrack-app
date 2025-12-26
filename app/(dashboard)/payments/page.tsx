
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate, formatCurrency } from '@/lib/formatters'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard } from 'lucide-react'
import { PaymentButton } from '@/components/payment-button'

import { TaksitDurumu } from '@prisma/client'

export default async function PaymentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch installments that are not fully paid
    const installments = await prisma.taksit.findMany({
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

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Ödemeler</h1>
                <p className="text-muted-foreground">Yaklaşan ödemelerinizi takip edin ve yönetin.</p>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Banka</TableHead>
                            <TableHead>Vade Tarihi</TableHead>
                            <TableHead>Taksit Tutarı</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead className="text-right">İşlem</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {installments.map((installment) => (
                            <TableRow key={installment.id}>
                                <TableCell className="font-medium">{installment.kredi.bankName}</TableCell>
                                <TableCell>{formatDate(installment.dueDate)}</TableCell>
                                <TableCell>{formatCurrency(Number(installment.amount))}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        installment.status === TaksitDurumu.OVERDUE ? 'destructive' :
                                            installment.status === TaksitDurumu.PENDING ? 'outline' : 'secondary'
                                    }>
                                        {installment.status === TaksitDurumu.OVERDUE ? 'Gecikmiş' :
                                            installment.status === TaksitDurumu.PENDING ? 'Bekliyor' : 'Kısmi Ödeme'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <PaymentButton
                                        installmentId={installment.id}
                                        amount={Number(installment.amount)}
                                        bankName={installment.kredi.bankName}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {installments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Ödenmesi gereken taksit bulunmuyor.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
