'use client'

import { updateProfile } from "@/actions/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2, User as UserIcon } from "lucide-react"
import { toast } from "sonner"

interface ProfileFormProps {
    initialData: {
        fullName: string | null
        companyName: string | null
    }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await updateProfile(formData)
        setLoading(false)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Profil başarıyla güncellendi")
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle>Profil Bilgileri</CardTitle>
                        <CardDescription>
                            Kişisel ve firma bilgilerinizi buradan düzenleyebilirsiniz.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Ad Soyad</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="Adınız Soyadınız"
                                defaultValue={initialData.fullName || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="companyName">Firma Adı</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                placeholder="Firma Adınız"
                                defaultValue={initialData.companyName || ''}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Kaydet
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
