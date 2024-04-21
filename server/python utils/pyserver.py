from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, HOST, PORT, ORIGIN, DATABASE, COLLECTION
from fastapi.middleware.cors import CORSMiddleware

from tagsgen import findtags 

app = FastAPI()

origins = [ORIGIN]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncIOMotorClient(MONGO_URI)

db = client.get_database(DATABASE)
Tag = db.get_collection(COLLECTION)

class tagsGen(BaseModel):
    """
    Data model for input to generate tags.
    """
    title: str
    description: str



@app.post("/tag/generateTags/")
async def generateTags(item: tagsGen):
    """
    Generate tags based on title and description.

    Args:
        item (tagsGen): Pydantic model representing the input data with `title` and `description` fields.

    Returns:
        list: A list containing the generated tags.

    Raises:
        HTTPException: If there is an error during tag generation.
    """
    try:
        text = item.title.strip() + " " + item.description.strip()
        tags = []
        async for tag in Tag.find({}, {"name": 1, "_id": 0}):
            tags.append(tag['name'])
        return findtags(text, tags)
    except Exception as e:
        return {"error": "Error in generating tags."}
        

@app.get("/")
async def root():
    """
    Root endpoint to check if the server is running.

    Returns:
        dict: A simple message indicating that the server is running.
        
    Raises:
        HTTPException: If there is an error during tag generation.
    """
    try:
        return {"message": "Python Server Works"}
    except Exception as e:
        return {"error": "Python server is down."}


# Run this file to run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("pyserver:app", host=HOST, port=PORT, reload=True)
