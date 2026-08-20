import { Request, Response, Router } from 'express';
import axios from 'axios';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';

const execFileAsync = promisify(execFile);
const router = Router();

/**
 * Runs `git` with an argument array (never a shell string), so commit
 * messages, usernames, and branch names can never break out into shell
 * commands regardless of what characters they contain.
 */
async function git(cwd: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
    return execFileAsync('git', args, { cwd });
}

// GitHub OAuth login route
router.get('/github', (req: Request, res: Response) => {
    try {
        // Request more comprehensive permissions
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo,workflow,write:packages,user,delete_repo`;
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

// Get list of files that can be committed
router.get('/github/changed-files', async (req: Request, res: Response) => {
    const accessToken = req.session?.githubToken;

    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        // We'll return a placeholder response that the frontend will override
        // with the actual files from the editor session
        res.json({ 
            files: [],
            session_files: true
        });
    } catch (error) {
        console.error('Error getting files:', error);
        res.status(500).json({ error: 'Failed to get files' });
    }
});

// Commit and push changes
router.post('/github/commit-push', async (req: Request, res: Response) => {
    const { message, files, fileContents, repoUrl } = req.body;
    const accessToken = req.session?.githubToken;

    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        if (!message) {
            return res.status(400).json({ error: 'Commit message is required' });
        }

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ error: 'At least one file must be selected' });
        }

        if (!repoUrl) {
            return res.status(400).json({ error: 'Repository URL is required' });
        }

        console.log(`Commit request received for repo: ${repoUrl}`);
        console.log(`Files to commit: ${files.join(', ')}`);

        // Create a truly temporary directory outside of the project
        const randomId = crypto.randomBytes(8).toString('hex');
        const tempDir = path.join(os.tmpdir(), `codecollab_commit_${randomId}`);

        console.log(`Using temporary directory for commit: ${tempDir}`);
        
        // Clear existing temp directory if it exists
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        
        // Create temp directory
        fs.mkdirSync(tempDir, { recursive: true });
        
        try {
            // Get user information
            console.log('Getting user information...');
            const userResponse = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            
            const userName = userResponse.data.name || userResponse.data.login;
            const userEmail = userResponse.data.email || `${userResponse.data.login}@users.noreply.github.com`;
            console.log(`User authenticated as: ${userName} <${userEmail}>`);
            console.log(`Token permissions check: ${accessToken.substring(0, 4)}...`);
            
            // Test API access to verify token has correct permissions
            try {
                const repoTest = await axios.get('https://api.github.com/user/repos?per_page=1', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                console.log(`API access verified: ${repoTest.status === 200 ? 'OK' : 'Failed'}`);
            } catch (apiErr) {
                console.error('API permission test failed:', apiErr);
                return res.status(401).json({ 
                    error: 'GitHub token does not have sufficient permissions. Please log out and log in again.' 
                });
            }
            
            // Prepare authenticated URL for cloning
            let authRepoUrl = repoUrl;
            if (repoUrl.includes('github.com')) {
                // For debugging, extract the repo owner/name
                try {
                    let repoPath = '';
                    if (repoUrl.startsWith('https://')) {
                        repoPath = repoUrl.replace('https://github.com/', '').replace('.git', '');
                    } else if (repoUrl.includes('git@github.com:')) {
                        repoPath = repoUrl.replace('git@github.com:', '').replace('.git', '');
                    }
                    console.log(`Targeting repository: ${repoPath}`);
                    
                    // Verify we have access to this repository
                    try {
                        const repoCheck = await axios.get(`https://api.github.com/repos/${repoPath}`, {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                            },
                        });
                        console.log(`Repository access verified: ${repoCheck.status === 200 ? 'OK' : 'Failed'}`);
                    } catch (error: unknown) {
                        if (error && typeof error === 'object' && 'response' in error) {
                            console.error('Repository access check failed:', (error as { response?: { status?: number } }).response?.status);
                        } else {
                            console.error('Repository access check failed with unknown error');
                        }
                        // Continue anyway, as we might be creating a new repo
                    }
                } catch (pathErr) {
                    console.warn('Could not extract repo path for verification:', pathErr);
                }
                
                // Convert HTTPS URL to authenticated URL
                // Change https://github.com/username/repo.git to https://x-access-token:TOKEN@github.com/username/repo.git
                if (repoUrl.startsWith('https://')) {
                    const urlParts = repoUrl.split('https://');
                    authRepoUrl = `https://x-access-token:${accessToken}@${urlParts[1]}`;
                    console.log('Using HTTPS authentication URL');
                } else {
                    // Try to convert SSH URL to HTTPS with token
                    // Convert git@github.com:username/repo.git to https://x-access-token:TOKEN@github.com/username/repo.git
                    try {
                        const match = repoUrl.match(/git@github\.com:(.+)\.git/);
                        if (match && match[1]) {
                            authRepoUrl = `https://x-access-token:${accessToken}@github.com/${match[1]}.git`;
                            console.log('Converted SSH URL to HTTPS authentication URL');
                        } else {
                            console.log('Could not parse SSH URL, trying as is.');
                        }
                    } catch (parseErr) {
                        console.warn('Error parsing repo URL, trying as is:', parseErr);
                    }
                }
            }
            
            console.log('Setting up git repository...');

            // Initialize git repository (argument arrays only — never a shell
            // string — so nothing in userName/userEmail/message/paths can be
            // interpreted as a shell command)
            await git(tempDir, ['init']);
            await git(tempDir, ['config', 'user.name', userName]);
            await git(tempDir, ['config', 'user.email', userEmail]);

            // Add remote with credentials
            console.log('Adding remote origin...');
            await git(tempDir, ['remote', 'add', 'origin', authRepoUrl]);

            // Write files to the cloned repository
            let addedCount = 0;
            const validFiles: string[] = [];

            // Debug the files we're about to process
            console.log(`Files received for processing: ${JSON.stringify(files)}`);
            console.log(`File contents keys: ${Object.keys(fileContents || {})}`);

            if (fileContents && typeof fileContents === 'object') {
                // First, make sure we process ALL files that were selected
                for (const filePath of files) {
                    try {
                        // Reject absolute paths and `..` segments so a crafted
                        // file path can't write outside tempDir
                        const normalized = path.normalize(filePath).replace(/^([/\\])+/, '');
                        if (normalized.split(/[/\\]/).includes('..') || path.isAbsolute(filePath)) {
                            console.warn(`Rejected unsafe file path: ${filePath}`);
                            continue;
                        }

                        const content = fileContents[filePath];
                        if (!content) {
                            console.warn(`No content provided for file: ${filePath}, using empty string`);
                            fileContents[filePath] = ''; // Provide empty content rather than skipping
                        }

                        // Create full path with directories
                        const fullPath = path.join(tempDir, normalized);

                        // Create directories if they don't exist
                        const dirPath = path.dirname(fullPath);
                        if (!fs.existsSync(dirPath)) {
                            fs.mkdirSync(dirPath, { recursive: true });
                        }

                        // Write file content (even if empty)
                        fs.writeFileSync(fullPath, fileContents[filePath] || '');
                        validFiles.push(filePath);
                        addedCount++;
                        console.log(`Added file: ${filePath}`);
                    } catch (fileError) {
                        console.error(`Error adding file ${filePath}:`, fileError);
                    }
                }
            } else {
                console.error('No file contents provided or invalid format');
            }

            // Log the files that were successfully added
            console.log(`Successfully added ${addedCount} files: ${validFiles.join(', ')}`);

            // If no files were added, create a minimal README to commit
            if (addedCount === 0) {
                const readmePath = 'README.md';
                fs.writeFileSync(
                    path.join(tempDir, readmePath),
                    `# CodeCollab Project\n\nRepository updated with CodeCollab.\n`
                );
                validFiles.push(readmePath);
                addedCount++;
            }

            // Add all files to git
            console.log('Adding files to git...');
            await git(tempDir, ['add', '--all']);

            // Commit changes (message passed as a single argv entry, never
            // interpolated into a shell string)
            console.log('Committing changes...');
            await git(tempDir, ['commit', '-m', message]);

            // Try to fetch first to see if repo exists
            console.log('Checking repository status...');

            try {
                // Try to fetch and see if we succeed
                const { stdout: fetchOutput } = await git(tempDir, ['fetch', 'origin']);
                console.log(`Fetch output: ${fetchOutput || 'No output'}`);

                // If we get here, fetch was successful, repo exists
                // Try to create a branch based on main/master
                try {
                    console.log('Trying to create branch from main/master...');
                    try {
                        await git(tempDir, ['checkout', '-b', 'temp-branch', 'origin/main']);
                    } catch {
                        await git(tempDir, ['checkout', '-b', 'temp-branch', 'origin/master']);
                    }

                    // If this succeeded, now merge our changes
                    console.log('Merging changes...');
                    await git(tempDir, [
                        'merge',
                        '--allow-unrelated-histories',
                        '-X',
                        'theirs',
                        '--no-edit',
                        'HEAD@{1}',
                    ]);
                } catch (branchErr) {
                    console.log('Could not create branch from remote, using our commit as is');
                    await git(tempDir, ['branch', '-m', 'temp-branch']);
                }
            } catch (fetchErr) {
                console.log('Fetch failed, assuming new repository');
                await git(tempDir, ['branch', '-m', 'temp-branch']);
            }

            // Push changes, forcing if necessary
            console.log('Pushing changes to remote...');
            try {
                await git(tempDir, ['push', '-f', 'origin', 'temp-branch:main']);
                console.log('Successfully pushed to main branch');
            } catch (mainPushErr) {
                console.log('Failed to push to main, trying master...');
                try {
                    await git(tempDir, ['push', '-f', 'origin', 'temp-branch:master']);
                    console.log('Successfully pushed to master branch');
                } catch (masterPushErr) {
                    // Last resort: try to push to the temp branch directly
                    console.log('Failed to push to master, trying direct branch push...');
                    await git(tempDir, ['push', '-f', 'origin', 'temp-branch']);
                    console.log('Pushed to temp-branch');
                }
            }
            
            // Clean up temp directory
            fs.rmSync(tempDir, { recursive: true, force: true });
            
            res.json({ 
                message: 'Changes committed and pushed successfully',
                files: validFiles
            });
        } catch (gitError) {
            console.error('Git operation error:', gitError);
            
            // Clean up temp directory
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
            
            // Check if this is an authentication error
            const errorMsg = gitError instanceof Error ? gitError.message : 'Git operation failed';
            if (errorMsg.includes('Authentication failed') || 
                errorMsg.includes('could not read Username') ||
                errorMsg.includes('Invalid username or password') ||
                errorMsg.includes('403')) {
                return res.status(401).json({
                    error: 'GitHub authentication failed. Please log out and log in again with appropriate permissions.'
                });
            }
            
            res.status(500).json({ 
                error: errorMsg
            });
        }
    } catch (error) {
        console.error('Commit and push error:', error);
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

// Create repository and push code
router.post('/github/create-and-push', async (req: Request, res: Response) => {
    const { repository, message, files, fileContents } = req.body;
    const accessToken = req.session?.githubToken;

    if (!accessToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        // Validate inputs
        if (!repository || !repository.name) {
            return res.status(400).json({ error: 'Repository name is required' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Commit message is required' });
        }

        if (!files || !Array.isArray(files) || files.length === 0) {
            return res.status(400).json({ error: 'At least one file must be selected' });
        }

        console.log(`Creating repository: ${repository.name}`);
        console.log(`Selected files for commit: ${files.join(', ')}`);
        
        // First create the repository
        const repoResponse = await axios.post(
            'https://api.github.com/user/repos',
            repository,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                },
            }
        );

        // Get repository details
        const repo = repoResponse.data;
        console.log(`Repository created successfully: ${repo.html_url}`);

        // Declared here (not inside the try below) so the catch block can
        // clean up the *actual* directory used, instead of a fresh random
        // path that never existed
        const randomId = crypto.randomBytes(8).toString('hex');
        const tempDir = path.join(os.tmpdir(), `codecollab_${randomId}`);

        try {
            console.log(`Using temporary directory: ${tempDir}`);
            
            // Clear existing temp directory if it exists
            if (fs.existsSync(tempDir)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
            }
            
            // Create temp directory
            fs.mkdirSync(tempDir, { recursive: true });
            
            // Get user information for git configuration
            console.log('Getting user information...');
            const userResponse = await axios.get('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            
            const userName = userResponse.data.name || userResponse.data.login;
            const userEmail = userResponse.data.email || `${userResponse.data.login}@users.noreply.github.com`;
            
            // Create authenticated repo URL
            const authRepoUrl = `https://x-access-token:${accessToken}@github.com/${repo.full_name}.git`;
            
            // Write files to the cloned repository
            let addedCount = 0;
            const validFiles: string[] = [];
            
            // Debug the files we're about to process
            console.log(`Files received for processing: ${JSON.stringify(files)}`);
            console.log(`File contents keys: ${Object.keys(fileContents || {})}`);
            
            if (fileContents && typeof fileContents === 'object') {
                // First, make sure we process ALL files that were selected
                for (const filePath of files) {
                    try {
                        // Reject absolute paths and `..` segments so a crafted
                        // file path can't write outside tempDir
                        const normalized = path.normalize(filePath).replace(/^([/\\])+/, '');
                        if (normalized.split(/[/\\]/).includes('..') || path.isAbsolute(filePath)) {
                            console.warn(`Rejected unsafe file path: ${filePath}`);
                            continue;
                        }

                        const content = fileContents[filePath];
                        if (!content) {
                            console.warn(`No content provided for file: ${filePath}, using empty string`);
                            fileContents[filePath] = ''; // Provide empty content rather than skipping
                        }

                        // Create full path with directories
                        const fullPath = path.join(tempDir, normalized);

                        // Create directories if they don't exist
                        const dirPath = path.dirname(fullPath);
                        if (!fs.existsSync(dirPath)) {
                            fs.mkdirSync(dirPath, { recursive: true });
                        }

                        // Write file content (even if empty)
                        fs.writeFileSync(fullPath, fileContents[filePath] || '');
                        validFiles.push(filePath);
                        addedCount++;
                        console.log(`Added file: ${filePath}`);
                    } catch (fileError) {
                        console.error(`Error adding file ${filePath}:`, fileError);
                    }
                }
            } else {
                console.error('No file contents provided or invalid format');
            }

            // Log the files that were successfully added
            console.log(`Successfully added ${addedCount} files: ${validFiles.join(', ')}`);

            // If no files were added, create a minimal README to commit
            if (addedCount === 0) {
                const readmePath = 'README.md';
                fs.writeFileSync(
                    path.join(tempDir, readmePath),
                    `# CodeCollab Project\n\nRepository updated with CodeCollab.\n`
                );
                validFiles.push(readmePath);
                addedCount++;
            }

            // Add all files to git
            console.log('Adding files to git...');
            await git(tempDir, ['add', '--all']);

            // Commit changes (message passed as a single argv entry)
            console.log('Committing changes...');
            await git(tempDir, ['commit', '-m', message]);

            // Add remote with authentication token
            console.log('Setting up remote...');
            await git(tempDir, ['remote', 'add', 'origin', authRepoUrl]);

            // Push to the repository, try main first, then master
            console.log('Pushing to repository...');
            try {
                await git(tempDir, ['push', '-u', 'origin', 'main']);
            } catch (mainPushError) {
                console.log('Failed to push to main branch, trying master branch...');
                await git(tempDir, ['push', '-u', 'origin', 'master']);
            }
            
            console.log('Push successful!');
            
            // Clean up temp directory
            fs.rmSync(tempDir, { recursive: true, force: true });
            
            res.json({ 
                message: 'Repository created and code pushed successfully',
                repository: repo,
                files: validFiles
            });
        } catch (gitError: unknown) {
            console.error('Git operation error:', gitError);

            // Clean up the temp directory that was actually used
            try {
                if (fs.existsSync(tempDir)) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                }
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
            }
            
            // If we created the repo but git operations failed, return partial success
            res.status(207).json({ 
                message: 'Repository created but failed to push code. You can push code manually later.',
                repository: repo,
                error: gitError instanceof Error ? gitError.message : 'Git operation failed'
            });
        }
    } catch (error: any) {
        console.error('Create and push error:', error);
        
        // Handle GitHub API rate limit errors
        if (error.response?.status === 403 && error.response?.data?.message?.includes('rate limit')) {
            return res.status(403).json({ 
                error: 'GitHub API rate limit exceeded. Please try again later.' 
            });
        }
        
        // Handle repository already exists errors
        if (error.response?.status === 422 && error.response?.data?.errors?.some((e: any) => e.message?.includes('name already exists'))) {
            return res.status(409).json({ 
                error: 'A repository with this name already exists in your GitHub account.' 
            });
        }
        
        res.status(500).json({ 
            error: error.response?.data?.message || 'Failed to create repository and push code' 
        });
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