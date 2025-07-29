import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  console.log('Global teardown started.');

  // Example: clean up test artifacts older than 7 days
  const artifactsDir = path.resolve(__dirname, 'test-output', 'artifacts');

  if (fs.existsSync(artifactsDir)) {
    const files = fs.readdirSync(artifactsDir);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(artifactsDir, file);
      try {
        const stats = fs.statSync(filePath);
        const ageInDays = (now - stats.mtimeMs) / (1000 * 60 * 60 * 24);
        if (ageInDays > 7) {
          if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
            console.log(`Deleted old directory: ${filePath}`);
          } else {
            fs.unlinkSync(filePath);
            console.log(`Deleted old file: ${filePath}`);
          }
        }
      } catch (error) {
        console.warn(`Failed to delete ${filePath}:`, error);
      }
    }
  } else {
    console.log('Artifacts directory does not exist, skipping cleanup.');
  }

  // Any other teardown logic (closing DB connections, stopping services etc.) goes here

  console.log('Global teardown finished.');
}

export default globalTeardown;
