'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, BellRing } from 'lucide-react'
import { toast } from "sonner"

export function ManualReminderTrigger() {
    const [isLoading, setIsLoading] = useState(false)

    const handleTrigger = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/cron/reminder')
            const data = await response.json()

            if (response.ok) {
                toast.success("Hatırlatıcı servisi tetiklendi", {
                    description: `${data.processed} adet hatırlatma işlendi.`
                })
            } else {
                toast.error("Hata oluştu", {
                    description: data.error || "Servis tetiklenemedi."
                })
            }
        } catch (error) {
            toast.error("Bağlantı hatası", {
                description: "Sunucuya erişilemedi."
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manuel Hatırlatma Tetikleyici</CardTitle>
                <CardDescription>
                    Otomatik hatırlatma servisini manuel olarak çalıştırın. Bu işlem, vadesi "Yarın" olan ödemeler için mail gönderir.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    onClick={handleTrigger}
                    disabled={isLoading}
                    variant="secondary"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            İşleniyor...
                        </>
                    ) : (
                        <>
                            <BellRing className="mr-2 h-4 w-4" />
                            Ödemeleri Şimdi Kontrol Et
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}
