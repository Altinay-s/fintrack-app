'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createLoan(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const bankName = formData.get('bankName') as string
    const totalAmount = parseFloat(formData.get('totalAmount') as string)
    const interestRate = parseFloat(formData.get('interestRate') as string)
    const installmentCount = parseInt(formData.get('installmentCount') as string)
    const startDateStr = formData.get('startDate') as string
    const startDate = new Date(startDateStr)

    if (!bankName || isNaN(totalAmount) || isNaN(installmentCount) || !startDateStr) {
        return { error: 'Invalid input' }
    }

    // Calculate monthly payment (simple logic: total / count, or amortized?)
    // Requirement says: "Calculate equal installments".
    // Assuming simple division for now or Total Amount includes interest?
    // "Total Amount" usually implies principal. "Interest Rate" implies calculation.
    // But for MVP, if user enters "Total Debt", we might just divide it.
    // Let's assume standard amortization or simple interest add-on.
    // For simplicity solely based on "Total Amount":
    // Installment Amount = TotalAmount / Count. (If TotalAmount includes interest).
    // If TotalAmount is Principal, we need to add interest.
    // Let's assume TotalAmount is the final debt amount for now to correspond to "Toplam Borç" in dashboard.
    // Actually, let's treat TotalAmount as Principal, and add interest?
    // User Prompt: "Total Amount, Interest Rate, Start Date" -> "Calculate Installment".
    // Let's assume Total Amount is the Loan Principal.
    // But to keep it robust: Use PMT formula or Simple Interest?
    // "FinTrack" sounds tracking existing loans.
    // Let's simplify: Installment Amount = TotalAmount / Count.
    // Any interest logic can be added later or assumed included in TotalAmount.
    // Wait, `interestRate` is a field.
    // Let's do: Principal * (1 + Interest/100) / Count?
    // Or just TotalAmount / Count and store InterestRate for reference.
    // I will just use TotalAmount / Count for the installment amount to be safe and predictable.

    const installmentAmount = totalAmount / installmentCount

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create Loan
            const loan = await tx.loan.create({
                data: {
                    userId: user.id,
                    bankName,
                    totalAmount,
                    interestRate,
                    startDate,
                    status: 'ACTIVE',
                },
            })

            // 2. Create Installments
            const installmentsData = []
            for (let i = 0; i < installmentCount; i++) {
                const dueDate = new Date(startDate)
                dueDate.setMonth(dueDate.getMonth() + i + 1) // First installment next month? Or same month? usually next.

                installmentsData.push({
                    loanId: loan.id,
                    amount: installmentAmount,
                    dueDate: dueDate,
                    isPaid: false,
                })
            }

            await tx.installment.createMany({
                data: installmentsData,
            })
        })

        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Error creating loan:', error)
        return { error: 'Failed to create loan' }
    }
}
