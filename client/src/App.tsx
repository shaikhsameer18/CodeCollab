import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GitHubProvider } from './context/GitHubContext';
import GitHubSuccessPage from './pages/GitHubSuccessPage';
import GitHubErrorPage from './pages/GitHubErrorPage';
import Toast from './components/toast/Toast';
import EditorPage from './pages/EditorPage';
import HomePage from './pages/HomePage';

export default function App() {
    return (
        <GitHubProvider>
            <Router>
                <Routes>
                    <Route path="/github/success" element={<GitHubSuccessPage />} />
                    <Route path="/github/error" element={<GitHubErrorPage />} />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/editor/:roomId" element={<EditorPage />} />
                </Routes>
                <Toast />
            </Router>
        </GitHubProvider>
    );
}
