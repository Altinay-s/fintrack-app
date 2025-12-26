'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { CreditCard, Loader2 } from 'lucide-react'
import { payInstallment } from '@/actions/payment'
import { toast } from 'sonner'

interface PaymentButtonProps {
    installmentId: string
    amount: number
    bankName: string
}

export function PaymentButton({ installmentId, amount, bankName }: PaymentButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const handlePayment = async () => {
        setIsLoading(true)
        try {
            const result = await payInstallment(installmentId)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`${bankName} ödemesi başarıyla alındı.`)
            }
        } catch (error) {
            toast.error("Bir hata oluştu")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            size="sm"
            variant="outline"
            onClick={handlePayment}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <CreditCard className="mr-2 h-4 w-4" />
            )}
            Öde
        </Button>
    )
}
