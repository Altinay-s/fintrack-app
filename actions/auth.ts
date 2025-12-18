'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { headers } from 'next/headers'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect('/login?message=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const companyName = formData.get('companyName') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        return redirect(`/login?message=${encodeURIComponent(error.message)}`)
    }

    // Try to create the user record if we have an ID (immediate sync attempt)
    // Note: In a real Supabase flow, you often use a Trigger for this.
    // If Supabase confirms the user immediately (no email confirm), we can write to DB here.
    if (data.user) {
        // We'll trust that the user is created in Supabase Auth, so we add to our DB.
        // If email confirmation is required, this might be better in a Trigger or Webhook,
        // but for this MVP, we'll optimistically create it or let the user complete it later?
        // Actually, let's just create it. Our Prisma schema allows unverified users.
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()

        try {
            await prisma.user.create({
                data: {
                    id: data.user.id, // Important: Sync IDs
                    email: email,
                    companyName: companyName,
                }
            })
        } catch (e) {
            console.error("Failed to create user record:", e)
            // Continue anyway, maybe handle duplicates or trigger logic
        } finally {
            await prisma.$disconnect()
        }
    }

    return redirect('/login?message=Check email to continue sign in process')
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
