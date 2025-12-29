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
import { useRef, useState, DragEvent, ChangeEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CreateLoanForm() {
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // State for form fields to allow auto-fill
    const [formData, setFormData] = useState({
        bankName: "",
        totalAmount: "",
        interestRate: "",
        installmentCount: "",
        startDate: new Date().toISOString().split('T')[0]
    })

    const handleDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0])
        }
    }

    const handleFileSelection = (selectedFile: File) => {
        setFile(selectedFile)

        // MOCK PARSING LOGIC FOR DEMO
        const name = selectedFile.name.toLowerCase()

        let newData = { ...formData }
        let matched = false

        if (name.includes('garanti')) {
            newData = { bankName: 'Garanti BBVA', totalAmount: '75000', interestRate: '3.99', installmentCount: '12', startDate: '2024-08-20' }
            matched = true
        } else if (name.includes('ziraat')) {
            newData = { bankName: 'Ziraat Bankası', totalAmount: '1850000', interestRate: '1.29', installmentCount: '120', startDate: '2023-10-01' }
            matched = true
        } else if (name.includes('is_bank') || name.includes('iş')) {
            newData = { bankName: 'İş Bankası', totalAmount: '350000', interestRate: '2.85', installmentCount: '24', startDate: '2024-09-15' }
            matched = true
        } else if (name.includes('akbank')) {
            newData = { bankName: 'Akbank', totalAmount: '25000', interestRate: '4.15', installmentCount: '6', startDate: '2024-11-10' }
            matched = true
        } else if (name.includes('qnb') || name.includes('finans')) {
            newData = { bankName: 'QNB Finansbank', totalAmount: '15000', interestRate: '3.50', installmentCount: '6', startDate: '2024-07-05' }
            matched = true
        } else if (name.includes('fiba')) {
            newData = { bankName: 'Fibabanka', totalAmount: '50000', interestRate: '3.19', installmentCount: '12', startDate: '2024-09-01' }
            matched = true
        }

        if (matched) {
            setFormData(newData)
            toast.success("Yapay zeka dosyayı analiz etti ve formu doldurdu!", {
                description: `${newData.bankName} panı algılandı.`
            })
        } else {
            toast.info("Dosya yüklendi.", {
                description: "Demo Modu: Otomatik tanıma için dosya isminde banka adı geçmelidir (örn: 'fibabanka_plan.pdf')."
            })
        }
    }

    const handleDivClick = () => {
        inputRef.current?.click()
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const submitData = new FormData()
        submitData.append('bankName', formData.bankName)
        submitData.append('totalAmount', formData.totalAmount)
        submitData.append('interestRate', formData.interestRate)
        submitData.append('installmentCount', formData.installmentCount)
        submitData.append('startDate', formData.startDate)
        if (file) {
            submitData.append('pdfFile', file)
        }

        const res = await createLoan(submitData)
        setLoading(false)
        if (res?.error) {
            toast.error("Hata", { description: res.error })
        } else {
            toast.success("Başarılı", { description: "Kredi kaydı oluşturuldu." })
            // Reload after short delay to show toast
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg bg-card text-card-foreground shadow-sm">
            <h3 className="text-lg font-bold">Yeni Kredi Ekle</h3>

            {/* File Upload Zone */}
            <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:bg-muted/50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleDivClick}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleChange}
                    name="pdfFile"
                />
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary h-6 w-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                </div>
                <p className="text-sm font-medium">
                    {file ? file.name : "Kredi ödeme planınızı (PDF) buraya sürükleyin"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {file ? "AI Analizi Tamamlandı ✅" : "Yapay zeka ile otomatik doldurma"}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="bankName">Banka Adı</Label>
                    <Select
                        value={formData.bankName}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, bankName: val }))}
                        required
                    >
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
                    <Input
                        name="totalAmount"
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        value={formData.totalAmount}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="interestRate">Faiz Oranı (%)</Label>
                    <Input
                        name="interestRate"
                        id="interestRate"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        required
                        value={formData.interestRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="installmentCount">Taksit Sayısı</Label>
                    <Input
                        name="installmentCount"
                        id="installmentCount"
                        type="number"
                        placeholder="12"
                        required
                        value={formData.installmentCount}
                        onChange={(e) => setFormData(prev => ({ ...prev, installmentCount: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                    <Input
                        name="startDate"
                        id="startDate"
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Oluşturuluyor...' : 'Kredi Oluştur'}
            </Button>
        </form>
    )
}
