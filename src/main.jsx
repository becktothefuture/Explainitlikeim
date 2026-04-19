import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { applyThemeTokens, DEPTH_CONTROL_DEFAULTS, LEVEL_CONTROL_DEFAULTS, loadDepthControls } from './theme.js';
import './styles.css';

applyThemeTokens(document.documentElement, {
  levelControls: LEVEL_CONTROL_DEFAULTS,
  depthControls: loadDepthControls() ?? DEPTH_CONTROL_DEFAULTS,
});

createRoot(document.getElementById('root')).render(<App />);
