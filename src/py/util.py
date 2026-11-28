import json
from flask import Response

def make_error(code: int, description: str):
    return Response(
        json.dumps({
            "description": description
        }),
        status=code,
        mimetype='application/json'
    )