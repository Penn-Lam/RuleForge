import { getHsStockData, getUsStockData } from "./juheFinance.js";

async function testJuheFinance() {
    try {
        console.log("Testing Juhe Finance API client...");

        // Test getting individual HS stock data
        console.log("\nTesting getHsStockData (individual stock)...");
        const hsStockData = await getHsStockData("sh601009");
        console.log(hsStockData);

        // Test getting SSE Composite Index data
        console.log("\nTesting getHsStockData (SSE Composite Index)...");
        const sseData = await getHsStockData(undefined, "0");
        console.log(sseData);

        // Test getting U.S. stock data
        console.log("\nTesting getUsStockData...");
        const usData = await getUsStockData(1, "1");
        console.log(usData);

        console.log("\nAll tests completed successfully!");
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testJuheFinance();