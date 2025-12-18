import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '@/actions/auth'

export default function LoginPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="mx-auto max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Giriş Yap</CardTitle>
                    <CardDescription>
                        Hesabınıza erişmek için e-postanızı girin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={login} className="grid gap-4">
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
                            <div className="flex items-center">
                                <Label htmlFor="password">Şifre</Label>
                                {/* <Link href="#" className="ml-auto inline-block text-sm underline">
                  Şifrenizi mi unuttuz?
                </Link> */}
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">
                            Giriş Yap
                        </Button>
                        <div className="mt-4 text-center text-sm">
                            Hesabınız yok mu?{' '}
                            <Link href="/signup" className="underline">
                                Kayıt Ol
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
