import express, { Request, Response } from 'express';
import axios from 'axios';
import { Router } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

// GitHub OAuth login route
router.get('/github', (req: Request, res: Response) => {
    try {
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo user`;
        console.log('Redirecting to GitHub:', githubAuthUrl);
        res.redirect(githubAuthUrl);
    } catch (error) {
        console.error('Error in GitHub auth route:', error);
        res.redirect(`${process.env.FRONTEND_URL}/github/error`);
    }
});

// GitHub OAuth callback route
router.get('/github/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;
    console.log('Received callback with code:', code);

    if (!code) {
        console.error('No code received in callback');
        return res.redirect(`${process.env.FRONTEND_URL}/github/error`);
    }

    try {
        console.log('Exchanging code for access token...');
        const tokenResponse = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
            },
            {
                headers: {
                    Accept: 'application/json',
                },
            }
        );

        const accessToken = tokenResponse.data.access_token;

        if (!accessToken) {
            console.error('No access token received');
            throw new Error('Failed to get access token');
        }

        console.log('Access token received, fetching user data...');
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (req.session) {
            req.session.githubToken = accessToken;
            req.session.githubUser = userResponse.data;
            console.log('User data stored in session');
        }

        // Redirect back to the frontend success page, which will check for roomId
        console.log('Redirecting to frontend success page');
        res.redirect(`${process.env.FRONTEND_URL}/github/success`);
    } catch (error) {
        console.error('GitHub OAuth Error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/github/error`);
    }
});

// Get user profile
router.get('/github/profile', async (req: Request, res: Response) => {
    const accessToken = req.session?.githubToken;

    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        res.json(userResponse.data);
    } catch (error) {
        console.error('GitHub API Error:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// Commit and push changes
router.post('/github/commit-push', async (req: Request, res: Response) => {
    const { message } = req.body;
    const accessToken = req.session?.githubToken;

    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        // Add all changes
        await execAsync('git add .');
        
        // Commit changes
        await execAsync(`git commit -m "${message}"`);
        
        // Push changes
        await execAsync('git push origin main');

        res.json({ message: 'Changes committed and pushed successfully' });
    } catch (error) {
        console.error('Git operation error:', error);
        res.status(500).json({ error: 'Failed to commit and push changes' });
    }
});

// Create repository
router.post('/github/create-repo', async (req: Request, res: Response) => {
    const accessToken = req.session?.githubToken;

    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const response = await axios.post(
            'https://api.github.com/user/repos',
            req.body,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error('GitHub API Error:', error);
        res.status(500).json({ error: 'Failed to create repository' });
    }
});

// Logout
router.post('/github/logout', (req: Request, res: Response) => {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                res.status(500).json({ error: 'Failed to logout' });
            } else {
                res.json({ message: 'Logged out successfully' });
            }
        });
    } else {
        res.json({ message: 'Already logged out' });
    }
});

export default router; 