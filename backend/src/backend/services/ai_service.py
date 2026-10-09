import json

import httpx
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.config import settings
from backend.models.device import Device
from backend.models.sensor_reading import SensorReading
from backend.schemas.ai import AIAnswerResponse, DeviceActionProposal
from backend.services.knowledge_service import retrieve_knowledge


async def build_sensor_context(db: AsyncSession) -> str:
    device_result = await db.execute(
        select(Device).where(
            Device.device_id == settings.blynk_device_id,
            Device.is_active.is_(True),
        )
    )
    device = device_result.scalar_one_or_none()
    if device is None:
        return "No active device is configured."

    reading_result = await db.execute(
        select(SensorReading)
        .where(SensorReading.device_id == device.id)
        .order_by(SensorReading.recorded_at.desc())
        .limit(1)
    )
    reading = reading_result.scalar_one_or_none()
    if reading is None:
        return f"Device {device.device_id} has no sensor readings yet."

    return json.dumps(
        {
            "device_id": device.device_id,
            "device_name": device.name,
            "recorded_at": reading.recorded_at.isoformat(),
            "temperature": reading.temperature,
            "humidity": reading.humidity,
            "door": reading.door,
            "light": reading.light,
            "rain": reading.rain,
            "gas": reading.gas,
            "person": reading.person,
            "vibration": reading.vibration,
            "roof": reading.roof,
            "fan": reading.fan,
            "led": reading.led,
        },
        ensure_ascii=False,
    )


async def answer_question(db: AsyncSession, message: str) -> AIAnswerResponse:
    provider = settings.ai_provider.lower()
    if provider not in {"openai", "gemini", "groq"}:
        raise HTTPException(
            status_code=500,
            detail=f"Unsupported AI provider: {settings.ai_provider}",
        )

    if provider == "openai" and not settings.openai_api_key:
        raise HTTPException(
            status_code=503,
            detail="AI is not configured. Set OPENAI_API_KEY in backend/.env.",
        )
    if provider == "gemini" and not settings.gemini_api_key:
        raise HTTPException(
            status_code=503,
            detail="AI is not configured. Set GEMINI_API_KEY in backend/.env.",
        )
    if provider == "groq" and not settings.groq_api_key:
        raise HTTPException(
            status_code=503,
            detail="AI is not configured. Set GROQ_API_KEY in backend/.env.",
        )

    sensor_context = await build_sensor_context(db)
    knowledge = retrieve_knowledge(message)
    knowledge_context = "\n\n".join(knowledge) or "No matching documentation."
    system_prompt = """You are the Smart Home.
Answer in Vietnamese. Use only the sensor context and knowledge context provided.
Return valid JSON with exactly these keys:
answer (string), sources (array of strings), action (object or null).
Only propose an action when the user explicitly asks to control roof, fan, or led.
An action must contain device, value (0 or 1), and reason.
Never claim an action was executed; it is only a proposal."""
    user_prompt = (
        f"User request:\n{message}\n\n"
        f"Current sensor context:\n{sensor_context}\n\n"
        f"Knowledge context:\n{knowledge_context}"
    )

    try:
        if provider == "gemini":
            result = await _request_gemini(system_prompt, user_prompt)
        elif provider == "groq":
            result = await _request_groq(system_prompt, user_prompt)
        else:
            result = await _request_openai(system_prompt, user_prompt)
    except httpx.HTTPStatusError as error:
        if error.response.status_code in {402, 429}:
            raise HTTPException(
                status_code=429,
                detail=(
                    f"{provider.capitalize()} quota or billing limit reached. "
                    "Check the provider project billing and quota."
                ),
            ) from error
        if error.response.status_code in {401, 403}:
            raise HTTPException(
                status_code=502,
                detail=(
                    f"{provider.capitalize()} API key is invalid or "
                    "does not have access to this model."
                ),
            ) from error
        if error.response.status_code == 404:
            raise HTTPException(
                status_code=502,
                detail=(
                    f"{provider.capitalize()} model "
                    f"'{settings.groq_model}' was not found or is unavailable."
                ),
            ) from error
        raise HTTPException(
            status_code=502,
            detail=f"{provider.capitalize()} API request failed.",
        ) from error
    except (httpx.HTTPError, KeyError, IndexError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=502,
            detail=f"{provider.capitalize()} could not produce a valid response.",
        ) from error

    action = result.get("action")
    if not isinstance(action, dict):
        action = None
    return AIAnswerResponse(
        answer=str(result.get("answer", "")),
        sources=[str(source) for source in result.get("sources", [])],
        action=DeviceActionProposal.model_validate(action) if action else None,
    )


async def _request_openai(system_prompt: str, user_prompt: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{settings.openai_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.openai_model,
                "temperature": 0.2,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            },
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return json.loads(content)


async def _request_groq(system_prompt: str, user_prompt: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            f"{settings.groq_base_url}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.groq_model,
                "temperature": 0.2,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            },
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return json.loads(content)


async def _request_gemini(system_prompt: str, user_prompt: str) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            (
                f"{settings.gemini_base_url}/models/"
                f"{settings.gemini_model}:generateContent"
            ),
            params={"key": settings.gemini_api_key},
            headers={"Content-Type": "application/json"},
            json={
                "systemInstruction": {
                    "parts": [{"text": system_prompt}],
                },
                "contents": [
                    {
                        "role": "user",
                        "parts": [{"text": user_prompt}],
                    }
                ],
                "generationConfig": {
                    "temperature": 0.2,
                    "responseMimeType": "application/json",
                },
            },
        )
        response.raise_for_status()
        content = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(content)
