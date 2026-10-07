import asyncio

from backend.services.blynk_service import BlynkService


async def main():
    service = BlynkService()

    data = await service.get_all_datastreams()

    print(data)


if __name__ == "__main__":
    asyncio.run(main())