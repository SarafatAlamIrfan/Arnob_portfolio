import fs from 'fs';

try {
  console.log('Copying build files from client/dist to root dist/ for Vercel...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.cpSync('client/dist', 'dist', { recursive: true });
  console.log('Build files successfully copied to root dist/ directory!');
} catch (error) {
  console.error('Error copying build files:', error);
  process.exit(1);
}
