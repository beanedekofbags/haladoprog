import asyncio
from werkzeug.datastructures.file_storage import FileStorage

async def processImages(img1: FileStorage, img2: FileStorage):
    return {
        "message": f"{img1.filename}, {img2.filename}"
    }