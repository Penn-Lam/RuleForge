# 单个文件解析
## 创建解析任务
### 接口说明
适用于通过 API 创建解析任务的场景，用户须先申请 Token。

### Python请求示例
```python
import requests

url='https://mineru.net/api/v4/extract/task'
header = {
    'Content-Type':'application/json',
    "Authorization":"Bearer eyJ0eXBlIjoiSl...请填写准确的token！"
}
data = {
    'url':'https://cdn-mineru.openxlab.org.cn/demo/example.pdf',
    'is_ocr':True,
    'enable_formula': False,
}

res = requests.post(url,headers=header,json=data)
print(res.status_code)
print(res.json())
print(res.json()["data"])
```
CURL 请求示例
```bash
curl --location --request POST 'https://mineru.net/api/v4/extract/task' \
--header 'Authorization: Bearer ***' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--data-raw '{
    "url": "https://cdn-mineru.openxlab.org.cn/demo/example.pdf",
    "is_ocr": true,
    "enable_formula": false
}'
```
### 请求体参数说明

| 参数          | 类型    | 是否必选 | 示例                                      | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|---------------|---------|----------|-------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| url           | string  | 是       | `https://static.openxlab.org.cn/opendatalab/pdf/demo.pdf` | 文件 URL                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| is_ocr        | bool    | 否       | `false`                                   | 是否启动 OCR 功能，默认 `false`                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| enable_formula| bool    | 否       | `true`                                    | 是否开启公式识别，默认 `true`                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| enable_table  | bool    | 否       | `true`                                    | 是否开启表格识别，默认 `true`                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| layout_model  | string  | 否       | `doclayout_yolo`                          | 可选值：`doclayout_yolo`、`layoutlmv3`，默认值为 `doclayout_yolo`。`doclayout_yolo` 为自研模型，效果更好                                                                                                                                                                                                                                                                                                                                                           |
| language      | string  | 否       | `ch`                                      | 指定文档语言，默认 `ch`，可选值列表详见：[PaddleOCR 多语言支持](https://paddlepaddle.github.io/PaddleOCR/latest/ppocr/blog/multi_languages.html#5)                                                                                                                                                                                                                                                                                                                  |
| data_id       | string  | 否       | `abc**`                                   | 解析对象对应的数据 ID。由大小写英文字母、数字、下划线（_）、短划线（-）、英文句号（.）组成，不超过 128 个字符，可以用于唯一标识您的业务数据。                                                                                                                                                                                                                                                                                                                      |
| callback      | string  | 否       | `http://127.0.0.1/callback`               | 解析结果回调通知您的 URL，支持使用 HTTP 和 HTTPS 协议的地址。该字段为空时，您必须定时轮询解析结果。callback 接口必须支持 POST 方法、UTF-8 编码、Content-Type:application/json 传输数据，以及参数 `checksum` 和 `content`。解析接口按照以下规则和格式设置 `checksum` 和 `content`，调用您的 callback 接口返回检测结果。`checksum`：字符串格式，由用户 uid + seed + content 拼成字符串，通过 SHA256 算法生成。用户 UID，可在个人中心查询。为防篡改，您可以在获取到推送结果时，按上述算法生成字符串，与 `checksum` 做一次校验。`content`：JSON 字符串格式，请自行解析反转成 JSON 对象。关于 `content` 结果的示例，请参见任务查询结果的返回示例，对应任务查询结果的 `data` 部分。说明:您的服务端 callback 接口收到 Mineru 解析服务推送的结果后，如果返回的 HTTP 状态码为 200，则表示接收成功，其他的 HTTP 状态码均视为接收失败。接收失败时，mineru 将最多重复推送 5 次检测结果，直到接收成功。重复推送 5 次后仍未接收成功，则不再推送，建议您检查 callback 接口的状态。 |
| seed          | string  | 否       | `abc**`                                   | 随机字符串，该值用于回调通知请求中的签名。由英文字母、数字、下划线（_）组成，不超过 64 个字符，由您自定义。用于在接收到内容安全的回调通知时校验请求由 Mineru 解析服务发起。说明：当使用 callback 时，该字段必须提供。                                                                                                                                                                                                                                               |


### 请求体示例
```json
{
  "url": "https://static.openxlab.org.cn/opendatalab/pdf/demo.pdf",
  "is_ocr": true,
  "data_id": "abcd"
}
```
### 响应说明

| 参数      | 类型   | 示例                                      | 说明                                                                 |
|-----------|--------|-------------------------------------------|----------------------------------------------------------------------|
| code      | int    | `200`                                     | 接口状态码，成功：`200`                                              |
| msg       | string | `ok`                                      | 接口处理信息，成功：`"ok"`                                           |
| trace_id  | string | `c876cd60b202f2396de1f9e39a1b0172`        | 请求 ID                                                             |
| data.task_id | string | `a90e6ab6-44f3-4554-b459-b62fe4c6b436` | 提取任务 ID，可用于查询任务结果                                       |


### 响应示例
```json
{
  "code": 200,
  "data": {
    "task_id": "a90e6ab6-44f3-4554-b4***"
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
```

## 获取任务结果
### 接口说明
通过 task_id 查询提取任务目前的进度，任务处理完成后，接口会响应对应的提取详情。
### Python请求示例
``` python
import requests

url = f'https://mineru.net/api/v4/extract/task/{task_id}'
header = {
    'Content-Type':'application/json',
    "Authorization":"Bearer eyJ0eXBlIjoiSl...请填写准确的！"
}

res = requests.get(url, headers=header)
print(res.status_code)
print(res.json())
print(res.json()["data"])
```
### CURL 请求示例
```bash
curl --location --request GET 'https://mineru.net/api/v4/extract/task/{task_id}' \
--header 'Authorization: Bearer *****' \
--header 'Accept: */*'
```
### 响应参数说明

| 参数                          | 类型   | 示例                                                                 | 说明                                                                 |
|-------------------------------|--------|----------------------------------------------------------------------|----------------------------------------------------------------------|
| code                          | int    | `200`                                                                | 接口状态码，成功：`200`                                              |
| msg                           | string | `ok`                                                                 | 接口处理信息，成功：`"ok"`                                           |
| trace_id                      | string | `c876cd60b202f2396de1f9e39a1b0172`                                   | 请求 ID                                                             |
| data.task_id                  | string | `abc**`                                                              | 任务 ID                                                             |
| data.data_id                  | string | `abc**`                                                              | 解析对象对应的数据 ID。如果在解析请求参数中传入了 `data_id`，则此处返回对应的 `data_id`。 |
| data.state                    | string | `done`                                                               | 任务处理状态，完成：`done`，排队中：`pending`，正在解析：`running`，解析失败：`failed` |
| data.full_zip_url             | string | `https://cdn-mineru.openxlab.org.cn/pdf/018e53ad-d4f1-475d-b380-36bf24db9914.zip` | 文件解析结果压缩包                                                   |
| data.err_msg                  | string | `文件格式不支持，请上传符合要求的文件类型`                            | 解析失败原因，当 `state=failed` 时有效                               |
| data.extract_progress.extracted_pages | int    | `1`                                                                  | 文档已解析页数，当 `state=running` 时有效                            |
| data.extract_progress.start_time | string | `2025-01-20 11:43:20`                                               | 文档解析开始时间，当 `state=running` 时有效                          |
| data.extract_progress.total_pages | int    | `2`                                                                  | 文档总页数，当 `state=running` 时有效                                |

### 响应示例
```json
{
  "code": 200,
  "data": {
    "task_id": "47726b6e-46ca-4bb9-******",
    "state": "running",
    "err_msg": "",
    "extract_progress": {
      "extracted_pages": 1,
      "total_pages": 2,
      "start_time": "2025-01-20 11:43:20"
    }
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
```
```json
{
  "code": 200,
  "data": {
    "task_id": "47726b6e-46ca-4bb9-******",
    "state": "done",
    "full_zip_url": "https://cdn-mineru.openxlab.org.cn/pdf/018e53ad-d4f1-475d-b380-36bf24db9914.zip",
    "err_msg": ""
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
```
# 批量文件解析
## 文件批量上传解析
### 接口说明
- 申请的文件上传链接有效期为 24 小时，请在有效期内完成文件上传
- 上传文件时，无须设置 Content-Type 请求头
- 文件上传完成后，无须调用提交解析任务接口。系统会自动扫描已上传完成文件自动提交解析任务
- 单次申请链接不能超过 200 个

### Python请求示例
``` python
import requests

url='https://mineru.net/api/v4/file-urls/batch'
header = {
    'Content-Type':'application/json',
    "Authorization":"Bearer eyJ0eXBlIjoiSl...请填写准确的token！"
}
data = {
    "enable_formula": True,
    "language": "en",
    "layout_model":"doclayout_yolo",
    "enable_table": True,
    "files": [
        {"name":"demo.pdf", "is_ocr": True, "data_id": "abcd"}
    ]
}
file_path = r"demo.pdf"
try:
    response = requests.post(url,headers=header,json=data)
    if response.status_code == 200:
        result = response.json()
        print('response success. result:{}'.format(result))
        if result["code"] == 0:
            batch_id = result["data"]["batch_id"]
            urls = result["data"]["file_urls"]
            print('batch_id:{},urls:{}'.format(batch_id, urls))
            with open(file_path, 'rb') as f:
                res_upload = requests.put(urls[0], data=f)
            if res_upload.status_code == 200:
                print("upload success")
            else:
                print("upload failed")
        else:
            print('apply upload url failed,reason:{}'.format(result.msg))
    else:
        print('response not success. status:{} ,result:{}'.format(response.status_code, response))
except Exception as err:
    print(err)
```
### CURL 请求示例
curl --location --request POST 'https://mineru.net/api/v4/file-urls/batch' \
--header 'Authorization: Bearer ***' \
--header 'Content-Type: application/json' \
--header 'Accept: */*' \
--data-raw '{
    "enable_formula": true,
    "language": "en",
    "layout_model":"doclayout_yolo",
    "enable_table": true,
    "files": [
        {"name":"demo.pdf", "is_ocr": true, "data_id": "abcd"}
    ]
}'
```
### CURL 文件上传示例
```bash
curl -X PUT -T /path/to/your/file.pdf 'https://****'
```
### 请求体参数说明
| 参数               | 类型   | 是否必选 | 示例                                      | 描述                                                                                                                                                                                                 |
|--------------------|--------|----------|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| enable_formula     | bool   | 否       | `true`                                    | 是否开启公式识别，默认 `true`                                                                                                                                                                         |
| enable_table       | bool   | 否       | `true`                                    | 是否开启表格识别，默认 `true`                                                                                                                                                                         |
| layout_model       | string | 否       | `doclayout_yolo`                          | 可选值：`doclayout_yolo`、`layoutlmv3`，默认值为 `doclayout_yolo`。`doclayout_yolo` 为自研模型，效果更好                                                                                             |
| language           | string | 否       | `ch`                                      | 指定文档语言，默认 `ch`，可选值列表详见：[PaddleOCR 多语言支持](https://paddlepaddle.github.io/PaddleOCR/latest/ppocr/blog/multi_languages.html#5)                                                   |
| file.url           | string | 是       | `demo.pdf`                                | 文件链接                                                                                                                                                                                             |
| file.is_ocr        | bool   | 否       | `true`                                    | 是否启动 OCR 功能，默认 `false`                                                                                                                                                                       |
| file.data_id       | string | 否       | `abc**`                                   | 解析对象对应的数据 ID。由大小写英文字母、数字、下划线（_）、短划线（-）、英文句号（.）组成，不超过 128 个字符，可以用于唯一标识您的业务数据。                                                         |
| callback           | string | 否       | `http://127.0.0.1/callback`               | 解析结果回调通知您的 URL，支持使用 HTTP 和 HTTPS 协议的地址。该字段为空时，您必须定时轮询解析结果。`callback` 接口必须支持 POST 方法、UTF-8 编码、`Content-Type:application/json` 传输数据，以及参数 `checksum` 和 `content`。解析接口按照以下规则和格式设置 `checksum` 和 `content`，调用您的 `callback` 接口返回检测结果。`checksum`：字符串格式，由用户 `uid + seed + content` 拼成字符串，通过 SHA256 算法生成。用户 UID，可在个人中心查询。为防篡改，您可以在获取到推送结果时，按上述算法生成字符串，与 `checksum` 做一次校验。`content`：JSON 字符串格式，请自行解析反转成 JSON 对象。关于 `content` 结果的示例，请参见任务查询结果的返回示例，对应任务查询结果的 `data` 部分。说明：您的服务端 `callback` 接口收到 Mineru 解析服务推送的结果后，如果返回的 HTTP 状态码为 200，则表示接收成功，其他的 HTTP 状态码均视为接收失败。接收失败时，Mineru 将最多重复推送 5 次检测结果，直到接收成功。重复推送 5 次后仍未接收成功，则不再推送，建议您检查 `callback` 接口的状态。 |
| seed               | string | 否       | `abc**`                                   | 随机字符串，该值用于回调通知请求中的签名。由英文字母、数字、下划线（_）组成，不超过 64 个字符。由您自定义，用于在接收到内容安全的回调通知时校验请求由 Mineru 解析服务发起。说明：当使用 `callback` 时，该字段必须提供。                                               |

### 请求体示例
```json
{
    "enable_formula": true,
    "language": "en",
    "layout_model":"doclayout_yolo",
    "enable_table": true,
    "files": [
        {"url":"https://cdn-mineru.openxlab.org.cn/demo/example.pdf", "is_ocr": True, "data_id": "abcd"}
    ]
}
```
### 响应参数说明
| 参数            | 类型   | 示例                                      | 说明                                                                 |
|-----------------|--------|-------------------------------------------|----------------------------------------------------------------------|
| code            | int    | `200`                                     | 接口状态码，成功：`200`                                              |
| msg             | string | `ok`                                      | 接口处理信息，成功：`"ok"`                                           |
| trace_id        | string | `c876cd60b202f2396de1f9e39a1b0172`        | 请求 ID                                                             |
| data.batch_id   | string | `2bb2f0ec-a336-4a0a-b61a-****`            | 批量提取任务 ID，可用于批量查询解析结果                               |

### 响应示例
``` json
{
  "code": 200,
  "data": {
    "batch_id": "2bb2f0ec-a336-4a0a-b61a-241afaf9cc87"
  }
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
```
## 批量获取任务结果
### 接口说明
通过 batch_id 批量查询提取任务的进度。
### Python请求示例
``` python
import requests

url = f'https://mineru.net/api/v4/extract-results/batch/{batch_id}'
header = {
    'Content-Type':'application/json',
    "Authorization":"Bearer eyJ0eXBlIjoiSl...请填写准确的！"
}

res = requests.get(url, headers=header)
print(res.status_code)
print(res.json())
print(res.json()["data"])
```
### CURL 请求示例
```bash
curl --location --request GET 'https://mineru.net/api/v4/extract-results/batch/{batch_id}' \
--header 'Authorization: Bearer *****' \
--header 'Accept: */*'
```
### 响应参数说明

| 参数                                           | 类型    | 示例                                                   | 说明                                                                                     |
|------------------------------------------------|---------|--------------------------------------------------------|------------------------------------------------------------------------------------------|
| code                                           | int     | `200`                                                  | 接口状态码，成功：`200`                                                                  |
| msg                                            | string  | `ok`                                                   | 接口处理信息，成功：`"ok"`                                                               |
| trace_id                                       | string  | `c876cd60b202f2396de1f9e39a1b0172`                     | 请求 ID                                                                                  |
| data.batch_id                                  | string  | `2bb2f0ec-a336-4a0a-b61a-241afaf9cc87`                | `batch_id`                                                                               |
| data.extract_result.file_name                  | string  | `demo.pdf`                                             | 文件名                                                                                   |
| data.extract_result.state                      | string  | `done`                                                 | 任务处理状态，完成: `done`，排队中: `pending`，正在解析: `running`，解析失败: `failed`  |
| data.extract_result.full_zip_url               | string  | `https://cdn-mineru.openxlab.org.cn/pdf/...9914.zip`   | 文件解析结果压缩包                                                                       |
| data.extract_result.err_msg                    | string  | `文件格式不支持，请上传符合要求的文件类型`             | 解析失败原因，当 `state=failed` 时有效                                                  |
| data.extract_result.data_id                    | string  | `abc**`                                                | 解析对象对应的数据 ID。说明：如果在解析请求参数中传入了 `data_id`，此处返回对应的 `data_id`。 |
| data.extract_result.extract_progress.extracted_pages | int | `1`                                                   | 文档已解析页数，当 `state=running` 时有效                                               |
| data.extract_result.extract_progress.start_time | string | `2025-01-20 11:43:20`                                 | 文档解析开始时间，当 `state=running` 时有效                                             |
| data.extract_result.extract_progress.total_pages | int   | `2`                                                   | 文档总页数                                                                                |

### 响应示例
``` json
{
  "code": 200,
  "data": {
    "batch_id": "2bb2f0ec-a336-4a0a-b61a-241afaf9cc87",
    "extract_result": [
      {
        "file_name": "example.pdf",
        "state": "done",
        "err_msg": "",
        "full_zip_url": "https://cdn-mineru.openxlab.org.cn/pdf/018e53ad-d4f1-475d-b380-36bf24db9914.zip"
      },
      {
        "file_name":"demo.pdf"
        "state": "running",
        "err_msg": "",
        "extract_progress": {
          "extracted_pages": 1,
          "total_pages": 2,
          "start_time": "2025-01-20 11:43:20"
        }
      }
    ]
  },
  "msg": "ok",
  "trace_id": "c876cd60b202f2396de1f9e39a1b0172"
}
```
# 常见错误码
以下是整理后的 Markdown 表格，便于清晰呈现错误码及解决建议：

```markdown
| 错误码   | 说明                                               | 解决建议                                                                                       |
|----------|----------------------------------------------------|------------------------------------------------------------------------------------------------|
| A0202    | Token 错误                                         | 检查 Token 是否正确，或者更换新 Token                                                          |
| A0211    | Token 过期                                         | 更换新 Token                                                                                   |
| -10001   | 服务异常                                           | 请稍后再试                                                                                     |
| -10002   | 请求参数错误                                       | 检查请求参数格式                                                                               |
| -60001   | 生成上传 URL 失败，请稍后再试                      | 请稍后再试                                                                                     |
| -60002   | 获取匹配的文件格式失败                             | 检测文件类型失败，请确认文件名及链接中带有正确的后缀名，且文件为 `pdf`, `doc`, `docx`, `ppt`, `pptx` 中的一种 |
| -60003   | 文件读取失败                                       | 请检查文件是否损坏并重新上传                                                                   |
| -60004   | 空文件                                             | 请上传有效文件                                                                                 |
| -60005   | 文件大小超出限制                                   | 检查文件大小，最大支持 200MB                                                                   |
| -60006   | 文件页数超过限制                                   | 请拆分文件后重试                                                                               |
| -60007   | 模型服务暂时不可用                                 | 请稍后重试或联系技术支持                                                                       |
| -60008   | 文件读取超时                                       | 检查文件的 URL 是否可访问                                                                      |
| -60009   | 任务提交队列已满                                   | 请稍后再试                                                                                     |
| -60010   | 解析失败                                           | 请稍后再试                                                                                     |
| -60011   | 获取有效文件失败                                   | 请确保文件已上传                                                                               |
```