from fastapi import APIRouter
from fastapi.responses import FileResponse

router = APIRouter()


@router.get("/", response_class=FileResponse, include_in_schema=False)
async def serve_ui():
    return FileResponse("static/index.html")
