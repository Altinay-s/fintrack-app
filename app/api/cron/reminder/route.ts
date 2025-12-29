
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

        // CHECK DAILY LIMIT
        const MAX_DAILY_EMAILS = 5;
        const sentTodayCount = await prisma.hatirlatici.count({
            where: {
                type: 'EMAIL',
                status: 'SENT',
                createdAt: {
                    gte: startOfDay(new Date()),
                }
            }
        });

        console.log(`Emails sent today so far: ${sentTodayCount}`);

        if (sentTodayCount >= MAX_DAILY_EMAILS) {
            console.log('Daily email limit previously reached.');
            return NextResponse.json({
                success: true,
                message: 'Daily email limit reached',
                processed: 0,
                results: []
            });
        }

        const results = [];
        let emailsSentThisSession = 0;

        for (const installment of installments) {
            const user = installment.kredi.kullanici;
            if (!user.email) continue;

            // Check if we already sent a reminder for this installment today
            const alreadySent = await prisma.hatirlatici.findFirst({
                where: {
                    installmentId: installment.id,
                    type: 'EMAIL',
                    status: 'SENT',
                    createdAt: {
                        gte: startOfDay(new Date()), // Sent today
                    }
                }
            });

            if (alreadySent) {
                console.log(`Reminder already sent for installment ${installment.id} today.`);
                continue;
            }

            // Check limit again inside loop
            if (sentTodayCount + emailsSentThisSession >= MAX_DAILY_EMAILS) {
                console.log('Daily email limit reached during processing session.');
                break;
            }

            const res = await sendPaymentReminder(user.email, {
                userName: user.fullName || "Değerli Müşterimiz",
                bankName: installment.kredi.bankName,
                amount: `${installment.amount} ₺`,
                dueDate: installment.dueDate.toLocaleDateString("tr-TR"),
            });

            if (!res.error) {
                emailsSentThisSession++;
            }

            // Log the reminder in DB
            await prisma.hatirlatici.create({
                data: {
                    userId: user.id,
                    loanId: installment.loanId,
                    installmentId: installment.id,
                    remindAt: new Date(),
                    type: 'EMAIL',
                    status: res.error ? 'PENDING' : 'SENT', // If failed, maybe retry later? For now mark PENDING or FAILED
                    message: res.error || "Otomatik hatırlatma gönderildi"
                }
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
