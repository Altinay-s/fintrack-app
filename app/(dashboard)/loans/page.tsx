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

export default async function LoansPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const loans = await prisma.kredi.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            taksitler: true
        }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Kredilerim</h1>
                <p className="text-muted-foreground">Tüm aktif ticari kredilerinizi görüntüleyin ve yönetin.</p>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Banka</TableHead>
                            <TableHead>Başlangıç Tarihi</TableHead>
                            <TableHead>Toplam Tutar</TableHead>
                            <TableHead>Faiz Oranı</TableHead>
                            <TableHead>Taksit Durumu</TableHead>
                            <TableHead>Durum</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loans.map((loan) => (
                            <TableRow key={loan.id}>
                                <TableCell className="font-medium">{loan.bankName}</TableCell>
                                <TableCell>{formatDate(loan.startDate)}</TableCell>
                                <TableCell>{formatCurrency(Number(loan.totalAmount))}</TableCell>
                                <TableCell>%{Number(loan.monthlyInterestRate)}</TableCell>
                                <TableCell>
                                    {loan.taksitler.filter(i => i.status === 'PAID').length} / {loan.taksitler.length} Ödendi
                                </TableCell>
                                <TableCell>
                                    <Badge variant={loan.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                        {loan.status === 'ACTIVE' ? 'Aktif' : 'Ödendi'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                        {loans.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Henüz kredi bulunamadı. Panelden yeni bir kredi ekleyin.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
