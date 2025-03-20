import 'express-session';

declare module 'express-session' {
    interface Session {
        githubToken?: string;
        githubUser?: any;
    }
} 