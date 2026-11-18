import asyncio
import ollama
from pydantic import BaseModel, ValidationError
from werkzeug.datastructures.file_storage import FileStorage

model = "qwen3.5:4b"

class ImageSearchResult(BaseModel):
    confidence: float

def processImages(ref_images: list[bytes], search_images: list[bytes]):

    try:
        setup = {'role':'system', 'content': """
                You are provided 2 images. The first image is your reference. Your task is to search the second image for patterns or objects based on the reference image.
                Your output will be a JSON response with the following structure:
                    - "confidence" = How confident you are (0.0-1.0) that the object or pattern occurs in the image.
                """}

        results = []
        for search in search_images:
            results1 = []
            for ref in ref_images:
                response = ollama.chat(
                    model=model,
                    think=False,
                    messages=[
                        setup,
                        {
                            'role':'user', 
                            'content':'Look for patterns in the second image based on the reference image.',
                            'images': [ ref, search ]
                        }
                    ],
                    options = {
                        "num_ctx": 32768,
                        "temperature": 0
                    },
                    format=ImageSearchResult.model_json_schema()
                )
                json = ImageSearchResult.model_validate_json(response.message.content)
                results1.append(json)
            results.append(results1)
        return {
            "message": f"{results}"
        }
    except Exception as e:
        return {
            "error": repr(e)
        }