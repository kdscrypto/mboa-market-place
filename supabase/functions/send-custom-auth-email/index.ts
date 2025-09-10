import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import React from 'npm:react@18.3.1'
import { WelcomeConfirmationEmail } from './_templates/welcome-confirmation.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Custom auth email function called');
    
    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method);
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const payload = await req.text()
    console.log('📧 Received webhook payload');

    // If no hook secret is configured, we'll handle this as a direct call
    let webhookData;
    
    if (hookSecret) {
      // Handle as Supabase webhook
      const headers = Object.fromEntries(req.headers)
      const wh = new Webhook(hookSecret)
      
      try {
        webhookData = wh.verify(payload, headers) as {
          user: {
            email: string
            user_metadata?: {
              username?: string
            }
          }
          email_data: {
            token: string
            token_hash: string
            redirect_to: string
            email_action_type: string
            site_url: string
          }
        }
      } catch (error) {
        console.log('❌ Webhook verification failed:', error);
        return new Response('Webhook verification failed', { status: 401, headers: corsHeaders });
      }
    } else {
      // Handle as direct API call
      try {
        webhookData = JSON.parse(payload);
      } catch (error) {
        console.log('❌ JSON parsing failed:', error);
        return new Response('Invalid JSON payload', { status: 400, headers: corsHeaders });
      }
    }

    const { user, email_data } = webhookData;
    const { token, token_hash, redirect_to, email_action_type } = email_data;
    
    console.log('👤 Processing email for user:', user.email);
    console.log('📝 Email action type:', email_action_type);

    // Only send custom emails for signup confirmations
    if (email_action_type !== 'signup') {
      console.log('⏭️ Skipping non-signup email');
      return new Response(JSON.stringify({ message: 'Email type not handled by custom function' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Extract username from user metadata
    const username = user.user_metadata?.username || 'Nouveau membre';
    
    console.log('🎨 Rendering email template...');
    
    // Render the React email template
    const html = await renderAsync(
      React.createElement(WelcomeConfirmationEmail, {
        supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
        token,
        token_hash,
        redirect_to: redirect_to || `${Deno.env.get('SUPABASE_URL')}/`,
        email_action_type,
        username,
      })
    )

    console.log('📨 Sending email via Resend...');

    // Send the email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Mboa Market <onboarding@resend.dev>', // TODO: Update with your verified domain
      to: [user.email],
      subject: '🎉 Bienvenue sur Mboa Market - Confirmez votre compte !',
      html,
    })

    if (error) {
      console.error('❌ Resend error:', error);
      throw error;
    }

    console.log('✅ Email sent successfully:', data);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Custom confirmation email sent successfully',
      email_id: data?.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('💥 Error in send-custom-auth-email function:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Unknown error occurred',
          code: error.code || 'UNKNOWN_ERROR'
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
}

serve(handler);