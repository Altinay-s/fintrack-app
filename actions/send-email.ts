'use server'

import { resend } from '@/lib/resend'
import PaymentReminderEmail from '@/components/emails/payment-reminder'
import { createClient } from '@/utils/supabase/server'

export async function sendPaymentReminder(
    email: string,
    loanDetails: {
        userName: string
        bankName: string
        amount: string
        dueDate: string
    }
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Unauthorized' }
        }

        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email, // In production, verify domain or use your own
            subject: `Hatırlatma: ${loanDetails.bankName} Ödemesi Yarın`,
            react: PaymentReminderEmail({
                userName: loanDetails.userName,
                bankName: loanDetails.bankName,
                amount: loanDetails.amount,
                dueDate: loanDetails.dueDate,
            }),
        })

        if (error) {
            console.error('Resend error:', error)
            return { error: error.message }
        }

        return { success: true, data }
    } catch (e: any) {
        console.error('Server action error:', e)
        return { error: e.message }
    }
}
