import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import pool from '../config/database';

// Only initialize Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    const name = profile.displayName;
                    const avatar = profile.photos?.[0]?.value;
                    const googleId = profile.id;

                    if (!email) {
                        return done(new Error('No email found from Google'), undefined);
                    }

                    // Check if user exists in public_users
                    let userResult = await pool.query(
                        'SELECT * FROM public_users WHERE email = $1 AND deleted_at IS NULL',
                        [email]
                    );

                    let user;

                    if (userResult.rows.length > 0) {
                        // User exists, update google_id and avatar if needed
                        user = userResult.rows[0];
                        await pool.query(
                            'UPDATE public_users SET google_id = $1, avatar = $2 WHERE id = $3',
                            [googleId, avatar, user.id]
                        );
                    } else {
                        // Create new user
                        const insertResult = await pool.query(
                            `INSERT INTO public_users (email, full_name, avatar, google_id, is_verified, created_at)
                             VALUES ($1, $2, $3, $4, true, NOW())
                             RETURNING *`,
                            [email, name, avatar, googleId]
                        );
                        user = insertResult.rows[0];

                        // Tự động gán quyền USER cho người dùng mới
                        const userRoleResult = await pool.query(`
                            SELECT id FROM roles WHERE name = 'USER' LIMIT 1
                        `);

                        if (userRoleResult.rows.length > 0) {
                            const userRoleId = userRoleResult.rows[0].id;
                            await pool.query(`
                                INSERT INTO user_roles (user_id, role_id, assigned_at)
                                VALUES ($1, $2, NOW())
                                ON CONFLICT (user_id, role_id) DO NOTHING
                            `, [user.id, userRoleId]);
                        }
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error, undefined);
                }
            }
        )
    );
    console.log('✅ Google OAuth strategy initialized');
} else {
    console.log('⚠️  Google OAuth disabled - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// Only initialize Facebook OAuth if credentials are provided
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5000/api/auth/facebook/callback',
                profileFields: ['id', 'displayName', 'emails', 'photos'],
            },
            async (_accessToken, _refreshToken, profile, done) => {
                try {
                    const email = profile.emails?.[0]?.value;
                    const name = profile.displayName;
                    const avatar = profile.photos?.[0]?.value;
                    const facebookId = profile.id;

                    if (!email) {
                        return done(new Error('No email found from Facebook'), undefined);
                    }

                    // Check if user exists in public_users
                    let userResult = await pool.query(
                        'SELECT * FROM public_users WHERE email = $1 AND deleted_at IS NULL',
                        [email]
                    );

                    let user;

                    if (userResult.rows.length > 0) {
                        // User exists, update facebook_id and avatar if needed
                        user = userResult.rows[0];
                        await pool.query(
                            'UPDATE public_users SET facebook_id = $1, avatar = $2 WHERE id = $3',
                            [facebookId, avatar, user.id]
                        );
                    } else {
                        // Create new user
                        const insertResult = await pool.query(
                            `INSERT INTO public_users (email, full_name, avatar, facebook_id, is_verified, created_at)
                             VALUES ($1, $2, $3, $4, true, NOW())
                             RETURNING *`,
                            [email, name, avatar, facebookId]
                        );
                        user = insertResult.rows[0];

                        // Tự động gán quyền USER cho người dùng mới
                        const userRoleResult = await pool.query(`
                            SELECT id FROM roles WHERE name = 'USER' LIMIT 1
                        `);

                        if (userRoleResult.rows.length > 0) {
                            const userRoleId = userRoleResult.rows[0].id;
                            await pool.query(`
                                INSERT INTO user_roles (user_id, role_id, assigned_at)
                                VALUES ($1, $2, NOW())
                                ON CONFLICT (user_id, role_id) DO NOTHING
                            `, [user.id, userRoleId]);
                        }
                    }

                    return done(null, user);
                } catch (error) {
                    return done(error, undefined);
                }
            }
        )
    );
    console.log('✅ Facebook OAuth strategy initialized');
} else {
    console.log('⚠️  Facebook OAuth disabled - missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET');
}

export default passport;
