import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Config
    const targetEmail = 'altinaysuleyman43@gmail.com'

    console.log(`Seeding database for ${targetEmail}...`)

    // 1. Upsert User
    const user = await prisma.user.upsert({
        where: { email: targetEmail },
        update: {},
        create: {
            email: targetEmail,
            companyName: 'Altınay Teknoloji Ltd. Şti.',
        },
    })

    console.log(`User created/found: ${user.id} (${user.email})`)

    // 2. Define Banks and Data
    const banks = [
        "Akbank", "Garanti BBVA", "Ziraat Bankası", "Vakıfbank",
        "İş Bankası", "Yapı Kredi", "QNB Finansbank", "Halkbank",
        "Denizbank", "TEB"
    ]

    // Clear existing data for this user to ensure fresh seed (optional, but good for "10-12 loans" requirement)
    // safe to remove mostly if we want to ensure exact state
    const existingLoans = await prisma.loan.findMany({ where: { userId: user.id } })
    if (existingLoans.length > 0) {
        console.log(`User already has ${existingLoans.length} loans. Adding more if needed or skipping clear.`)
        // For this task, let's just add to them or ensure we have enough. 
        // Let's create new ones to be sure we hit the "10-12" target with diversity.
    }

    const loansToCreate = [
        // Active Loans
        { bank: 'Akbank', amount: 350000, rate: 3.45, months: 24, startOffsetMonths: -5 },
        { bank: 'Garanti BBVA', amount: 500000, rate: 2.89, months: 36, startOffsetMonths: -8 },
        { bank: 'Ziraat Bankası', amount: 1200000, rate: 1.99, months: 48, startOffsetMonths: -12 },
        { bank: 'Yapı Kredi', amount: 250000, rate: 4.15, months: 12, startOffsetMonths: -2 },
        { bank: 'QNB Finansbank', amount: 75000, rate: 5.20, months: 6, startOffsetMonths: -1 },
        { bank: 'İş Bankası', amount: 450000, rate: 3.10, months: 24, startOffsetMonths: -10 },
        // Paid / Mostly Paid
        { bank: 'Vakıfbank', amount: 100000, rate: 2.50, months: 12, startOffsetMonths: -13 }, // Finished
        { bank: 'Halkbank', amount: 200000, rate: 2.10, months: 24, startOffsetMonths: -20 }, // Mostly done

        // New / Recent
        { bank: 'Denizbank', amount: 300000, rate: 4.50, months: 12, startOffsetMonths: 0 },
        { bank: 'TEB', amount: 150000, rate: 3.95, months: 18, startOffsetMonths: -1 },
    ]

    for (const loanData of loansToCreate) {
        // Check for duplicates to prevent spamming on re-runs
        const existing = await prisma.loan.findFirst({
            where: {
                userId: user.id,
                bankName: loanData.bank,
                totalAmount: loanData.amount,
            }
        })

        if (existing) {
            console.log(`Loan ${loanData.bank} ${loanData.amount} already exists.`)
            continue
        }

        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() + loanData.startOffsetMonths)

        const loan = await prisma.loan.create({
            data: {
                userId: user.id,
                bankName: loanData.bank,
                totalAmount: loanData.amount,
                interestRate: loanData.rate,
                startDate: startDate,
                status: 'ACTIVE', // logic below will determine if it's effectively paid
            }
        })

        // Installments
        const monthlyAmount = loanData.amount / loanData.months
        const installments = []
        let paidCount = 0

        for (let i = 0; i < loanData.months; i++) {
            const dueDate = new Date(startDate)
            dueDate.setMonth(dueDate.getMonth() + i + 1)

            const isPaid = dueDate < new Date()
            if (isPaid) paidCount++

            installments.push({
                loanId: loan.id,
                amount: monthlyAmount,
                dueDate: dueDate,
                isPaid: isPaid
            })
        }

        await prisma.installment.createMany({ data: installments })

        // Determine status
        if (paidCount === loanData.months) {
            await prisma.loan.update({
                where: { id: loan.id },
                data: { status: 'PAID' }
            })
        }

        console.log(`Created ${loanData.bank} loan. Paid: ${paidCount}/${loanData.months}`)
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
