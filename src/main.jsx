import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { applyThemeTokens, loadLevelControls } from './theme.js';
import './styles.css';

applyThemeTokens(document.documentElement, { levelControls: loadLevelControls() });

createRoot(document.getElementById('root')).render(<App />);
