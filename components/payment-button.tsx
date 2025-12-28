'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from 'lucide-react'
import { payInstallment } from '@/actions/payment'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { BANK_URLS } from '@/lib/constants'

interface PaymentButtonProps {
    installmentId: string
    amount: number
    bankName: string
}

export function PaymentButton({ installmentId, amount, bankName }: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const handlePayment = async () => {
        setIsLoading(true)
        try {
            // Open bank URL in new tab
            const bankUrl = BANK_URLS[bankName] || "https://www.google.com/search?q=" + encodeURIComponent(bankName)
            window.open(bankUrl, '_blank')

            // Process payment in background
            const result = await payInstallment(installmentId)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`${bankName} ödemesi başarıyla alındı.`)
                setOpen(false)
            }
        } catch (error) {
            toast.error("Bir hata oluştu")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Öde
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Ödeme İşlemi</AlertDialogTitle>
                    <AlertDialogDescription>
                        {bankName} bankasına yönlendirileceksiniz. Ödeme işleminizi tamamladıktan sonra sistemimizdeki kayıt otomatik olarak güncellenecektir.
                        <br /><br />
                        Devam etmek istiyor musunuz?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>İptal</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => {
                        e.preventDefault()
                        handlePayment()
                    }}>
                        Ödeme Yap & Bankaya Git
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
