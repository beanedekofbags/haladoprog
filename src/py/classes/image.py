from pydantic import BaseModel

class ImageSearchResult(BaseModel):
    confidence: int
    count: int

class ImageInput:
    def __init__(self, imgdata: bytes, name: str):
        self.imgdata = imgdata
        self.name = name

class ImageOutput:
    def __init__(self, name: str, results: ImageSearchResult):
        self.name = name
        self.results = results

    def json(self):
        return {
            'name': self.name,
            'results': self.results.model_dump(mode="json")
        }