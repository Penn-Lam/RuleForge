# IDEQuant Navigator

## 项目概述
利用MCP实时获取股票行情数据，结合Cursor/Windsurf的AI代码生成能力，构建智能量化股票分析系统。

---

## 使用步骤
- 配置好MCP Server
    - [Alpha Vantage](https://github.com/ranveer0323/stock-analysis-mcp/tree/main)
    - [JUHE](../../mcp_server/juheFinance-mcp/README.md)
- 将`.md`改成`.windsurfrules`或`.cursorfrules`

## 环境配置

### 1. 安装 Miniconda/Anaconda
如果你还没有安装 `conda`，请先下载并安装：
- [Miniconda](https://docs.conda.io/en/latest/miniconda.html)（轻量版）
- [Anaconda](https://www.anaconda.com/download)（完整版）

### 2. 创建 Conda 环境
使用项目提供的 `environment.yml` 文件创建环境：
```bash
conda env create -f environment.yml
```

### 3. 激活环境
创建完成后，激活环境：
```bash
conda activate quant-env
```

### 4. 更新环境
如果 `environment.yml` 有更新，可以使用以下命令更新环境：
```bash
conda env update -f environment.yml --prune
```