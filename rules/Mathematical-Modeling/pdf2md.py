import os
import sys
import time
import requests
import json
import zipfile
import io
import re
import glob
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

API_TOKEN = os.getenv("MINERU_API_TOKEN")
if not API_TOKEN:
    print("错误：未找到API令牌，请在.env文件中设置MINERU_API_TOKEN")
    sys.exit(1)


CREATE_BATCH_URL = "https://mineru.net/api/v4/file-urls/batch"
GET_BATCH_RESULT_URL = "https://mineru.net/api/v4/extract-results/batch/{batch_id}"


HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_TOKEN}"
}

def find_pdf_file():
    """查找当前目录下的A题.pdf、B题.pdf或C题.pdf文件"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_patterns = ["A题.pdf", "B题.pdf", "C题.pdf"]
    
    for pattern in pdf_patterns:
        pdf_path = os.path.join(current_dir, pattern)
        if os.path.exists(pdf_path):
            return pdf_path
    
    return None

def upload_pdf_file(pdf_path):
    """上传PDF文件并创建解析任务"""
    print(f"正在上传PDF文件: {pdf_path}")
    
    pdf_name = os.path.basename(pdf_path)
    
    # 创建批量上传请求
    data = {
        "enable_formula": True,
        "enable_table": True,
        "layout_model": "doclayout_yolo",
        "language": "ch",
        "files": [
            {"name": pdf_name, "is_ocr": True}
        ]
    }
    
    try:
        # 申请上传URL
        response = requests.post(CREATE_BATCH_URL, headers=HEADERS, json=data)
        response.raise_for_status()
        result = response.json()
        
        if result["code"] != 200:
            print(f"申请上传URL失败: {result['msg']}")
            return None
        
        batch_id = result["data"]["batch_id"]
        upload_url = result["data"]["file_urls"][0]
        
        print(f"成功获取上传URL，批次ID: {batch_id}")
        
        # 上传文件
        with open(pdf_path, 'rb') as f:
            upload_response = requests.put(upload_url, data=f)
        
        if upload_response.status_code == 200:
            print("文件上传成功！")
            return batch_id
        else:
            print(f"文件上传失败: {upload_response.status_code}")
            return None
    except Exception as e:
        print(f"上传文件时发生错误: {str(e)}")
        return None

def get_batch_result(batch_id):
    """获取批量任务结果"""
    url = GET_BATCH_RESULT_URL.format(batch_id=batch_id)
    
    print("正在等待任务完成...")
    while True:
        try:
            response = requests.get(url, headers=HEADERS)
            response.raise_for_status()
            result = response.json()
            
            if result["code"] != 200:
                print(f"获取任务结果失败: {result['msg']}")
                return None
            
            extract_results = result["data"]["extract_result"]
            if not extract_results:
                print("未找到解析结果")
                return None
            
            # 获取第一个文件的结果（我们只上传了一个文件）
            extract_result = extract_results[0]
            state = extract_result["state"]
            
            if state == "done":
                print("任务已完成！")
                return extract_result
            elif state == "failed":
                err_msg = extract_result.get("err_msg", "未知错误")
                print(f"任务处理失败: {err_msg}")
                return None
            else:
                # 如果任务正在运行，显示进度
                if state == "running" and "extract_progress" in extract_result:
                    progress = extract_result["extract_progress"]
                    extracted = progress.get("extracted_pages", 0)
                    total = progress.get("total_pages", 0)
                    if total > 0:
                        percent = (extracted / total) * 100
                        print(f"任务状态: {state}，进度: {extracted}/{total} 页 ({percent:.1f}%)，继续等待...")
                    else:
                        print(f"任务状态: {state}，继续等待...")
                else:
                    print(f"任务状态: {state}，继续等待...")
                
                time.sleep(5)  # 等待5秒后再次检查
        except Exception as e:
            print(f"获取任务结果时发生错误: {str(e)}")
            time.sleep(5)  # 出错后等待5秒再重试

def download_and_extract_markdown(extract_result, pdf_name):
    """下载并提取Markdown内容"""
    try:
        # 获取压缩包URL
        zip_url = extract_result.get("full_zip_url")
        if not zip_url:
            print("未找到结果压缩包URL")
            return None
        
        print(f"正在下载结果压缩包: {zip_url}")
        response = requests.get(zip_url)
        response.raise_for_status()
        
        # 解压缩包
        with zipfile.ZipFile(io.BytesIO(response.content)) as z:
            # 查找markdown文件
            markdown_files = [f for f in z.namelist() if f.endswith('.md')]
            if not markdown_files:
                print("压缩包中未找到Markdown文件")
                return None
            
            # 读取第一个markdown文件
            markdown_content = z.read(markdown_files[0]).decode('utf-8')
        
        # 生成输出文件名
        output_filename = os.path.splitext(pdf_name)[0] + ".md"
        output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), output_filename)
        
        # 保存markdown内容
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"Markdown文件已保存至: {output_path}")
        return output_path
    except Exception as e:
        print(f"下载和提取Markdown时发生错误: {str(e)}")
        return None

def main():
    # 查找PDF文件
    pdf_path = find_pdf_file()
    if not pdf_path:
        print("错误：未找到A题.pdf、B题.pdf或C题.pdf文件")
        return
    
    pdf_name = os.path.basename(pdf_path)
    print(f"找到PDF文件: {pdf_name}")
    
    # 上传PDF文件并创建解析任务
    batch_id = upload_pdf_file(pdf_path)
    if not batch_id:
        return
    
    # 获取任务结果
    extract_result = get_batch_result(batch_id)
    if not extract_result:
        return
    
    # 下载并提取Markdown
    markdown_path = download_and_extract_markdown(extract_result, pdf_name)
    if markdown_path:
        print(f"PDF转换为Markdown成功！")

if __name__ == "__main__":
    main()