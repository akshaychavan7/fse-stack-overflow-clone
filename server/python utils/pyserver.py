from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient

from tagsgen import findtags 

app = FastAPI()

MONGO_URI = "mongodb://localhost:27017/"
client = AsyncIOMotorClient(MONGO_URI)

db = client.get_database("fake_so_fse")
Tag = db.get_collection("Tag")
# Define a Pydantic model for the data expected in the POST request
class tagsGen(BaseModel):
    title: str
    description: str


# Endpoint to handle POST requests to create a new item
@app.post("/question/generateTags/")
async def generateTags(item: tagsGen):
    text = item.title.strip() + " " + item.description.strip()
    tags = []
    async for tag in Tag.find({}, {"name": 1, "_id": 0}):
        tags.append(tag['name'])
    return findtags(text, tags)


# Run this file to run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("pyserver:app", host="0.0.0.0", port=8001, reload=True)
