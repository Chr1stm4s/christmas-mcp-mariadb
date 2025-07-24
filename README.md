# Christmas MCP MariaDB

[![npm version](https://badge.fury.io/js/christmas-mcp-mariadb.svg)](https://badge.fury.io/js/christmas-mcp-mariadb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

A professional **Model Context Protocol (MCP) server** for MariaDB/MySQL database operations. This server provides structured, secure access to MariaDB databases through the MCP protocol, designed for seamless integration with AI assistants, development tools, and automation workflows.

## 🎯 Why Christmas MCP MariaDB?

- **🛡️ Security First**: Built-in safety features with confirmation for dangerous operations
- **🔌 MCP Native**: Full Model Context Protocol compliance for AI assistant integration
- **⚡ Production Ready**: Comprehensive error handling, connection management, and type safety
- **🎪 Flexible**: Works with Claude Desktop, custom MCP clients, and development tools
- **📊 Comprehensive**: 6 specialized tools covering all database interaction needs

## 🚀 Quick Start

### Installation

```bash
npm install -g christmas-mcp-mariadb
```

### Initial Setup

1. **Generate configuration file:**
```bash
christmas-mcp --init
```

This creates a sample `mcp.json` file in your current directory.

2. **Edit the configuration:**
```json
{
  "host": "localhost",
  "port": 3306,
  "user": "your_username",
  "password": "your_password",
  "database": "your_database",
  "charset": "utf8mb4"
}
```

3. **Start the server:**
```bash
christmas-mcp
```

### Alternative Configuration Methods

**Using Environment Variables:**
```bash
export MCP_DB_HOST=localhost
export MCP_DB_PORT=3306
export MCP_DB_USER=myuser
export MCP_DB_PASSWORD=mypass
export MCP_DB_DATABASE=mydb
christmas-mcp
```

**Command Line Help:**
```bash
christmas-mcp --help
```

## 🔧 Integration Examples

### With Claude Desktop

Add to your Claude Desktop configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "christmas-mcp-mariadb": {
      "command": "christmas-mcp",
      "args": [],
      "env": {}
    }
  }
}
```

### With MCP Clients

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "christmas-mcp",
  args: []
});

const client = new Client({
  name: "my-app",
  version: "1.0.0"
});

await client.connect(transport);

// Query your database
const result = await client.callTool({
  name: "query_database",
  arguments: {
    sql: "SELECT COUNT(*) FROM users"
  }
});
```

### With Development Tools

```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector christmas-mcp

# Use in automation scripts
echo '{"name": "list_tables", "arguments": {}}' | christmas-mcp
```

## 🛠️ Available Tools

| Tool | Purpose | Safety Level | Parameters |
|------|---------|-------------|------------|
| `query_database` | Execute SELECT queries | 🟢 Read-only | `sql: string` |
| `list_tables` | List all tables | 🟢 Safe | None |
| `describe_table` | Get table schema | 🟢 Safe | `table: string` |
| `show_databases` | List databases | 🟢 Safe | None |
| `server_info` | Get server details | 🟢 Safe | None |
| `execute_sql` | Execute any SQL | 🟡 Requires confirmation | `sql: string, confirm: boolean` |

### 🔍 Tool Examples

<details>
<summary><strong>query_database</strong> - Safe SELECT queries</summary>

```json
{
  "name": "query_database",
  "arguments": {
    "sql": "SELECT id, name, email FROM users WHERE active = 1 LIMIT 10"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "Alice", "email": "alice@example.com"},
    {"id": 2, "name": "Bob", "email": "bob@example.com"}
  ],
  "rowCount": 2,
  "fields": [
    {"name": "id", "type": 3},
    {"name": "name", "type": 253},
    {"name": "email", "type": 253}
  ]
}
```
</details>

<details>
<summary><strong>execute_sql</strong> - Any SQL with safety confirmation</summary>

```json
{
  "name": "execute_sql",
  "arguments": {
    "sql": "UPDATE users SET last_login = NOW() WHERE id = 1",
    "confirm": true
  }
}
```

**Safety Feature:** Dangerous operations require `confirm: true`
</details>

<details>
<summary><strong>describe_table</strong> - Table schema inspection</summary>

```json
{
  "name": "describe_table",
  "arguments": {
    "table": "users"
  }
}
```

**Response:**
```json
{
  "success": true,
  "table": "users",
  "columns": [
    {
      "Field": "id",
      "Type": "int(11)",
      "Null": "NO",
      "Key": "PRI",
      "Default": null,
      "Extra": "auto_increment"
    }
  ],
  "columnCount": 1
}
```
</details>

## ⚙️ Configuration

### Database Configuration

The server looks for a `mcp.json` file in the current working directory:

```json
{
  "host": "localhost",
  "port": 3306,
  "user": "root",
  "password": "",
  "database": "mydb",
  "charset": "utf8mb4"
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `host` | string | `"localhost"` | Database server hostname |
| `port` | number | `3306` | Database server port |
| `user` | string | `"root"` | Database username |
| `password` | string | `""` | Database password |
| `database` | string | `null` | Database name (optional) |
| `charset` | string | `"utf8mb4"` | Character set |

### Environment Variables

You can also use environment variables (they override `mcp.json`):

```bash
export MCP_DB_HOST=localhost
export MCP_DB_PORT=3306
export MCP_DB_USER=myuser
export MCP_DB_PASSWORD=mypass
export MCP_DB_DATABASE=mydb
```

## 🛡️ Security Features

- **🔒 Read-only by default**: `query_database` only accepts SELECT, SHOW, DESCRIBE, EXPLAIN
- **⚠️ Confirmation required**: Dangerous operations (DELETE, UPDATE, DROP) need explicit confirmation
- **🛠️ Parameterized queries**: SQL injection protection where applicable
- **📝 Comprehensive logging**: All operations logged with context
- **🔐 Connection security**: Secure connection handling and cleanup

## 🔧 Troubleshooting

### Common Issues

**1. "Could not load mcp.json" Warning**
```bash
# Generate a sample configuration file
christmas-mcp --init
# Then edit the created mcp.json with your database details
```

**2. "Database connection failed: Access denied"**
- Verify your database credentials in `mcp.json`
- Check if the user has proper permissions
- Ensure the database server is running
- Try connecting with a database client first to verify credentials

**3. "Database connection failed: connect ECONNREFUSED"**
- Check if MariaDB/MySQL is running
- Verify the host and port in your configuration
- Check firewall settings
- For remote connections, ensure the server allows external connections

**4. "Database doesn't exist"**
- Create the database first, or
- Remove the `database` field from `mcp.json` to connect without selecting a database
- Use `show_databases` tool to list available databases

**5. Server exits before responding to initialize**
- This usually indicates a configuration or connection problem
- Check the error messages above this line
- Verify your `mcp.json` configuration
- Test database connection manually first

### Configuration Validation

Test your configuration:
```bash
# Check if your database is accessible
mysql -h localhost -u your_username -p your_database

# Or for MariaDB
mariadb -h localhost -u your_username -p your_database
```

### Debug Mode

For more detailed logging, set environment variable:
```bash
export NODE_ENV=development
christmas-mcp
```

## 📊 Response Format

### Successful Response
```json
{
  "success": true,
  "data": [...],
  "rowCount": 5,
  "fields": [
    {
      "name": "column_name",
      "type": 253,
      "length": 255
    }
  ]
}
```

### Error Response
```json
{
  "error": true,
  "message": "Table 'mydb.users' doesn't exist",
  "code": "ER_NO_SUCH_TABLE",
  "sql": "SELECT * FROM users"
}
```

## 🏗️ Development

### Project Structure
```
christmas-mcp-mariadb/
├── bin/
│   └── index.js          # MCP server entry point
├── lib/
│   └── mcp.js           # MCP server implementation
├── package.json         # Package configuration
├── mcp.json            # Sample database config
├── .npmignore          # NPM ignore rules
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/Chr1stm4s/christmas-mcp-mariadb.git
cd christmas-mcp-mariadb

# Install dependencies
npm install

# Link for global development
npm link

# Test the server
christmas-mcp
```

### Testing

```bash
# Test with MCP Inspector
npx @modelcontextprotocol/inspector christmas-mcp

# Manual testing
node bin/index.js
```

## 🔄 Compatibility

- **Node.js**: >= 18.0.0
- **MariaDB**: All versions
- **MySQL**: 5.7+, 8.0+
- **MCP Protocol**: Latest specification
- **Operating Systems**: Windows, macOS, Linux

## 📚 Use Cases

- **🤖 AI Assistant Integration**: Connect Claude Desktop to your databases
- **🔧 Development Tools**: Database inspection and management
- **📊 Data Analysis**: Query databases through AI assistants
- **🚀 Automation**: Integrate database operations in workflows
- **📱 Custom Applications**: Build MCP-enabled database tools

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io/) - The foundation protocol
- [mysql2](https://github.com/sidorares/node-mysql2) - Excellent MySQL/MariaDB client
- [Zod](https://github.com/colinhacks/zod) - Runtime type validation

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Chr1stm4s/christmas-mcp-mariadb/issues)
- **Documentation**: This README and inline code comments
- **Examples**: Check the `examples/` directory (coming soon)

---

**Made with ❤️ for the MCP community** 🎄

*Transform your database interactions with the power of the Model Context Protocol!*
