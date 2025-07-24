#!/usr/bin/env node

import mysql from 'mysql2/promise';
import { readFile } from 'fs/promises';
import { createInterface } from 'readline';
import { join } from 'path';
import { cwd } from 'process';

let connection = null;

async function loadConfig() {
  try {
    const configPath = join(cwd(), 'mcp.json');
    const configData = await readFile(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.log(JSON.stringify({
      error: `Failed to load config: ${error.message}`
    }));
    process.exit(1);
  }
}

async function connectToDatabase(config) {
  try {
    connection = await mysql.createConnection({
      host: config.host || 'localhost',
      port: config.port || 3306,
      user: config.user,
      password: config.password,
      database: config.database,
      ...config.options
    });
    
    console.log('READY');
  } catch (error) {
    console.log(JSON.stringify({
      error: `Database connection failed: ${error.message}`
    }));
    process.exit(1);
  }
}

async function executeQuery(query) {
  if (!connection) {
    return {
      error: 'Database connection not established'
    };
  }

  try {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return {
        error: 'Empty query provided'
      };
    }

    const [results, fields] = await connection.execute(trimmedQuery);
    
    return {
      success: true,
      results: results,
      fields: fields ? fields.map(field => ({
        name: field.name,
        type: field.type,
        table: field.table
      })) : null,
      rowCount: Array.isArray(results) ? results.length : results.affectedRows || 0
    };
  } catch (error) {
    return {
      error: `Query execution failed: ${error.message}`,
      sqlState: error.sqlState,
      errno: error.errno
    };
  }
}

async function setupReadlineInterface() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    const result = await executeQuery(line);
    console.log(JSON.stringify(result));
  });

  rl.on('close', async () => {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  });

  // Handle process termination gracefully
  process.on('SIGINT', async () => {
    rl.close();
  });

  process.on('SIGTERM', async () => {
    rl.close();
  });
}

async function main() {
  try {
    const config = await loadConfig();
    await connectToDatabase(config);
    await setupReadlineInterface();
  } catch (error) {
    console.log(JSON.stringify({
      error: `Application startup failed: ${error.message}`
    }));
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log(JSON.stringify({
    error: `Unhandled promise rejection: ${reason}`
  }));
  process.exit(1);
});

main();
