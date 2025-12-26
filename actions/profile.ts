'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const fullName = formData.get('fullName') as string
    const companyName = formData.get('companyName') as string

    try {
        await prisma.kullanici.update({
            where: { id: user.id },
            data: {
                fullName,
                companyName
            }
        })

        revalidatePath('/settings')
        return { success: true }
    } catch (error) {
        console.error('Profile update error:', error)
        return { error: 'Failed to update profile' }
    }
}
