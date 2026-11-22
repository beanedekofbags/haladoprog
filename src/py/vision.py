import asyncio
import ollama
from werkzeug.datastructures.file_storage import FileStorage
from src.py.classes.image import ImageInput, ImageSearchResult, ImageOutput

model = "qwen3.5:4b"

def processImages(ref_images: list[ImageInput], search_images: list[ImageInput], description: str):
    try:
        # ideiglenes, nem túl jól működik egyelőre. adok majd egy szövegdobozt ahol a felhasználó megadhatja pontosan mit akar a referenciákból, hogy ne az AI-nak kelljen kitalálni lol
        setup = {'role':'system', 'content': f"""
                You are provided a list of images. Every image until the last one is to be used as your reference. The last image in the list is the target image which you will be comparing the references against. If there are only two images, then the first one is the reference, the second one is the target.
                Find a pattern in the reference image(s) that matches the description: "{description}", then, if and only if you find a pattern matching the description, match the reference images against the target image using this pattern. 
                It is possible that there is no matching pattern between the references and the target.
                Your output will be a JSON response with the following structure:
                    - "confidence" = How confident you are (0-100) that there is a matching pattern given the above instructions.
                """}

        results = []
        for search in search_images:
            response = ollama.chat(
                model=model,
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