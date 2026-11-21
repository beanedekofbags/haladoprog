from pydantic import BaseModel

class ImageSearchResult(BaseModel):
    name: str
    confidence: int

class ImageInput:
    def __init__(self, data: bytes, name: str):
        self.data = data
        self.name = name

class ImageOutput:
    def __init__(self, name: str, results: list[ImageSearchResult]):
        self.name = name
        self.results = results

    def json(self):
        return {
            'name': self.name,
            'results': self.results
        }