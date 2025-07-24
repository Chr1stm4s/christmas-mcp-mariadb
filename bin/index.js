#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import mysql from 'mysql2/promise';
import { createMCPServer } from '../lib/mcp.js';

const DEFAULT_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: null,
  charset: 'utf8mb4'
};

function generateConfigFile() {
  const configPath = join(process.cwd(), 'mcp.json');
  
  if (existsSync(configPath)) {
    console.log('mcp.json already exists in current directory');
    return;
  }

  const sampleConfig = {
    host: "localhost",
    port: 3306,
    user: "your_username",
    password: "your_password", 
    database: "your_database",
    charset: "utf8mb4"
  };
  
  try {
    writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2));
    console.log('Created sample mcp.json configuration file');
    console.log('Please edit it with your database connection details');
  } catch (error) {
    console.error('Failed to create mcp.json:', error.message);
  }
}

async function testConnection(config) {
  console.log('Testing database connection...');
  console.log(`Host: ${config.host}`);
  console.log(`Port: ${config.port}`);
  console.log(`User: ${config.user}`);
  console.log(`Password: ${config.password ? '[SET]' : '[NOT SET]'}`);
  console.log(`Database: ${config.database || '[NOT SET]'}`);
  console.log('');

  try {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: config.charset
    });

    await connection.ping();
    console.log('✅ Connection successful!');
    
    // Get server info
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log(`Database version: ${rows[0].version}`);
    
    if (config.database) {
      const [tableRows] = await connection.execute('SHOW TABLES');
      console.log(`Tables in database: ${tableRows.length}`);
    }
    
    await connection.end();
    console.log('Connection test completed successfully.');
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log(`Error: ${error.message}`);
    console.log('');
    console.log('Troubleshooting tips:');
    console.log('- Check if MariaDB/MySQL is running');
    console.log('- Verify your credentials');
    console.log('- Ensure the database exists (if specified)');
    console.log('- Check firewall settings');
    process.exit(1);
  }
}

async function main() {
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--init') || args.includes('-i')) {
    generateConfigFile();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Christmas MCP MariaDB Server');
    console.log('');
    console.log('Usage:');
    console.log('  christmas-mcp              Start the MCP server');
    console.log('  christmas-mcp --init        Create sample mcp.json configuration file');
    console.log('  christmas-mcp --test        Test database connection');
    console.log('  christmas-mcp --help        Show this help message');
    console.log('');
    console.log('Configuration:');
    console.log('  Create mcp.json in your current directory with database connection details');
    console.log('  Or use environment variables: MCP_DB_HOST, MCP_DB_PORT, MCP_DB_USER, MCP_DB_PASSWORD, MCP_DB_DATABASE');
    return;
  }

  let config = DEFAULT_CONFIG;
  
  try {
    // Try to load config from mcp.json in current working directory
    const configPath = join(process.cwd(), 'mcp.json');
    const configFile = readFileSync(configPath, 'utf8');
    const userConfig = JSON.parse(configFile);
    config = { ...DEFAULT_CONFIG, ...userConfig };
    console.error('Loaded configuration from mcp.json');
  } catch (error) {
    // If mcp.json doesn't exist or is invalid, use default config and environment variables
    console.error('Warning: Could not load mcp.json, using default configuration', error.message);
    console.error('You can create an mcp.json file in your current directory with database connection details.');
    console.error('Example: { "host": "localhost", "port": 3306, "user": "root", "password": "yourpassword", "database": "yourdatabase" }');
    
    // Check for environment variables as fallback
    config = {
      host: process.env.MCP_DB_HOST || DEFAULT_CONFIG.host,
      port: parseInt(process.env.MCP_DB_PORT) || DEFAULT_CONFIG.port,
      user: process.env.MCP_DB_USER || DEFAULT_CONFIG.user,
      password: process.env.MCP_DB_PASSWORD || DEFAULT_CONFIG.password,
      database: process.env.MCP_DB_DATABASE || DEFAULT_CONFIG.database,
      charset: process.env.MCP_DB_CHARSET || DEFAULT_CONFIG.charset
    };
  }

  // Test connection if requested
  if (args.includes('--test') || args.includes('-t')) {
    await testConnection(config);
    return;
  }

  try {
    // Validate configuration before starting server
    if (config.user === 'your_username' || config.password === 'your_password') {
      console.error('⚠️  Warning: Using default placeholder credentials from sample configuration');
      console.error('   Please edit your mcp.json file with actual database credentials');
      console.error('   Run "christmas-mcp --init" to generate a fresh configuration file');
    }

    // Create and start the MCP server
    const server = await createMCPServer(config);
    console.error('🎄 Christmas MCP MariaDB server started successfully');
    console.error('   Listening for MCP requests...');
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error.message);
    console.error('');
    console.error('Quick fixes:');
    console.error('- Run "christmas-mcp --init" to create configuration file');
    console.error('- Run "christmas-mcp --test" to test your database connection');
    console.error('- Check that MariaDB/MySQL is running and accessible');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
