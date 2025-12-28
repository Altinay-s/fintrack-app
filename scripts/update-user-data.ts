
import { PrismaClient, KrediDurumu, TaksitDurumu } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'altinaysuleyman43@gmail.com';
    console.log(`Finding user with email: ${email}`);

    const user = await prisma.kullanici.findUnique({
        where: { email },
    });

    if (!user) {
        console.error('User not found!');
        return;
    }

    console.log(`User found: ${user.id}. Cleaning up old data...`);

    // Delete existing loans (cascades to installments)
    await prisma.kredi.deleteMany({
        where: { userId: user.id },
    });

    console.log('Old records deleted. Creating new diverse loan portfolio...');

    const loans = [
        // 1. Ziraat Bankası (State Bank - Home Loan) - Largest
        {
            bankName: 'Ziraat Bankası',
            amount: 1850000,
            term: 120, // 10 years
            rate: 1.29, // Realistic mortgage rate
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 14)), // Started 14 months ago
            dayOfMonth: 1, // Salary day
            type: 'Konut Kredisi',
        },
        // 2. İş Bankası (Private - Car Loan)
        {
            bankName: 'İş Bankası',
            amount: 350000,
            term: 24, // 2 years
            rate: 2.85,
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)), // Started 3 months ago
            dayOfMonth: 15,
            type: 'Taşıt Kredisi',
        },
        // 3. Garanti BBVA (Private - Personal Loan)
        {
            bankName: 'Garanti BBVA',
            amount: 75000,
            term: 12,
            rate: 3.99,
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 5)), // Started 5 months ago
            dayOfMonth: 20, // Mid month
            type: 'İhtiyaç Kredisi',
        },
        // 4. Akbank (Private - Short term / Holiday / Tech)
        {
            bankName: 'Akbank',
            amount: 25000,
            term: 6,
            rate: 4.15,
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Just started
            dayOfMonth: 10,
            type: 'İhtiyaç Kredisi',
        },
        // 5. QNB Finansbank (Paid off or nearly paid off small loan example)
        {
            bankName: 'QNB Finansbank',
            amount: 15000,
            term: 6,
            rate: 3.50,
            startDate: new Date(new Date().setMonth(new Date().getMonth() - 5)), // 1 installment left
            dayOfMonth: 5,
            type: 'Eğitim Kredisi',
        }
    ];

    for (const loanData of loans) {
        // PMT Calculation
        const r = loanData.rate / 100;
        const n = loanData.term;
        const P = loanData.amount;

        // Monthly payment
        const monthlyPayment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalRepayment = monthlyPayment * n;

        const loan = await prisma.kredi.create({
            data: {
                userId: user.id,
                bankName: loanData.bankName,
                totalAmount: totalRepayment,
                monthlyInterestRate: loanData.rate,
                term: loanData.term,
                startDate: loanData.startDate,
                status: KrediDurumu.ACTIVE,
                remainingPrincipal: totalRepayment,
                description: loanData.type,
            },
        });

        console.log(`Created loan: ${loanData.bankName} - ${loanData.type}`);

        let remainingPrincipal = totalRepayment;

        for (let i = 1; i <= n; i++) {
            // Calculate due date
            const dueDate = new Date(loanData.startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            dueDate.setDate(loanData.dayOfMonth);

            const isPast = dueDate < new Date();
            const status = isPast ? TaksitDurumu.PAID : TaksitDurumu.PENDING;
            const paidDate = isPast ? dueDate : null;

            if (status === TaksitDurumu.PAID) {
                remainingPrincipal -= monthlyPayment;
            }

            await prisma.taksit.create({
                data: {
                    loanId: loan.id,
                    installmentNumber: i,
                    amount: monthlyPayment,
                    principalAmount: monthlyPayment * 0.7,
                    interestAmount: monthlyPayment * 0.3,
                    remainingPrincipal: Math.max(0, remainingPrincipal),
                    dueDate: dueDate,
                    status: status,
                    paidDate: paidDate,
                }
            });
        }

        await prisma.kredi.update({
            where: { id: loan.id },
            data: { remainingPrincipal: Math.max(0, remainingPrincipal) }
        });
    }

    console.log('Update complete. Loans redistributed across banks.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
