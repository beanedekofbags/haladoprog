import asyncio
import ollama
from werkzeug.datastructures.file_storage import FileStorage
from src.py.classes.image import ImageInput, ImageSearchResult, ImageOutput

model = "qwen3.5:4b"

def processImages(ref_images: list[ImageInput], search_images: list[ImageInput]):
    try:
        # ideiglenes, nem túl jól működik egyelőre. adok majd egy szövegdobozt ahol a felhasználó megadhatja pontosan mit akar a referenciákból, hogy ne az AI-nak kelljen kitalálni lol
        setup = {'role':'system', 'content': """
                You are provided a list of images. All images except the last one serve as reference images. You will try to look for any pattern that connects these images. Then say if that pattern can be found in the final image.
                Your output will be a JSON response with the following structure:
                    - "pattern" = A short description for the pattern you are using to match between the reference images and the final image.
                    - "confidence" = How confident you are (any number from 0 to 100) that the pattern in the reference images matches that in the final image.
                """}

        results = []
        for search in search_images:
            response = ollama.chat(
                model=model,
                think=False,
                messages=[
                    setup,
                    {
                        'role':'user',
                        'images': [ *[ref.data for ref in ref_images], search.data ]
                    }
                ],
                options = {
                    "num_ctx": 32768,
                    "temperature": 0
                },
                format=ImageSearchResult.model_json_schema()
            )
            json = ImageSearchResult.model_validate_json(response.message.content)
            results.append(ImageOutput(search.name, list(json)).json())
        return {
            "message": f"{results}"
        }
    except Exception as e:
        return {
            "error": repr(e)
        }