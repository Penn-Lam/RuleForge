# Juhe Finance Stock MCP Server

This is a Model Context Protocol (MCP) server that provides stock market data from the Juhe Finance API. It allows Claude and other MCP clients to access real-time and historical stock data for Chinese (Shanghai/Shenzhen) and U.S. markets.

## Features

- Get real-time stock data for individual Shanghai/Shenzhen stocks
- Get Shanghai/Shenzhen Index data (SSE Composite or SZSE Component)
- Get U.S. stock market data with pagination
- Access stock data as resources

## Prerequisites

- Node.js 16 or higher
- A Juhe Finance API key (get one from [Juhe Data](http://www.juhe.cn/))

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory and add your Juhe Finance API key:
   ```
   JUHE_API_KEY=your_api_key_here
   ```

## Building and Running

Build the TypeScript code:
```
npm run build
```

Run the server:
```
npm start
```

For development with auto-reloading:
```
npm run dev
```

Test the API client:
```
npm test
```

## Using with Claude for Desktop

To use this MCP server with Claude for Desktop:

1. Open Claude for Desktop
2. Go to Settings > Developer > Edit Config
3. Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "juhe-finance": {
      "command": "node",
      "args": ["/absolute/path/to/dist/index.js"],
      "env": {
        "JUHE_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

Replace `/absolute/path/to/dist/index.js` with the absolute path to the built index.js file.

4. Restart Claude for Desktop

## Available Tools

### get-hs-stock-data

Gets real-time stock data for a specific Shanghai/Shenzhen stock or index.

Parameters:
- `gid` (optional): Stock code (e.g., sh601009 for Shanghai, sz000001 for Shenzhen)
- `type` (optional): Index type (0 for SSE Composite, 1 for SZSE Component). If provided, `gid` is ignored.

### get-us-stock-data

Gets U.S. stock market data with pagination.

Parameters:
- `page` (optional): Page number (default: 1)
- `type` (optional): Items per page (1: 20 items, 2: 40 items, 3: 60 items; default: 1)

## Available Resources

### hs-stock-data

Access Shanghai/Shenzhen stock or index data directly as a resource.

URI Template: `hs-stock://{gidOrType}`

Parameters:
- `gidOrType`: Stock code (e.g., sh601009) or index type (0 or 1)

Example usage in Claude:
- "Analyze this stock: hs-stock://sh601009"
- "What’s the SSE Composite Index: hs-stock://0"

### us-stock-data

Access U.S. stock data as a resource.

URI Template: `us-stock://{page}/{type}`

Parameters:
- `page`: Page number (default: 1)
- `type`: Items per page (1, 2, 3; default: 1)

Example usage in Claude:
- "Show me U.S. stocks: us-stock://1/1"