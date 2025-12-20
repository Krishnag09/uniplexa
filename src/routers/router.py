from fastapi import APIRouter

router = APIRouter()


@router.get("/hello")
def read_root():
    hell0 = "Hello, World!"
    return {"message": hell0}
