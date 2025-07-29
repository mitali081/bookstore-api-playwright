import fs from 'fs';
import path from 'path';
import os from 'os';

async function globalSetup() {
  // Gather environment metadata
  const metadata = {
    tester: process.env.TESTER || 'Mitali',
    environment: (process.env.ENV || 'QA').toUpperCase(),
    platform: os.platform(),
    timestamp: new Date().toISOString(),
  };

  // Prepare output directory and file path
  const outputDir = path.join(process.cwd(), 'test-output');
  const metadataFile = path.join(outputDir, 'environment.json');

  try {
    // Create directory if not exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Write metadata to JSON file
    fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2), 'utf-8');

    console.log(`Global setup: Environment metadata written to ${metadataFile}`);
  } catch (error) {
    console.error(`Global setup: Failed to write environment metadata - ${error}`);
    throw error;
  }
}

export default globalSetup;
