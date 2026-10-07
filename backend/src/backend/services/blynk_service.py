import httpx

from backend.core.config import settings
from backend.schemas.blynk import BlynkStatus
from fastapi import HTTPException


class BlynkService:

    async def get_all_datastreams(self) -> dict:
        url = f"{settings.blynk_base_url}/external/api/getAll"

        params = {
            "token": settings.blynk_auth_token,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    url,
                    params=params,
                )

            response.raise_for_status()

            return response.json()

        except httpx.TimeoutException:
            raise HTTPException(
                status_code=504,
                detail="Blynk request timed out",
            )

        except httpx.HTTPStatusError:
            raise HTTPException(
                status_code=502,
                detail="Blynk API returned an error",
            )

        except httpx.RequestError:
            raise HTTPException(
                status_code=502,
                detail="Unable to connect to Blynk",
            )

    async def get_status(self) -> BlynkStatus:
        data = await self.get_all_datastreams()

        return BlynkStatus(
            temperature=data.get("v0"),
            humidity=data.get("v1"),
            door=data.get("v2"),
            light=data.get("v3"),
            rain=data.get("v4"),
            gas=data.get("v5"),
            person=data.get("v6"),
            vibration=data.get("v7"),
            rfid=data.get("v8"),
            roof=data.get("v9"),
            fan=data.get("v10"),
            led=data.get("v11"),
        )