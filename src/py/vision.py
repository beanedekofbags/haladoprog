import asyncio
import ollama
from werkzeug.datastructures.file_storage import FileStorage
from src.py.classes.image import ImageInput, ImageSearchResult, ImageOutput

model = "qwen3.5:4b"

def processImages(ref_images: list[ImageInput], search_images: list[ImageInput], description: str):
    try:
        # Find a pattern in the reference image(s) that matches the provided description, then, only once you find a matching pattern, try to match the reference images against the target image using this pattern and the description provided. 
        setup = {'role':'system', 'content': f"""
                You are provided a list of images and a description. Every image until the last one is to be used as your reference. The last image in the list is the target image which you will be comparing the references against. If there are only two images, then the first one is the reference, the second one is the target.
                Your task is to match the reference image (or images) against the target image. Use the description provided by the user to narrow down the point of comparison between the reference image (or images) and the target image.
                It is possible that there are no matches between the reference (or references) and the target.
                Your output will be a JSON response with the following structure:
                    - "count" = If there is a matching pattern in the target image, how many occurrences of it there are.
                    - "confidence" = If there is a matching pattern in the target image, a confidence value (0-100) based on how accurately the patterns match. 0 means there is no match at all, 100 means it is a perfect match.
                """}

        results = []
        for search in search_images:
            print(f"Analyzing {search.name}")
            response = ollama.chat(
                model=model,
                messages=[
                    setup,
                    {
                        'role':'user',
                        'content': f"The description is: \"{description}\".",
                        'images': [ *[ref.imgdata for ref in ref_images], search.imgdata ]
                    }
                ],
                options = {
                    "num_ctx": 32768,
                    "temperature": 0
                },
                format=ImageSearchResult.model_json_schema()
            )
            result = ImageSearchResult.model_validate_json(response.message.content)
            results.append(ImageOutput(search.name, result).json())
        return {
            "data": results
        }
    except Exception as e:
        return {
            "error": repr(e)
        }