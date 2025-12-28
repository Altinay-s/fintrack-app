'use client'

import { useState } from 'react'
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
import { PaymentButton } from '@/components/payment-button'
import { formatDate, formatCurrency } from '@/lib/formatters'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { TaksitDurumu } from '@prisma/client'

// Define a type that matches what we query from Prisma
type InstallmentWithLoan = {
    id: string
    dueDate: Date
    paidDate: Date | null // Added paidDate
    amount: any // Prisma Decimal compatibility
    status: TaksitDurumu
    kredi: {
        bankName: string
        totalAmount: unknown
    }
}

interface PaymentsListProps {
    upcomingPayments: InstallmentWithLoan[]
    paidPayments: InstallmentWithLoan[]
}

export function PaymentsList({ upcomingPayments, paidPayments }: PaymentsListProps) {
    const [showAllUpcoming, setShowAllUpcoming] = useState(false)

    // Limit to 15 items if not showing all
    const displayedUpcoming = showAllUpcoming ? upcomingPayments : upcomingPayments.slice(0, 15)

    return (
        <div className="space-y-8">
            {/* Upcoming Payments Section */}
            <div className="rounded-md border bg-card">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-semibold">Yaklaşan Ödemeler</h2>
                </div>
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
                        {displayedUpcoming.map((installment) => (
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
                        {upcomingPayments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Ödenmesi gereken taksit bulunmuyor.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {/* Show More Button */}
                {upcomingPayments.length > 15 && (
                    <div className="p-4 border-t flex justify-center">
                        <Button
                            variant="ghost"
                            onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                            className="flex items-center gap-2"
                        >
                            {showAllUpcoming ? (
                                <>
                                    <ChevronUp className="h-4 w-4" />
                                    Daha Az Göster
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="h-4 w-4" />
                                    Tümünü Göster ({upcomingPayments.length - 15} daha fazla)
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>

            {/* Paid Payments Section */}
            <div className="rounded-md border bg-card opacity-75">
                <div className="p-4 border-b bg-muted/30">
                    <h2 className="text-xl font-semibold text-muted-foreground">Ödenen Krediler</h2>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Banka</TableHead>
                            <TableHead>Vade Tarihi</TableHead>
                            <TableHead>Taksit Tutarı</TableHead>
                            <TableHead>Durum</TableHead>
                            <TableHead className="text-right">Ödenme Tarihi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paidPayments.map((installment) => (
                            <TableRow key={installment.id}>
                                <TableCell className="font-medium text-muted-foreground">{installment.kredi.bankName}</TableCell>
                                <TableCell className="text-muted-foreground">{formatDate(installment.dueDate)}</TableCell>
                                <TableCell className="text-muted-foreground">{formatCurrency(Number(installment.amount))}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                        Ödendi
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {installment.paidDate ? formatDate(installment.paidDate) : '✅'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {paidPayments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Henüz ödenmiş taksit bulunmuyor.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
