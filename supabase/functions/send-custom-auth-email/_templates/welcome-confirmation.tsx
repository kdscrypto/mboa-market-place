import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface WelcomeConfirmationEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  username?: string
}

export const WelcomeConfirmationEmail = ({
  token_hash,
  supabase_url,
  email_action_type,
  redirect_to,
  username = 'Nouveau membre',
}: WelcomeConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>🎉 Bienvenue sur Mboa Market - Confirmez votre compte pour commencer à vendre !</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Text style={logoText}>🏪 Mboa Market</Text>
        </Section>
        
        <Heading style={h1}>🎉 Bienvenue {username} !</Heading>
        
        <Text style={welcomeText}>
          Félicitations ! Vous venez de rejoindre <strong>Mboa Market</strong>, la marketplace de confiance du Cameroun.
        </Text>

        <Section style={highlightBox}>
          <Text style={highlightText}>
            ✨ <strong>Confirmez votre compte maintenant</strong> et commencez à vendre gratuitement !
          </Text>
        </Section>

        <Section style={buttonContainer}>
          <Button
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            style={confirmButton}
          >
            🚀 Confirmer mon compte
          </Button>
        </Section>

        <Hr style={divider} />

        <Section style={benefitsSection}>
          <Heading style={h2}>🌟 Ce qui vous attend sur Mboa Market :</Heading>
          
          <Text style={benefitItem}>
            📝 <strong>Publication gratuite</strong> - Créez vos annonces sans frais
          </Text>
          <Text style={benefitItem}>
            👥 <strong>Audience qualifiée</strong> - Atteignez des milliers d'acheteurs potentiels
          </Text>
          <Text style={benefitItem}>
            💬 <strong>Messagerie intégrée</strong> - Communiquez directement avec vos clients
          </Text>
          <Text style={benefitItem}>
            ⚡ <strong>Mise en ligne rapide</strong> - Vos annonces visibles en quelques minutes
          </Text>
        </Section>

        <Section style={ctaSection}>
          <Text style={ctaText}>
            <strong>Prêt à commencer ?</strong> Après confirmation, vous pourrez immédiatement :
          </Text>
          <Text style={nextSteps}>
            1️⃣ Publier votre première annonce<br/>
            2️⃣ Ajouter des photos attractives<br/>
            3️⃣ Commencer à recevoir des messages d'acheteurs
          </Text>
        </Section>

        <Hr style={divider} />

        <Section style={supportSection}>
          <Text style={supportTitle}>💡 Besoin d'aide ?</Text>
          <Text style={supportText}>
            Notre équipe est là pour vous accompagner :<br/>
            📧 Email : support@mboamarket.com<br/>
            💬 WhatsApp : +237 6XX XXX XXX<br/>
          </Text>
        </Section>

        <Text style={footer}>
          Cet email a été envoyé par <strong>Mboa Market</strong><br/>
          Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default WelcomeConfirmationEmail

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const logoContainer = {
  textAlign: 'center' as const,
  padding: '20px 0',
}

const logoText = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ff6b35',
  margin: '0',
}

const h1 = {
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
}

const h2 = {
  color: '#374151',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '20px 0 16px',
}

const welcomeText = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 20px 24px',
}

const highlightBox = {
  backgroundColor: '#fef3e2',
  border: '2px solid #ff6b35',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 20px',
  textAlign: 'center' as const,
}

const highlightText = {
  color: '#dc2626',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const confirmButton = {
  backgroundColor: '#ff6b35',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
  border: 'none',
  cursor: 'pointer',
}

const benefitsSection = {
  margin: '32px 20px',
}

const benefitItem = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '12px 0',
}

const ctaSection = {
  backgroundColor: '#f3f4f6',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 20px',
}

const ctaText = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const nextSteps = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '1.8',
  textAlign: 'center' as const,
  margin: '0',
}

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 20px',
}

const supportSection = {
  margin: '24px 20px',
  textAlign: 'center' as const,
}

const supportTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
}

const supportText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '40px 20px 0',
}