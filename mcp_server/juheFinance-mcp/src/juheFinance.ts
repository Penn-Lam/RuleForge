import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.JUHE_API_KEY;
const HS_BASE_URL = "http://web.juhe.cn/finance/stock/hs";
const US_BASE_URL = "http://web.juhe.cn/finance/stock/usaall";

if (!API_KEY) {
    console.error("Juhe Finance API key not found. Please set JUHE_API_KEY in your .env file.");
    process.exit(1);
}

/**
 * Fetches Shanghai/Shenzhen stock or index data from Juhe Finance API
 * @param gid Stock code (e.g., sh601009, sz000001)
 * @param type Index type (0: SSE Composite, 1: SZSE Component)
 * @returns Formatted stock or index data as a string
 */
export async function getHsStockData(gid?: string, type?: string): Promise<string> {
    try {
        const params: any = { key: API_KEY };
        if (type === "0" || type === "1") {
            params.type = type;
        } else if (gid) {
            params.gid = gid;
        } else {
            throw new Error("Either 'gid' or 'type' must be provided.");
        }

        const response = await axios.get(HS_BASE_URL, { params });

        if (response.data.resultcode !== "200" && response.data.error_code !== 0) {
            throw new Error(response.data.reason || "API request failed");
        }

        const result = response.data.result[0] || response.data.result;
        return formatHsData(result, gid, type);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`HS API request failed: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Formats Shanghai/Shenzhen stock or index data into a readable string
 */
function formatHsData(data: any, gid?: string, type?: string): string {
    let result = "";

    if (type === "0" || type === "1") {
        // Index data
        const indexName = type === "0" ? "SSE Composite Index" : "SZSE Component Index";
        result = `${indexName} Data:\n\n`;
        result += `Name: ${data.name}\n`;
        result += `Current Price: ${data.nowpri}\n`;
        result += `Change: ${data.increase} (${data.increPer}%)\n`;
        result += `Open: ${data.openPri}\n`;
        result += `High: ${data.highPri}\n`;
        result += `Low: ${data.lowpri}\n`;
        result += `Yesterday Close: ${data.yesPri}\n`;
        result += `Volume: ${data.dealNum} hands\n`;
        result += `Amount: ${data.dealPri} CNY\n`;
        result += `Time: ${data.time}\n`;
    } else {
        // Individual stock data
        const stockData = data.data;
        result = `Stock Data for ${stockData.name} (${stockData.gid}):\n\n`;
        result += `Current Price: ${stockData.nowPri} CNY\n`;
        result += `Change: ${stockData.increase} (${stockData.increPer}%)\n`;
        result += `Open: ${stockData.todayStartPri}\n`;
        result += `High: ${stockData.todayMax}\n`;
        result += `Low: ${stockData.todayMin}\n`;
        result += `Yesterday Close: ${stockData.yestodEndPri}\n`;
        result += `Volume: ${stockData.traNumber} shares\n`;
        result += `Amount: ${stockData.traAmount} CNY\n`;
        result += `Buy 1: ${stockData.buyOne} @ ${stockData.buyOnePri}\n`;
        result += `Sell 1: ${stockData.sellOne} @ ${stockData.sellOnePri}\n`;
        result += `Date/Time: ${stockData.date} ${stockData.time}\n`;
    }

    return result;
}

/**
 * Fetches U.S. stock market data from Juhe Finance API
 * @param page Page number (default: 1)
 * @param type Items per page (1: 20, 2: 40, 3: 60; default: 1)
 * @returns Formatted U.S. stock data as a string
 */
export async function getUsStockData(page: number = 1, type: string = "1"): Promise<string> {
    try {
        const params = {
            key: API_KEY,
            page: page.toString(),
            type,
        };

        const response = await axios.get(US_BASE_URL, { params });

        if (response.data.error_code !== 0) {
            throw new Error(response.data.reason || "API request failed");
        }

        const result = response.data.result;
        return formatUsData(result);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`US API request failed: ${error.message}`);
        }
        throw error;
    }
}

/**
 * Formats U.S. stock data into a readable string
 */
function formatUsData(data: any): string {
    let result = `U.S. Stock Data (Page ${data.page}, ${data.num} items):\n\n`;
    const stocks = data.data.slice(0, 5); // Limit to 5 for brevity

    for (const stock of stocks) {
        result += `${stock.cname} (${stock.symbol} - ${stock.market}):\n`;
        result += `  Price: $${stock.price}\n`;
        result += `  Change: ${stock.diff} (${stock.chg}%)\n`;
        result += `  Open: $${stock.open}\n`;
        result += `  High: $${stock.high}\n`;
        result += `  Low: $${stock.low}\n`;
        result += `  Volume: ${stock.volume} shares\n`;
        result += `  Market Cap: $${stock.mktcap}\n`;
        result += `  Category: ${stock.category}\n\n`;
    }

    if (data.data.length > 5) {
        result += `... and ${data.data.length - 5} more stocks on this page.\n`;
    }
    result += `Total Stocks: ${data.totalCount}\n`;

    return result;
}