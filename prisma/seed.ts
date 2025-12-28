import { PrismaClient, KrediDurumu, TaksitDurumu, OdemeYontemi } from '@prisma/client'

const prisma = new PrismaClient()

// Standard Monthly Payment Formula (PMT)
function calculateMonthlyPayment(principal: number, monthlyRate: number, months: number): number {
    if (monthlyRate === 0) return principal / months;

    // rate is percentage, e.g. 1.5 => 0.015
    const r = monthlyRate / 100;

    // PMT = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
    const numerator = principal * r * Math.pow(1 + r, months);
    const denominator = Math.pow(1 + r, months) - 1;

    return Number((numerator / denominator).toFixed(2));
}

// Function to calculate principal and interest parts of a payment (Amortization)
function calculateAmortizationSchedule(principal: number, monthlyRate: number, months: number, startDate: Date) {
    const r = monthlyRate / 100;
    const monthlyPayment = calculateMonthlyPayment(principal, monthlyRate, months);

    let balance = principal;
    const schedule = [];

    for (let i = 1; i <= months; i++) {
        const interestPayment = Number((balance * r).toFixed(2));
        let principalPayment = Number((monthlyPayment - interestPayment).toFixed(2));

        // Adjust final payment to completely clear floating point dust
        if (i === months) {
            principalPayment = balance;
        }

        balance = Number((balance - principalPayment).toFixed(2));

        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i); // 1st installment is 1 month after start

        schedule.push({
            installmentNumber: i,
            amount: monthlyPayment, // Note: Final payment might be slightly distinct in real world, but fine for seed
            principalAmount: principalPayment,
            interestAmount: interestPayment,
            remainingPrincipal: balance,
            dueDate: dueDate
        });
    }

    return schedule;
}

async function main() {
    const targetEmail = 'altinaysuleyman43@gmail.com'
    console.log(`Seeding database for ${targetEmail}...`)

    // 1. Upsert Kullanici
    // 1. Upsert Kullanici
    // Try to find existing user first to avoid disrupting Auth-linked users
    let kullanici = await prisma.kullanici.findUnique({ where: { email: targetEmail } })

    if (!kullanici) {
        console.log('User not found, creating new seed user...')
        kullanici = await prisma.kullanici.create({
            data: {
                email: targetEmail,
                companyName: 'Altınay Teknoloji Ltd. Şti.',
                fullName: 'Süleyman Altınay'
            }
        })
    } else {
        console.log('Found existing user, seeding data for them...')
    }
    console.log(`User ID: ${kullanici.id}`)

    // 2. Clear existing data
    // Delete payments first (child of installments)
    const installments = await prisma.taksit.findMany({
        where: { kredi: { userId: kullanici.id } },
        select: { id: true }
    })
    const installmentIds = installments.map(i => i.id)
    if (installmentIds.length > 0) {
        await prisma.odeme.deleteMany({
            where: { installmentId: { in: installmentIds } }
        })
    }

    // Delete installments (child of loans)
    await prisma.taksit.deleteMany({
        where: { kredi: { userId: kullanici.id } }
    })

    // Now safe to delete loans
    await prisma.kredi.deleteMany({ where: { userId: kullanici.id } })
    console.log("Cleared existing loans for user.")

    // 3. Realistic Loan Scenarios
    // Max credit 2.500.000 TL
    const loanScenarios = [
        // Large Business Loan - Active, early stage
        { bank: 'Ziraat Bankası', amount: 2500000, rate: 1.89, months: 48, startOffsetMonths: -3 },

        // Vehicle Loan - Active, mid stage
        { bank: 'Vakıfbank', amount: 1200000, rate: 2.15, months: 36, startOffsetMonths: -14 },

        // Tech Equipment Loan - Nearly finished
        { bank: 'Garanti BBVA', amount: 450000, rate: 3.25, months: 24, startOffsetMonths: -20 },

        // Small Cash Needs - Just started
        { bank: 'Enpara', amount: 150000, rate: 4.15, months: 12, startOffsetMonths: 0 },

        // Completed Loan (Reference)
        { bank: 'İş Bankası', amount: 300000, rate: 2.50, months: 12, startOffsetMonths: -15 }, // Ended 3 months ago

        // High Interest Short Term
        { bank: 'Akbank', amount: 500000, rate: 5.50, months: 6, startOffsetMonths: -2 },

        // Mid-size long term
        { bank: 'Halkbank', amount: 850000, rate: 1.99, months: 60, startOffsetMonths: -10 },

        // Recently finished
        { bank: 'QNB Finansbank', amount: 100000, rate: 3.90, months: 6, startOffsetMonths: -7 },

        // [NEW] Operating Capital - Revolving-style
        { bank: 'Denizbank', amount: 400000, rate: 2.85, months: 18, startOffsetMonths: -5 },

        // [NEW] Office Renovation
        { bank: 'Yapı Kredi', amount: 750000, rate: 2.35, months: 36, startOffsetMonths: -1 },
    ]

    for (const scenario of loanScenarios) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() + scenario.startOffsetMonths);

        // Calculate Schedule
        const schedule = calculateAmortizationSchedule(scenario.amount, scenario.rate, scenario.months, startDate);

        // Determine Loan Status roughly
        let loanStatus: KrediDurumu = KrediDurumu.ACTIVE;
        const lastDueDate = schedule[schedule.length - 1].dueDate;
        if (lastDueDate < new Date()) {
            loanStatus = KrediDurumu.PAID;
        }

        // Create Loan (Kredi)
        const kredi = await prisma.kredi.create({
            data: {
                userId: kullanici.id,
                bankName: scenario.bank,
                totalAmount: scenario.amount,
                monthlyInterestRate: scenario.rate,
                term: scenario.months,
                startDate: startDate,
                status: loanStatus,
                remainingPrincipal: scenario.amount, // Will update below
                description: `${scenario.bank} - ${scenario.months} Ay Vade`
            }
        });

        // Create Installments (Taksitler)
        let currentLoanPrincipalRemaining = scenario.amount;

        for (const item of schedule) {
            let status: TaksitDurumu = TaksitDurumu.PENDING;
            let paidDate: Date | null = null;
            let paymentAmount = 0;

            const isPastDue = item.dueDate < new Date();

            if (loanStatus === KrediDurumu.PAID) {
                status = TaksitDurumu.PAID;
                paidDate = item.dueDate; // Paid on time
                paymentAmount = item.amount;
            } else if (isPastDue) {
                // 90% chance paid, 10% chance overdue
                if (Math.random() > 0.10) {
                    status = TaksitDurumu.PAID;
                    paidDate = item.dueDate;
                    paymentAmount = item.amount;
                } else {
                    status = TaksitDurumu.OVERDUE;
                }
            } else {
                status = TaksitDurumu.PENDING;
            }

            // Create Installment (Taksit)
            const taksit = await prisma.taksit.create({
                data: {
                    loanId: kredi.id,
                    installmentNumber: item.installmentNumber,
                    amount: item.amount,
                    principalAmount: item.principalAmount,
                    interestAmount: item.interestAmount,
                    remainingPrincipal: item.remainingPrincipal,
                    dueDate: item.dueDate,
                    status: status,
                    paidDate: paidDate
                }
            });

            // If Paid, create Payment (Odeme) record
            if (status === TaksitDurumu.PAID && paidDate) {
                await prisma.odeme.create({
                    data: {
                        installmentId: taksit.id,
                        amount: paymentAmount,
                        date: paidDate,
                        method: OdemeYontemi.BANK_TRANSFER
                    }
                });

                // Deduct from loan remaining principal (approximate logic for this seed)
                currentLoanPrincipalRemaining = Number((currentLoanPrincipalRemaining - item.principalAmount).toFixed(2));
            }
        }

        // Update Loan Remaining Principal
        if (loanStatus === KrediDurumu.PAID) {
            currentLoanPrincipalRemaining = 0;
        }

        await prisma.kredi.update({
            where: { id: kredi.id },
            data: {
                remainingPrincipal: Math.max(0, currentLoanPrincipalRemaining)
            }
        });

        console.log(`Created Credit: ${scenario.bank} ${scenario.amount} TL (${loanStatus})`);
    }

    // 4. Create some basic Accounts and Categories for completeness
    await prisma.hesap.createMany({
        skipDuplicates: true,
        data: [
            { userId: kullanici.id, name: 'Şirket Ana Hesap', type: 'BANK_ACCOUNT', balance: 450000, currency: 'TRY' },
            { userId: kullanici.id, name: 'Kredi Kartı', type: 'CREDIT_CARD', balance: -15000, currency: 'TRY' },
            { userId: kullanici.id, name: 'Nakit Kasa', type: 'CASH', balance: 5000, currency: 'TRY' },
        ]
    })

    console.log('Seeding finished successfully.');
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
