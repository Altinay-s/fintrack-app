import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface PaymentReminderEmailProps {
    userName?: string;
    bankName?: string;
    amount?: string;
    dueDate?: string;
}

export default function PaymentReminderEmail({
    userName = 'Değerli Kullanıcımız',
    bankName = 'Banka',
    amount = '0,00 ₺',
    dueDate = 'Bugün',
}: PaymentReminderEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Ödeme Hatırlatması: {bankName} krediniz için yarın ödeme günü.</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>FinTrack</Heading>
                    <Text style={paragraph}>Sayın {userName},</Text>
                    <Text style={paragraph}>
                        Bu e-posta, <strong>{bankName}</strong> kredinize ait yaklaşan taksit ödemenizi hatırlatmak amacıyla gönderilmiştir.
                    </Text>
                    <Section style={payoutSection}>
                        <Text style={payoutText}>Ödenecek Tutar</Text>
                        <Heading style={payoutAmount}>{amount}</Heading>
                        <Text style={payoutDate}>Son Ödeme Tarihi: {dueDate}</Text>
                    </Section>
                    <Text style={paragraph}>
                        Ödemenizi zamanında yaparak kredi puanınızı koruyabilir ve gecikme faizinden kaçınabilirsiniz.
                    </Text>
                    <Section style={{ textAlign: 'center' }}>
                        <Button style={button} href="http://localhost:3000">
                            Detayları Gör
                        </Button>
                    </Section>
                    <Hr style={hr} />
                    <Text style={footer}>
                        FinTrack - Finansal Takip Asistanınız
                        <br />
                        İstanbul, Türkiye
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
};

const heading = {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '700',
    color: '#484848',
    padding: '17px 0 0',
    textAlign: 'center' as const,
};

const paragraph = {
    margin: '0 0 15px',
    fontSize: '15px',
    lineHeight: '1.4',
    color: '#3c4149',
    padding: '0 24px',
};

const payoutSection = {
    backgroundColor: '#f4f7fa',
    padding: '24px',
    borderRadius: '8px',
    margin: '20px 24px',
    textAlign: 'center' as const,
};

const payoutText = {
    margin: '0',
    color: '#6b7280',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
};

const payoutAmount = {
    margin: '10px 0',
    color: '#111827',
    fontSize: '32px',
    fontWeight: '700',
};

const payoutDate = {
    margin: '0',
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '500',
};

const button = {
    backgroundColor: '#000000',
    borderRadius: '5px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    width: '200px',
    padding: '12px',
    margin: '0 auto',
};

const hr = {
    borderColor: '#dfe1e4',
    margin: '42px 0 26px',
};

const footer = {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#9ca299',
    textAlign: 'center' as const,
};
