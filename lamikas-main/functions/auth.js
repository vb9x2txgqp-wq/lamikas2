const { createClient } = require('@supabase/supabase-js');
const SecurityUtils = require('./security');

function getSupabaseClient(token = null) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = token ? process.env.SUPABASE_ANON_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  if (token) {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

exports.handler = async function(event, context) {
  const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  
  // Rate limiting check
  if (!await SecurityUtils.checkRateLimit(clientIP)) {
    return {
      statusCode: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      },
      body: JSON.stringify({ error: 'Too many requests. Please try again later.' })
    };
  }

  const headers = {
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || 'https://lamikas.com',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const adminSupabase = getSupabaseClient();
    
    switch (event.httpMethod) {
      case 'GET':
        const token = event.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'No authorization token' })
          };
        }

        const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token);
        
        if (authError || !user) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid token' })
          };
        }

        const userSupabase = getSupabaseClient(token);
        const { data: profile, error: profileError } = await userSupabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          const { data: newProfile, error: createError } = await adminSupabase
            .from('users')
            .insert([{
              id: user.id,
              email: user.email,
              full_name: SecurityUtils.sanitizeInput(user.user_metadata?.full_name || 'User'),
              company_name: SecurityUtils.sanitizeInput(user.user_metadata?.company_name || ''),
              phone: SecurityUtils.sanitizeInput(user.user_metadata?.phone || ''),
              country_code: SecurityUtils.sanitizeInput(user.user_metadata?.country_code || '+1'),
              plan_type: SecurityUtils.sanitizeInput(user.user_metadata?.plan_type || 'starter'),
              payment_type: SecurityUtils.sanitizeInput(user.user_metadata?.payment_type || 'free-trial'),
              user_type: SecurityUtils.sanitizeInput(user.user_metadata?.user_type || 'landlord'),
              units_managed: SecurityUtils.sanitizeInput(user.user_metadata?.units_managed || ''),
              main_challenge: SecurityUtils.sanitizeInput(user.user_metadata?.main_challenge || ''),
              max_properties: user.user_metadata?.max_properties || 5,
              created_at: new Date().toISOString()
            }])
            .select()
            .single();
          
          if (createError) {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Failed to create profile' })
            };
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ user, profile: newProfile })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ user, profile })
        };

      case 'POST':
        // CSRF token validation for state-changing operations
        const csrfToken = event.headers['x-csrf-token'];
        const expectedCSRFToken = event.headers.cookie?.match(/csrf_token=([^;]+)/)?.[1];
        
        if (!SecurityUtils.validateCSRFToken(csrfToken, expectedCSRFToken)) {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Invalid CSRF token' })
          };
        }

        let body;
        try {
          body = JSON.parse(event.body || '{}');
          body = SecurityUtils.sanitizeObject(body);
        } catch (parseError) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid JSON format' })
          };
        }
        
        const { action } = body;

        switch (action) {
          case 'login':
            const { email, password } = body;
            
            if (!email || !password) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email and password required' })
              };
            }

            if (!SecurityUtils.validateEmail(email)) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid email format' })
              };
            }

            // Additional rate limiting for login attempts
            const loginLimiterKey = `login_${clientIP}`;
            if (!await SecurityUtils.checkRateLimit(loginLimiterKey)) {
              return {
                statusCode: 429,
                headers: { 'Retry-After': '300' },
                body: JSON.stringify({ error: 'Too many login attempts. Please try again later.' })
              };
            }

            const { data: session, error: loginError } = await adminSupabase.auth.signInWithPassword({
              email,
              password
            });

            if (loginError) {
              return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid credentials' }) // Generic error message
              };
            }

            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ session })
            };

          case 'register':
            const { 
              email: regEmail, 
              password: regPassword, 
              firstName,
              lastName,
              userType,
              unitCount,
              challenge,
              selectedPlan,
              paymentType,
              phone,
              countryCode,
              countryName
            } = body;
            
            // Validate all required fields
            if (!regEmail || !regPassword || !firstName || !lastName || !selectedPlan) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Required fields missing' })
              };
            }

            if (!SecurityUtils.validateEmail(regEmail)) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid email format' })
              };
            }

            if (phone && !SecurityUtils.validatePhone(phone)) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid phone number format' })
              };
            }

            // Password strength validation
            if (regPassword.length < 8) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Password must be at least 8 characters long' })
              };
            }

            const planLimits = {
              'starter': 5,
              'essential': 20,
              'professional': 50,
              'business': 100
            };
            
            const maxProperties = planLimits[selectedPlan] || 5;

            const { data: newUser, error: signupError } = await adminSupabase.auth.signUp({
              email: regEmail,
              password: regPassword,
              options: {
                data: {
                  full_name: `${SecurityUtils.sanitizeInput(firstName)} ${SecurityUtils.sanitizeInput(lastName)}`,
                  first_name: SecurityUtils.sanitizeInput(firstName),
                  last_name: SecurityUtils.sanitizeInput(lastName),
                  user_type: SecurityUtils.sanitizeInput(userType),
                  units_managed: SecurityUtils.sanitizeInput(unitCount),
                  main_challenge: SecurityUtils.sanitizeInput(challenge),
                  plan_type: SecurityUtils.sanitizeInput(selectedPlan),
                  payment_type: SecurityUtils.sanitizeInput(paymentType),
                  phone: SecurityUtils.sanitizeInput(phone),
                  country_code: SecurityUtils.sanitizeInput(countryCode),
                  country_name: SecurityUtils.sanitizeInput(countryName),
                  max_properties: maxProperties,
                  email_verified: false,
                  trial_start: new Date().toISOString(),
                  trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                }
              }
            });

            if (signupError) {
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Registration failed. Please try again.' })
              };
            }

            const { error: profileCreateError } = await adminSupabase
              .from('users')
              .insert([{
                id: newUser.user.id,
                email: regEmail,
                first_name: SecurityUtils.sanitizeInput(firstName),
                last_name: SecurityUtils.sanitizeInput(lastName),
                full_name: `${SecurityUtils.sanitizeInput(firstName)} ${SecurityUtils.sanitizeInput(lastName)}`,
                user_type: SecurityUtils.sanitizeInput(userType),
                units_managed: SecurityUtils.sanitizeInput(unitCount),
                main_challenge: SecurityUtils.sanitizeInput(challenge),
                plan_type: SecurityUtils.sanitizeInput(selectedPlan),
                payment_type: SecurityUtils.sanitizeInput(paymentType),
                phone: SecurityUtils.sanitizeInput(phone),
                country_code: SecurityUtils.sanitizeInput(countryCode),
                country_name: SecurityUtils.sanitizeInput(countryName),
                max_properties: maxProperties,
                current_properties: 0,
                trial_active: paymentType === 'free-trial',
                trial_start: new Date().toISOString(),
                trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);

            if (profileCreateError) {
              console.error('Profile creation error:', profileCreateError);
              return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to create user profile' })
              };
            }

            return {
              statusCode: 201,
              headers,
              body: JSON.stringify({ 
                user: newUser.user,
                message: 'Registration successful!',
                autoLogin: true
              })
            };

          case 'logout':
            const logoutToken = event.headers.authorization?.replace('Bearer ', '');
            if (logoutToken) {
              await adminSupabase.auth.signOut();
            }
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ success: true })
            };

          default:
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ error: 'Invalid action' })
            };
        }

      case 'PUT':
        const putToken = event.headers.authorization?.replace('Bearer ', '');
        
        if (!putToken) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'No authorization token' })
          };
        }

        const { data: { user: putUser }, error: putAuthError } = await adminSupabase.auth.getUser(putToken);
        
        if (putAuthError || !putUser) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Invalid token' })
          };
        }

        const putUserSupabase = getSupabaseClient(putToken);
        let putBody;
        try {
          putBody = JSON.parse(event.body || '{}');
          putBody = SecurityUtils.sanitizeObject(putBody);
        } catch (parseError) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid JSON format' })
          };
        }
        
        // Prevent ID and email modification
        delete putBody.id;
        delete putBody.email;
        
        // Validate phone if provided
        if (putBody.phone && !SecurityUtils.validatePhone(putBody.phone)) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Invalid phone number format' })
          };
        }

        const { data: updatedProfile, error: updateError } = await putUserSupabase
          .from('users')
          .update({
            ...putBody,
            updated_at: new Date().toISOString()
          })
          .eq('id', putUser.id)
          .select()
          .single();

        if (updateError) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to update profile' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(updatedProfile)
        };

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
