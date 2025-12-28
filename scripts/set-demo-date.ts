
import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    const email = 'altinaysuleyman43@gmail.com';
    const user = await prisma.kullanici.findUnique({ where: { email } });

    if (!user) {
        console.error('User not found');
        return;
    }

    // Find the first pending installment for this user
    const loan = await prisma.kredi.findFirst({
        where: { userId: user.id },
        include: { taksitler: { where: { status: 'PENDING' }, orderBy: { dueDate: 'asc' }, take: 1 } }
    });

    if (!loan || !loan.taksitler.length) {
        console.error('No pending installments found to modify.');
        return;
    }

    const installment = loan.taksitler[0];
    const tomorrow = addDays(new Date(), 1);

    console.log(`Updating installment ${installment.id} for ${loan.bankName}...`);
    console.log(`Original Date: ${installment.dueDate.toDateString()}`);
    console.log(`New Target Demo Date: ${tomorrow.toDateString()}`);

    await prisma.taksit.update({
        where: { id: installment.id },
        data: { dueDate: tomorrow }
    });

    console.log('Update Success! Now visit /api/cron/reminder to test.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
