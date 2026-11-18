import asyncio
import ollama
from werkzeug.datastructures.file_storage import FileStorage

model = "qwen3.5:4b"

async def processImages(img1: FileStorage, img2: FileStorage):
    await asyncio.sleep(1.5)
    return {
        "message": f"{img1[0].filename}, {img2[0].filename}"
    }