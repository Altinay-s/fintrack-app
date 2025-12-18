import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signup } from '@/actions/auth'

export default function SignupPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
                    <CardDescription>
                        FinTrack'a başlamak için bilgilerinizi girin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={signup} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-posta</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@ornek.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="companyName">Şirket Adı</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                type="text"
                                placeholder="Şirketiniz A.Ş."
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Şifre</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                            Hesap Oluştur
                        </Button>
                        {/* <Button variant="outline" className="w-full">
              Google ile Kayıt Ol
            </Button> */}
                        <div className="mt-4 text-center text-sm">
                            Zaten hesabınız var mı?{' '}
                            <Link href="/login" className="underline">
                                Giriş Yap
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
