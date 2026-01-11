import express from 'express';
import passport from '../../config/passport';
import { googleCallback, facebookCallback } from '../../controllers/auth/oauth.controller';

const router = express.Router();

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`
    }),
    googleCallback
);

/**
 * @route   GET /api/auth/facebook
 * @desc    Initiate Facebook OAuth
 * @access  Public
 */
router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
}));

/**
 * @route   GET /api/auth/facebook/callback
 * @desc    Facebook OAuth callback
 * @access  Public
 */
router.get('/facebook/callback',
    passport.authenticate('facebook', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=facebook_auth_failed`
    }),
    facebookCallback
);

export default router;
