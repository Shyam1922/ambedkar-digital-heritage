from fastapi.testclient import TestClient
from app.main import app


def test_health():
    with TestClient(app) as client:
        assert client.get("/health").json() == {"status": "ok"}


def test_archive_and_timeline_are_seeded():
    with TestClient(app) as client:
        assert client.get("/archive").json()["total"] >= 10
        assert len(client.get("/timeline").json()) >= 15


def test_search_and_research_are_cited():
    with TestClient(app) as client:
        results = client.post("/search", json={"query": "views on equality"}).json()
        assert results and results[0]["citation"]["archive_id"]
        response = client.post("/research", json={"query": "views on equality"}).json()
        assert response["sources"] and not response["insufficient_information"]


def test_no_result_is_honest():
    with TestClient(app) as client:
        response = client.post("/research", json={"query": "astronomy nebula galaxies"}).json()
        assert response["insufficient_information"] is True
