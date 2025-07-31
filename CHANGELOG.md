# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-07-31

### 🔧 Fixed
- **Connection Management**: Fixed "Can't add new command when connection is in closed state" error
- **Connection Pooling**: Replaced single connection with connection pool for better stability
- **Retry Logic**: Added automatic retry mechanism for failed SQL operations
- **Connection Recovery**: Improved connection error handling and recovery

### ✨ Enhanced
- **SQL Execution**: Better support for CREATE TABLE, ALTER TABLE, and other DDL statements
- **Error Reporting**: More detailed error messages and connection diagnostics
- **Transaction Support**: Improved handling of complex SQL operations
- **Response Data**: Enhanced response format with more detailed execution results

### 🚀 Improved
- **Reliability**: Connection pool ensures stable long-running server operation
- **Performance**: Better connection reuse and resource management
- **Debugging**: Enhanced logging for connection issues and SQL execution

## [1.1.0] - 2025-07-25

### ✨ Added
- **Configuration Management**: `--init` command to generate sample configuration files
- **Connection Testing**: `--test` command to validate database connections
- **Help System**: `--help` command with usage information
- **Environment Variables**: Fallback support for configuration via environment variables

### 🔧 Enhanced
- **Error Messages**: Detailed troubleshooting information for common issues
- **Configuration Validation**: Detection of placeholder credentials and missing settings
- **Startup Experience**: Better user guidance and error reporting

## [1.0.1] - 2025-07-24

### Initial Release
- **MCP Server**: Full Model Context Protocol compliance
- **Database Tools**: 6 specialized tools for database operations
- **Security Features**: Read-only by default with confirmation for dangerous operations
- **Multiple Database Support**: Works with MariaDB and MySQL
