'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { TaksitDurumu, OdemeYontemi, KrediDurumu } from '@prisma/client'

export async function payInstallment(installmentId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        // 1. Get the installment and loan to verify ownership and calculations
        const installment = await prisma.taksit.findUnique({
            where: { id: installmentId },
            include: { kredi: true }
        })

        if (!installment) {
            return { error: 'Installment not found' }
        }

        if (installment.kredi.userId !== user.id) {
            return { error: 'Unauthorized access to this loan' }
        }

        if (installment.status === TaksitDurumu.PAID) {
            return { error: 'Installment is already paid' }
        }

        // 2. Perform the payment transaction
        await prisma.$transaction(async (tx) => {
            // Update Installment
            await tx.taksit.update({
                where: { id: installmentId },
                data: {
                    status: TaksitDurumu.PAID,
                    paidDate: new Date(),
                }
            })

            // Create Payment Record
            await tx.odeme.create({
                data: {
                    installmentId: installmentId,
                    amount: installment.amount,
                    date: new Date(),
                    method: OdemeYontemi.BANK_TRANSFER // Default for now, could be passed as arg
                }
            })

            // Update Loan Remaining Principal
            // Logic: Deduct the principal portion of this installment from the loan's remaining principal
            await tx.kredi.update({
                where: { id: installment.loanId },
                data: {
                    remainingPrincipal: {
                        decrement: installment.principalAmount
                    }
                }
            })

            // Checks if all installments are paid to close the loan could be added here
            // But strict "Status" update for LOAN might require checking ALL installments.
            // Let's do a quick check:
            const pendingInstallments = await tx.taksit.count({
                where: {
                    loanId: installment.loanId,
                    status: { not: TaksitDurumu.PAID }
                }
            })

            if (pendingInstallments === 0) {
                await tx.kredi.update({
                    where: { id: installment.loanId },
                    data: { status: KrediDurumu.PAID }
                })
            }
        })

        revalidatePath('/payments')
        revalidatePath('/reports')
        return { success: true }
    } catch (error) {
        console.error('Payment error:', error)
        return { error: 'Failed to process payment' }
    }
}
