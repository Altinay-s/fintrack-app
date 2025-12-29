
import { PrismaClient, TaksitDurumu } from '@prisma/client'

const prisma = new PrismaClient()

const TARGET_EMAIL = 'altinaysuleyman43@gmail.com'

async function main() {
    console.log(`Checking user: ${TARGET_EMAIL}...`)

    const user = await prisma.kullanici.findUnique({
        where: { email: TARGET_EMAIL },
        include: { krediler: true } // Check if connected
    })

    if (!user) {
        console.error('User not found!')
        process.exit(1)
    }

    console.log(`User found: ${user.id} (${user.fullName})`)

    // 1. Clean existing data
    console.log(`Deleting ${user.krediler.length} existing loans...`)
    // Delete loans (Cascades to Installments usually, but let's be safe if schema doesn't cascade, but schema said onDelete: Cascade)
    await prisma.kredi.deleteMany({
        where: { userId: user.id }
    })
    console.log('Existing loans deleted.')

    // 2. Create new loans
    // Target Total: 1,750,000
    // Strategy: Create "Spikes" by having short-term high-payment loans overlap.
    // Create "Unpaid/Overdue" by having past dates remain PENDING.

    const now = new Date()
    // Helper to get date relative to now
    const monthsAgo = (n: number) => {
        const d = new Date(now)
        d.setMonth(d.getMonth() - n)
        return d
    }
    const monthsFuture = (n: number) => {
        const d = new Date(now)
        d.setMonth(d.getMonth() + n)
        return d
    }

    /*
      Distribution Plan (Total 1.75M):
      1. Garanti: 600k, 36m (Base load). Started 5 months ago. All paid up to date.
      2. İş Bankası: 400k, 24m (Base load). Started 3 months ago. All paid.
      3. Akbank: 300k, 12m (Medium). Started 1 month ago. Paid.
      4. QNB Finansbank: 250k, 6m (Spike). Starts NEXT MONTH. (PENDING). High monthly impact (40k+).
      5. Ziraat Bankası: 100k, 6m (Overdue). Started 2 months ago. NONE PAID. (Overdue).
      6. Halkbank: 100k, 12m (Standard). Started 15 days ago. (Upcoming).
    */

    const LOANS = [
        {
            bankName: 'Garanti BBVA',
            amount: 600000,
            term: 36,
            interest: 3.5,
            startDate: monthsAgo(5),
            payHistory: 'ALL_PAID' // Pay everything before today
        },
        {
            bankName: 'İş Bankası',
            amount: 400000,
            term: 24,
            interest: 3.2,
            startDate: monthsAgo(3),
            payHistory: 'ALL_PAID'
        },
        {
            bankName: 'Akbank',
            amount: 300000,
            term: 12,
            interest: 3.1,
            startDate: monthsAgo(1),
            payHistory: 'ALL_PAID'
        },
        {
            bankName: 'QNB Finansbank',
            amount: 250000,
            term: 6,
            interest: 2.9,
            startDate: monthsFuture(1), // Starts in future
            payHistory: 'NONE_PAID'
        },
        {
            bankName: 'Ziraat Bankası',
            amount: 100000,
            term: 6,
            interest: 2.5,
            startDate: monthsAgo(2),
            payHistory: 'NONE_PAID' // Intentionally overdue
        },
        {
            bankName: 'Halkbank',
            amount: 100000,
            term: 12,
            interest: 3.0,
            startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15), // Started 15 days ago
            payHistory: 'NONE_PAID' // First payment coming up or just passed? Let's keep pending.
        }
    ]

    const totalSeeded = LOANS.reduce((acc, curr) => acc + curr.amount, 0)
    console.log(`Creating ${LOANS.length} loans. Total Amount: ${totalSeeded.toLocaleString('tr-TR')} ₺`)

    for (const loanData of LOANS) {
        // Create Loan
        const loan = await prisma.kredi.create({
            data: {
                userId: user.id,
                bankName: loanData.bankName,
                totalAmount: loanData.amount,
                monthlyInterestRate: loanData.interest,
                term: loanData.term,
                startDate: loanData.startDate,
                status: 'ACTIVE',
                remainingPrincipal: loanData.amount, // Will deduct as we mark paid
                description: loanData.payHistory === 'NONE_PAID' && loanData.startDate < now ? 'Gecikmiş Örnek' : 'Demo Verisi'
            }
        })

        // Create Installments
        const installmentAmount = loanData.amount / loanData.term
        const installmentsData = []
        let currentRemaining = loanData.amount
        let loanRemainingPrincipal = loanData.amount

        for (let i = 0; i < loanData.term; i++) {
            const dueDate = new Date(loanData.startDate)
            dueDate.setMonth(dueDate.getMonth() + i + 1)

            let status: TaksitDurumu = 'PENDING'
            let paidDate = null

            // Logic for status
            if (loanData.payHistory === 'ALL_PAID') {
                if (dueDate < now) {
                    status = 'PAID'
                    paidDate = dueDate
                    loanRemainingPrincipal -= installmentAmount
                }
            } else if (loanData.payHistory === 'NONE_PAID') {
                // If date is passed, it remains PENDING (effectively Overdue in UI usually or shows Rec)
                // If we want explicit overdue status:
                if (dueDate < now) {
                    status = 'OVERDUE'
                }
            }

            installmentsData.push({
                loanId: loan.id,
                installmentNumber: i + 1,
                amount: installmentAmount,
                principalAmount: installmentAmount,
                interestAmount: 0,
                remainingPrincipal: Math.max(0, currentRemaining - installmentAmount),
                dueDate: dueDate,
                paidDate: paidDate,
                status: status,
            })
            currentRemaining -= installmentAmount
        }

        await prisma.taksit.createMany({
            data: installmentsData,
        })

        // Update Loan Remaining Principal based on what we marked as paid
        await prisma.kredi.update({
            where: { id: loan.id },
            data: {
                remainingPrincipal: Math.max(0, loanRemainingPrincipal)
            }
        })
    }

    console.log('Update complete with complex distribution!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
