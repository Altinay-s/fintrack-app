'use client'

import { createLoan } from '@/actions/create-loan'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TURKISH_BANKS } from '@/lib/constants'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function CreateLoanForm() {
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const res = await createLoan(formData)
        setLoading(false)
        if (res?.error) {
            alert(res.error)
        } else {
            // Optional: window.location.reload() or toast
            // For now simple alert
            // alert('Kredi oluşturuldu!')
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4 border p-4 rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-bold">Yeni Kredi Ekle</h3>

            {/* File Upload Zone (Visual Only) */}
            <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => alert("Bu özellik yakında aktif olacak! (PDF AI Parsing)")}
            >
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary h-6 w-6"
                    >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                </div>
                <p className="text-sm font-medium">
                    Kredi ödeme planınızı (PDF) buraya sürükleyin
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    Yapay Zeka otomatik doldursun (Yakında)
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="bankName">Banka Adı</Label>
                    <Select name="bankName" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Banka seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            {TURKISH_BANKS.map((bank) => (
                                <SelectItem key={bank} value={bank}>
                                    {bank}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="totalAmount">Toplam Tutar</Label>
                    <Input name="totalAmount" id="totalAmount" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="interestRate">Faiz Oranı (%)</Label>
                    <Input name="interestRate" id="interestRate" type="number" step="0.01" placeholder="0.00" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="installmentCount">Taksit Sayısı</Label>
                    <Input name="installmentCount" id="installmentCount" type="number" placeholder="12" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                    <Input name="startDate" id="startDate" type="date" required />
                </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Oluşturuluyor...' : 'Kredi Oluştur'}
            </Button>
        </form>
    )
}
