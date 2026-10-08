# AI Smart Home: AI, RAG và điều khiển IoT

## Mục tiêu

Xây dựng trợ lý AI cho hệ thống ESP32 + Blynk. Blynk tiếp tục xử lý dashboard và automation đơn giản; AI xử lý hội thoại, phân tích lịch sử sensor, tra cứu tài liệu, giải thích trạng thái và đề xuất điều khiển.

Phạm vi MVP hiện tại:

1. Hỏi đáp dữ liệu sensor hiện tại.
2. Tra cứu kiến thức hệ thống bằng RAG từ tài liệu Markdown.
3. AI đề xuất điều khiển `roof`, `fan`, `led`.
4. Người dùng phải xác nhận trước khi backend gọi Blynk.

## Phân chia trách nhiệm

```text
ESP32  -> đọc sensor, điều khiển relay, safety fallback
Blynk  -> kết nối thiết bị, virtual pins, dashboard cơ bản
FastAPI -> database, AI orchestration, RAG, policy, Blynk API
Next.js -> dashboard, chat, hiển thị đề xuất và nút xác nhận
```

Không chạy LLM hoặc vector database trên ESP32.

## Mapping thiết bị hiện tại

```text
V0  temperature
V1  humidity
V2  door
V3  light
V4  rain
V5  gas
V6  person
V7  vibration
V8  RFID
V9  roof
V10 fan
V11 led
```

Backend nhận diện device bằng:

```env
BLYNK_TEMPLATE_ID=TMPL66e42B6Cc
BLYNK_DEVICE_ID=ESP32-001
BLYNK_AUTH_TOKEN=<secret>
```

`BLYNK_TEMPLATE_ID` nhận diện template, không thay thế `BLYNK_AUTH_TOKEN`. `BLYNK_DEVICE_ID` là mã mapping trong database; không nên dùng `device_id=1` hardcode.

## Flow MVP

### Hỏi đáp

```text
User -> POST /api/v1/ai/chat
     -> lấy reading mới nhất bằng SQL
     -> tìm section liên quan trong docs/AI_RAG_IOT.md
     -> gọi OpenAI
     -> trả answer + sources + action proposal
```

### Điều khiển

```text
AI proposal -> UI hiển thị lý do
            -> user bấm Xác nhận
            -> POST /api/v1/ai/actions/execute
            -> whitelist device/pin
            -> gọi Blynk
```

AI không được gọi Blynk trực tiếp và không được tuyên bố đã thực hiện nếu user chưa xác nhận.

## API MVP

```text
POST /api/v1/ai/chat
POST /api/v1/ai/actions/execute
```

Ví dụ chat:

```json
{
  "message": "Tại sao quạt đang bật?"
}
```

Response có dạng:

```json
{
  "answer": "...",
  "sources": ["..."],
  "action": null
}
```

## RAG

MVP dùng retrieval theo từ khóa trên file Markdown để không thêm hạ tầng vector database quá sớm. Khi tài liệu lớn hơn, thay `knowledge_service.py` bằng pipeline:

```text
documents -> chunking -> embeddings -> vector store -> top-k retrieval
```

Tài liệu nên có metadata:

```text
source, device_id, template_id, pin, category, version
```

Câu hỏi sensor/history phải truy vấn SQL; không nhúng từng reading vào vector store. Câu hỏi kết hợp dùng cả SQL và RAG.

## Safety

- Chỉ cho phép `roof`, `fan`, `led`.
- Chỉ cho phép giá trị `0` hoặc `1`.
- Luôn cần user confirmation cho action AI trong MVP.
- Không đưa Blynk token lên frontend.
- ESP32 vẫn giữ rule an toàn cục bộ cho gas, quá nhiệt và mất mạng.
- Production cần lưu action log, user id, reason, target, value, status và timestamp.

## Cấu hình và chạy

Thêm vào `backend/.env`:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=<secret>
GEMINI_MODEL=gemini-2.5-flash
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
```

Hoặc dùng OpenAI:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=<secret>
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

Hoặc dùng Groq:

```env
AI_PROVIDER=groq
GROQ_API_KEY=<secret>
GROQ_MODEL=qwen/qwen3.8-27b
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

Chạy backend và frontend như hiện tại. Mở dashboard, đặt câu hỏi ở khối `AI Smart Home Copilot`, sau đó xác nhận action nếu AI đề xuất.

Nếu provider được chọn nhưng chưa cấu hình API key tương ứng, endpoint trả `503` rõ ràng thay vì fallback giả. Nếu provider hết quota hoặc billing, endpoint trả `429` để frontend hiển thị nguyên nhân.

## Roadmap sau MVP

1. Lưu conversation và action log vào database.
2. Dùng embeddings và vector database cho RAG.
3. Thêm anomaly detection bằng moving average, z-score, missing-data và heartbeat.
4. Thêm tool lấy thống kê lịch sử theo khoảng thời gian.
5. Cho AI tạo automation draft dạng JSON; user review rồi mới lưu.
6. Thêm worker/scheduler chạy automation.
7. Thêm approval policy theo mức độ nguy hiểm.
8. Thêm feedback trạng thái relay thật từ ESP32.
