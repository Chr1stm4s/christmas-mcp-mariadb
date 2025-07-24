#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { createMCPServer } from '../lib/mcp.js';

const DEFAULT_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: null,
  charset: 'utf8mb4'
};

async function main() {
  let config = DEFAULT_CONFIG;
  
  try {
    // Try to load config from mcp.json in current working directory
    const configPath = join(process.cwd(), 'mcp.json');
    const configFile = readFileSync(configPath, 'utf8');
    const userConfig = JSON.parse(configFile);
    config = { ...DEFAULT_CONFIG, ...userConfig };
  } catch (error) {
    // If mcp.json doesn't exist or is invalid, use default config
    console.error('Warning: Could not load mcp.json, using default configuration', error.message);
  }

  try {
    // Create and start the MCP server
    const server = await createMCPServer(config);
    console.error('Christmas MCP MariaDB server started successfully');
  } catch (error) {
    console.error('Failed to start MCP server:', error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
