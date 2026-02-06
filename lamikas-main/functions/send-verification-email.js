const { Resend } = require('resend');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const body = JSON.parse(event.body);
    const { email, code, firstName, lastName } = body;

    // Validate required fields
    if (!email || !code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email and verification code are required' })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email format' })
      };
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid verification code format' })
      };
    }

    // Initialize Resend with API key from environment variables
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Create email content
    const userName = firstName || 'User';
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : userName;
    
    const emailSubject = `Verify your LAMIKAS account - Your code: ${code}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your LAMIKAS Account</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(90deg, #1a365d 0%, #38b2ac 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .logo {
              font-size: 28px;
              font-weight: 800;
              margin-bottom: 10px;
            }
            .content {
              padding: 40px;
            }
            .greeting {
              font-size: 24px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #1a365d;
            }
            .message {
              font-size: 16px;
              color: #4a5568;
              margin-bottom: 30px;
            }
            .code-container {
              background-color: #bee3f8;
              border-radius: 12px;
              padding: 25px;
              text-align: center;
              margin: 30px 0;
              border: 2px solid #1a365d;
            }
            .code {
              font-size: 42px;
              font-weight: 800;
              letter-spacing: 10px;
              color: #1a365d;
              margin: 0;
              font-family: monospace;
            }
            .expiration {
              background-color: #fff5f5;
              border-radius: 8px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
              border-left: 4px solid #fc8181;
            }
            .expiration-title {
              font-weight: 600;
              color: #c53030;
              margin-bottom: 5px;
            }
            .expiration-time {
              font-size: 18px;
              font-weight: 700;
              color: #c53030;
            }
            .note {
              font-size: 14px;
              color: #718096;
              text-align: center;
              margin-top: 20px;
            }
            .footer {
              background-color: #f7fafc;
              padding: 25px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              color: #718096;
              font-size: 14px;
            }
            .step {
              display: flex;
              align-items: flex-start;
              margin-bottom: 15px;
              padding-bottom: 15px;
              border-bottom: 1px solid #e2e8f0;
            }
            .step-number {
              background-color: #1a365d;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              flex-shrink: 0;
            }
            .step-content {
              flex: 1;
            }
            .warning {
              background-color: #fff5f5;
              border-left: 4px solid #fc8181;
              padding: 15px;
              margin: 20px 0;
              font-size: 14px;
            }
            @media (max-width: 600px) {
              .content {
                padding: 20px;
              }
              .code {
                font-size: 32px;
                letter-spacing: 8px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">LAMIKAS</div>
              <div style="font-size: 18px; opacity: 0.9;">Property Management Platform</div>
            </div>
            
            <div class="content">
              <div class="greeting">Hi ${fullName},</div>
              
              <div class="message">
                Thank you for signing up for LAMIKAS! To complete your registration and start managing your properties, please verify your email address using the code below.
              </div>
              
              <div class="code-container">
                <p style="margin-top: 0; font-weight: 600; color: #2d3748;">Your verification code:</p>
                <h1 class="code">${code}</h1>
              </div>
              
              <div class="expiration">
                <div class="expiration-title">⏰ Code Expiration</div>
                <div class="expiration-time">This code expires in 15 minutes</div>
                <div style="font-size: 14px; margin-top: 5px;">
                  Generated at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                  Expires at ${new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <div class="note">
                Enter this code in the verification screen on LAMIKAS to complete your registration.
              </div>
              
              <div style="margin: 30px 0;">
                <div class="step">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <strong>Go back to LAMIKAS</strong><br>
                    Return to the verification screen in your browser
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <strong>Enter the code</strong><br>
                    Type the 6-digit code above into the verification fields
                  </div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <strong>Complete registration</strong><br>
                    Click verify and continue with the rest of your setup
                  </div>
                </div>
              </div>
              
              <div class="warning">
                <strong>Security notice:</strong> Never share this code with anyone. LAMIKAS will never ask for your verification code via phone, email, or text message.
              </div>
              
              <div class="note">
                If you didn't create a LAMIKAS account, you can safely ignore this email.
              </div>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} LAMIKAS. All rights reserved.</p>
              <p>Africa's most intuitive property management platform</p>
              <p style="margin-top: 15px; font-size: 12px; color: #a0aec0;">
                This email was sent to ${email}.<br>
                Need help? Contact our support team at support@lamikas.com
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailText = `
      Verify Your LAMIKAS Account
    
      Hi ${fullName},
    
      Thank you for signing up for LAMIKAS! To complete your registration and start managing your properties, please verify your email address using the code below.
    
      Your verification code: ${code}
    
      ⏰ Code Expiration
      This code expires in 15 minutes
      Generated at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      Expires at ${new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    
      Enter this code in the verification screen on LAMIKAS to complete your registration.
    
      Steps to verify:
      1. Go back to LAMIKAS
      2. Enter the 6-digit code above
      3. Complete registration
    
      Security notice: Never share this code with anyone. LAMIKAS will never ask for your verification code via phone, email, or text message.
    
      If you didn't create a LAMIKAS account, you can safely ignore this email.
    
      ---
      © ${new Date().getFullYear()} LAMIKAS. All rights reserved.
      Africa's most intuitive property management platform
      
      This email was sent to ${email}.
      Need help? Contact our support team at support@lamikas.com
    `;

    // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'LAMIKAS <no-reply@lamikas.com>',
      to: email,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      headers: {
        'X-Entity-Ref-ID': `verification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    });

    if (error) {
      console.error('Resend API error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to send verification email',
          details: error.message 
        })
      };
    }

    // Log success (remove in production or use proper logging)
    console.log(`Verification email sent to ${email}, code: ${code}, expires in 15 minutes, message ID: ${data.id}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        message: 'Verification email sent successfully',
        emailId: data.id,
        expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes from now
      })
    };

  } catch (error) {
    console.error('Error sending verification email:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
