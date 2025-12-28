
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendPaymentReminder } from '@/actions/send-email';
import { addDays, startOfDay, endOfDay } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        // Look for payments due tomorrow (or today/yesterday for demo purposes if we want wider range)
        // Let's stick to "Tomorrow" as the standard reminder logic
        const tomorrow = addDays(new Date(), 1);
        const start = startOfDay(tomorrow);
        const end = endOfDay(tomorrow);

        console.log(`Checking for payments due between ${start.toISOString()} and ${end.toISOString()}`);

        const installments = await prisma.taksit.findMany({
            where: {
                dueDate: {
                    gte: start,
                    lte: end,
                },
                status: 'PENDING', // Only remind for pending
            },
            include: {
                kredi: {
                    include: {
                        kullanici: true
                    }
                }
            }
        });

        console.log(`Found ${installments.length} installments due.`);

        const results = [];

        for (const installment of installments) {
            const user = installment.kredi.kullanici;
            if (!user.email) continue;

            const res = await sendPaymentReminder(user.email, {
                userName: user.fullName || "Değerli Müşterimiz",
                bankName: installment.kredi.bankName,
                amount: `${installment.amount} ₺`,
                dueDate: installment.dueDate.toLocaleDateString("tr-TR"),
            });

            results.push({
                installmentId: installment.id,
                email: user.email,
                status: res.error ? 'failed' : 'sent',
                error: res.error
            });
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });

    } catch (error: any) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
