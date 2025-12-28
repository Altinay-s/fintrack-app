
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'altinaysuleyman43@gmail.com'
    console.log(`Checking DB for: ${email}`)

    const user = await prisma.kullanici.findUnique({
        where: { email: email }
    })

    if (user) {
        console.log('User FOUND:')
        console.log(`ID: ${user.id}`)
        console.log(`Email: ${user.email}`)
        console.log(`Name: ${user.fullName}`)
    } else {
        console.log('User NOT FOUND.')
    }

    // Check loan count
    if (user) {
        const loans = await prisma.kredi.count({ where: { userId: user.id } })
        console.log(`Loans count: ${loans}`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
