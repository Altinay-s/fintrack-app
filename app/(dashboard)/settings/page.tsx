
import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationTest } from './notification-test'
import { ProfileForm } from './profile-form'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    let userData = await prisma.kullanici.findUnique({
        where: { id: user.id },
        select: {
            email: true,
            fullName: true,
            companyName: true
        }
    })

    // Self-healing: Ensure Prisma record exists and matches Supabase Auth ID
    if (!userData && user.email) {
        try {
            // Check if ANY user exists with this email (orphan from seed?)
            const existingUserByEmail = await prisma.kullanici.findUnique({
                where: { email: user.email },
                select: { id: true }
            })

            if (existingUserByEmail && existingUserByEmail.id !== user.id) {
                console.log(`Mismatch detected! Deleting orphan user ${existingUserByEmail.id} directly to reclaim email ${user.email}`)
                // Delete the old mismatched user (Cascade will delete their loans/installments)
                await prisma.kullanici.delete({
                    where: { id: existingUserByEmail.id }
                })
            }

            // Now safe to create (or re-fetch if created in parallel)
            userData = await prisma.kullanici.create({
                data: {
                    id: user.id,
                    email: user.email,
                    fullName: user.user_metadata?.full_name || '',
                    companyName: user.user_metadata?.company_name || '',
                },
                select: {
                    email: true,
                    fullName: true,
                    companyName: true
                }
            })
        } catch (error) {
            console.error("Error syncing user record:", error)
            // Fallback: If create failed (race condition?), try fetching one last time
            userData = await prisma.kullanici.findUnique({
                where: { id: user.id },
                select: { email: true, fullName: true, companyName: true }
            })
        }
    }

    if (!userData) {
        return <div>Kullanıcı bulunamadı. Lütfen çıkış yapıp tekrar deneyin.</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
                <p className="text-muted-foreground">Hesap ve uygulama ayarlarınızı yönetin.</p>
            </div>

            <div className="grid gap-6">
                <ProfileForm initialData={userData} />
                <NotificationTest userEmail={userData.email} />
            </div>
        </div>
    )
}
