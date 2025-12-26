/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Installment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Loan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reminder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "KullaniciRolu" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "KrediDurumu" AS ENUM ('ACTIVE', 'PAID', 'CLOSED', 'DEFAULTED');

-- CreateEnum
CREATE TYPE "TaksitDurumu" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "OdemeYontemi" AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'OTHER');

-- CreateEnum
CREATE TYPE "HatirlaticiTipi" AS ENUM ('EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "HatirlaticiDurumu" AS ENUM ('PENDING', 'SENT', 'DISMISSED');

-- CreateEnum
CREATE TYPE "HesapTipi" AS ENUM ('CASH', 'BANK_ACCOUNT', 'CREDIT_CARD', 'INVESTMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "IslemTipi" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "ButceDonemi" AS ENUM ('MONTHLY', 'YEARLY', 'ONE_TIME');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Budget" DROP CONSTRAINT "Budget_userId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_userId_fkey";

-- DropForeignKey
ALTER TABLE "Installment" DROP CONSTRAINT "Installment_loanId_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_bankId_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_userId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_installmentId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_installmentId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_loanId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_userId_fkey";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Bank";

-- DropTable
DROP TABLE "Budget";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Installment";

-- DropTable
DROP TABLE "Loan";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Reminder";

-- DropTable
DROP TABLE "Transaction";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "AccountType";

-- DropEnum
DROP TYPE "BudgetPeriod";

-- DropEnum
DROP TYPE "InstallmentStatus";

-- DropEnum
DROP TYPE "LoanStatus";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "ReminderStatus";

-- DropEnum
DROP TYPE "ReminderType";

-- DropEnum
DROP TYPE "TransactionType";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "Kullanici" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "fullName" TEXT,
    "companyName" TEXT,
    "role" "KullaniciRolu" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kullanici_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banka" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banka_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kredi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bankId" TEXT,
    "bankName" TEXT NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "monthlyInterestRate" DECIMAL(5,4) NOT NULL,
    "term" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "status" "KrediDurumu" NOT NULL DEFAULT 'ACTIVE',
    "remainingPrincipal" DECIMAL(15,2) NOT NULL,
    "description" TEXT,
    "pdfPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kredi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Taksit" (
    "id" TEXT NOT NULL,
    "loanId" TEXT NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "principalAmount" DECIMAL(15,2) NOT NULL,
    "interestAmount" DECIMAL(15,2) NOT NULL,
    "remainingPrincipal" DECIMAL(15,2) NOT NULL,
    "dueDate" DATE NOT NULL,
    "paidDate" DATE,
    "status" "TaksitDurumu" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Taksit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Odeme" (
    "id" TEXT NOT NULL,
    "installmentId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" "OdemeYontemi" NOT NULL DEFAULT 'BANK_TRANSFER',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Odeme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hatirlatici" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loanId" TEXT,
    "installmentId" TEXT,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "type" "HatirlaticiTipi" NOT NULL DEFAULT 'EMAIL',
    "status" "HatirlaticiDurumu" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hatirlatici_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hesap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "HesapTipi" NOT NULL DEFAULT 'CASH',
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hesap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "type" "IslemTipi" NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Islem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "type" "IslemTipi" NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Islem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Butce" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "period" "ButceDonemi" NOT NULL DEFAULT 'MONTHLY',
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Butce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kullanici_email_key" ON "Kullanici"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Banka_name_key" ON "Banka"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_userId_name_type_key" ON "Kategori"("userId", "name", "type");

-- AddForeignKey
ALTER TABLE "Kredi" ADD CONSTRAINT "Kredi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Kullanici"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kredi" ADD CONSTRAINT "Kredi_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Banka"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Taksit" ADD CONSTRAINT "Taksit_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Kredi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Odeme" ADD CONSTRAINT "Odeme_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "Taksit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hatirlatici" ADD CONSTRAINT "Hatirlatici_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Kullanici"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hatirlatici" ADD CONSTRAINT "Hatirlatici_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "Kredi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hatirlatici" ADD CONSTRAINT "Hatirlatici_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "Taksit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hesap" ADD CONSTRAINT "Hesap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Kullanici"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kategori" ADD CONSTRAINT "Kategori_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Kullanici"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Islem" ADD CONSTRAINT "Islem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Kullanici"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Islem" ADD CONSTRAINT "Islem_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Hesap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Islem" ADD CONSTRAINT "Islem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Butce" ADD CONSTRAINT "Butce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Kullanici"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Butce" ADD CONSTRAINT "Butce_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
