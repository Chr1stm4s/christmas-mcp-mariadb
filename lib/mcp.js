import mysql from 'mysql2/promise';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

/**
 * Creates and starts an MCP server for MariaDB/MySQL operations
 * @param {Object} config - Database configuration object
 * @param {string} config.host - Database host
 * @param {number} config.port - Database port
 * @param {string} config.user - Database user
 * @param {string} config.password - Database password
 * @param {string} config.database - Database name (optional)
 * @param {string} config.charset - Character set
 */
export async function createMCPServer(config) {
  let connection;

  // Create database connection
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: config.charset,
      multipleStatements: false,
      supportBigNumbers: true,
      bigNumberStrings: true
    });

    // Test the connection
    await connection.ping();
    console.error(`Connected to MariaDB at ${config.host}:${config.port}`);
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }

  // Create MCP server
  const server = new McpServer({
    name: 'christmas-mcp-mariadb',
    version: '1.0.0'
  });

  // Tool: Execute SQL query (read-only by default)
  server.registerTool(
    'query_database',
    {
      title: 'Query Database',
      description: 'Execute a SELECT query against the database',
      inputSchema: {
        sql: z.string().describe('The SQL SELECT query to execute')
      }
    },
    async ({ sql }) => {
      try {
        // Basic validation to ensure it's a SELECT query
        const trimmedSql = sql.trim().toUpperCase();
        if (!trimmedSql.startsWith('SELECT') && !trimmedSql.startsWith('SHOW') && !trimmedSql.startsWith('DESCRIBE') && !trimmedSql.startsWith('EXPLAIN')) {
          throw new Error('Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed with this tool');
        }

        const [rows, fields] = await connection.execute(sql);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              data: rows,
              rowCount: Array.isArray(rows) ? rows.length : 0,
              fields: fields ? fields.map(field => ({
                name: field.name,
                type: field.type,
                length: field.length
              })) : []
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: true,
              message: error.message,
              code: error.code || 'SQL_ERROR',
              sql: sql
            }, null, 2)
          }]
        };
      }
    }
  );

  // Tool: Execute any SQL (use with caution)
  server.registerTool(
    'execute_sql',
    {
      title: 'Execute SQL',
      description: 'Execute any SQL statement (INSERT, UPDATE, DELETE, etc.) - use with caution',
      inputSchema: {
        sql: z.string().describe('The SQL statement to execute'),
        confirm: z.boolean().default(false).describe('Set to true to confirm execution of potentially dangerous operations')
      }
    },
    async ({ sql, confirm }) => {
      try {
        const trimmedSql = sql.trim().toUpperCase();
        const isDangerous = trimmedSql.startsWith('DELETE') || 
                           trimmedSql.startsWith('UPDATE') || 
                           trimmedSql.startsWith('DROP') || 
                           trimmedSql.startsWith('TRUNCATE') ||
                           trimmedSql.startsWith('ALTER');

        if (isDangerous && !confirm) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: true,
                message: 'This SQL statement is potentially dangerous. Set confirm=true to execute.',
                sql: sql,
                requiresConfirmation: true
              }, null, 2)
            }]
          };
        }

        const [result, fields] = await connection.execute(sql);
        
        return {
          content: [{
            type: 'text', 
            text: JSON.stringify({
              success: true,
              data: result,
              affectedRows: result.affectedRows || 0,
              insertId: result.insertId || null,
              fieldCount: fields ? fields.length : 0,
              fields: fields ? fields.map(field => ({
                name: field.name,
                type: field.type,
                length: field.length
              })) : []
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: true,
              message: error.message,
              code: error.code || 'SQL_ERROR',
              sql: sql
            }, null, 2)
          }]
        };
      }
    }
  );

  // Tool: List tables
  server.registerTool(
    'list_tables',
    {
      title: 'List Tables',
      description: 'List all tables in the current database',
      inputSchema: {}
    },
    async () => {
      try {
        const [rows] = await connection.execute('SHOW TABLES');
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              tables: rows.map(row => Object.values(row)[0]),
              count: rows.length
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: true,
              message: error.message,
              code: error.code || 'SQL_ERROR'
            }, null, 2)
          }]
        };
      }
    }
  );

  // Tool: Describe table
  server.registerTool(
    'describe_table',
    {
      title: 'Describe Table',
      description: 'Get the structure/schema of a specific table',
      inputSchema: {
        table: z.string().describe('The name of the table to describe')
      }
    },
    async ({ table }) => {
      try {
        const [rows] = await connection.execute('DESCRIBE ??', [table]);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              table: table,
              columns: rows,
              columnCount: rows.length
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: true,
              message: error.message,
              code: error.code || 'SQL_ERROR',
              table: table
            }, null, 2)
          }]
        };
      }
    }
  );

  // Tool: Show databases
  server.registerTool(
    'show_databases',
    {
      title: 'Show Databases',
      description: 'List all available databases',
      inputSchema: {}
    },
    async () => {
      try {
        const [rows] = await connection.execute('SHOW DATABASES');
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              databases: rows.map(row => row.Database),
              count: rows.length
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: true,
              message: error.message,
              code: error.code || 'SQL_ERROR'
            }, null, 2)
          }]
        };
      }
    }
  );

  // Tool: Get server info
  server.registerTool(
    'server_info',
    {
      title: 'Server Info',
      description: 'Get MariaDB/MySQL server information',
      inputSchema: {}
    },
    async () => {
      try {
        const [versionRows] = await connection.execute('SELECT VERSION() as version');
        const [statusRows] = await connection.execute('SHOW STATUS LIKE "Uptime"');
        const [dbRows] = await connection.execute('SELECT DATABASE() as current_database');
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: true,
              server: {
                version: versionRows[0].version,
                uptime: statusRows[0].Value,
                currentDatabase: dbRows[0].current_database,
                host: config.host,
                port: config.port,
                user: config.user
              }
            }, null, 2)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: true,
              message: error.message,
              code: error.code || 'SQL_ERROR'
            }, null, 2)
          }]
        };
      }
    }
  );

  // Handle cleanup on process termination
  const cleanup = async () => {
    if (connection) {
      try {
        await connection.end();
        console.error('Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error.message);
      }
    }
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  return server;
}
