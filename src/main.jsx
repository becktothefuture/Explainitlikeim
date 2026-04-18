import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { applyThemeTokens } from './theme.js';
import './styles.css';

applyThemeTokens();

createRoot(document.getElementById('root')).render(<App />);
