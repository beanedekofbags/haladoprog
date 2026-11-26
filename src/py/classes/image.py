from pydantic import BaseModel

class ImageSearchResult(BaseModel):
    confidence: int
    count: int

class ImageInput:
    def __init__(self, data: bytes, url: str, name: str):
        self.data = data
        self.url = url
        self.name = name

class ImageOutput:
    def __init__(self, name: str, url: str, results: list[ImageSearchResult]):
        self.name = name
        self.url = url
        self.results = results

    def json(self):
        return {
            'name': self.name,
            'url': self.url,
            'results': self.results
        }