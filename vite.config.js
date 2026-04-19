import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isProjectPagesBuild =
  process.env.GITHUB_ACTIONS === 'true' &&
  repository.length > 0 &&
  !repository.endsWith('.github.io');

export default defineConfig({
  plugins: [react()],
  base: isProjectPagesBuild ? `/${repository}/` : '/',
});
