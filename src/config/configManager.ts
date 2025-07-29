import fs from 'fs';
import path from 'path';

type EnvConfig = {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  password?: string;
};

export class Configuration {
  private static instance: Configuration;
  private config: EnvConfig | null = null;

  private constructor() {
    // private to prevent direct instantiation
  }

  public static getInstance(): Configuration {
    if (!Configuration.instance) {
      Configuration.instance = new Configuration();
    }
    return Configuration.instance;
  }

  public loadConfig(env: string = 'qa'): void {
    const configPath = path.resolve(__dirname, `${env.toLowerCase()}.json`);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found for environment: ${env}`);
    }
    const rawData = fs.readFileSync(configPath, 'utf-8');
    this.config = JSON.parse(rawData);
  }

  public getConfigValue(key: keyof EnvConfig): string | undefined {
    if (!this.config) {
      throw new Error('Config not loaded');
    }
    const value = this.config[key];
    if (value === undefined) {
      return undefined;
    }
    return String(value);
  }
}
