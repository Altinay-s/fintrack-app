'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sendPaymentReminder } from "@/actions/send-email"
import { toast } from "sonner"
import { useState } from "react"
import { Loader2, Mail } from "lucide-react"

export function NotificationTest({ userEmail }: { userEmail: string | null }) {
    const [loading, setLoading] = useState(false)

    const handleSendTest = async () => {
        if (!userEmail) {
            toast.error("Kullanıcı e-postası bulunamadı.")
            return
        }

        setLoading(true)
        const toastId = toast.loading("E-posta gönderiliyor...")

        try {
            const res = await sendPaymentReminder(userEmail, {
                userName: "Sayın Kullanıcı",
                bankName: "Akbank - Test Kredisi",
                amount: "15.000,00 ₺",
                dueDate: "20 Aralık 2024"
            })

            if (res.error) {
                toast.error(`Hata: ${res.error}`, { id: toastId })
            } else {
                toast.success("Test maili başarıyla gönderildi!", { id: toastId })
            }
        } catch (error) {
            toast.error("Beklenmedik bir hata oluştu.", { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-indigo-100 dark:border-indigo-900/50">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 w-fit rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        <Mail className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle>Bildirim Testi</CardTitle>
                        <CardDescription>
                            E-posta bildirim sisteminizin doğru çalışıp çalışmadığını test edin.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-dashed">
                    <div className="space-y-1 text-center sm:text-left">
                        <p className="text-sm font-medium">Test Alıcısı: <span className="text-foreground">{userEmail || "Tanımlanmamış"}</span></p>
                        <p className="text-xs text-muted-foreground">Butona tıkladığınızda bu adrese örnek bir ödeme hatırlatması gönderilecektir.</p>
                    </div>
                    <Button
                        onClick={handleSendTest}
                        disabled={loading || !userEmail}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Gönderiliyor...
                            </>
                        ) : (
                            "Test Maili Gönder"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
