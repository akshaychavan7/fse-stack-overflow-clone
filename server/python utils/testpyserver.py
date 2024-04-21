import pytest
from fastapi.testclient import TestClient
from pyserver import app 

client = TestClient(app)

def test_generate_tags():
    request_body = {"title": "Example Title", "description": "Example Description"}
    
    response = client.post("/tag/generateTags/", json=request_body)
    
    assert response.status_code == 200
    
    assert isinstance(response.json(), list)

def test_root():
    response = client.get("/")
    
    assert response.status_code == 200
    
    assert response.json() == {"message": "Python Server Works"}

# To run the tests, in terminal type -
# pytest testpyserver.py
