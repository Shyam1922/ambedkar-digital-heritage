import io
from fastapi.testclient import TestClient
from app.main import app


def get_auth_headers(client: TestClient) -> dict:
    login_res = client.post("/admin/login", json={"username": "admin", "password": "admin123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_unauthenticated_requests_rejected():
    with TestClient(app) as client:
        assert client.get("/admin/archive").status_code in {401, 403}
        assert client.get("/admin/archive/A-001").status_code in {401, 403}
        assert client.post("/admin/archive").status_code in {401, 403}
        assert client.delete("/admin/archive/A-001").status_code in {401, 403}


def test_admin_login_and_me():
    with TestClient(app) as client:
        headers = get_auth_headers(client)
        me_res = client.get("/admin/me", headers=headers)
        assert me_res.status_code == 200
        assert me_res.json()["username"] == "admin"


def test_admin_list_and_get_archive():
    with TestClient(app) as client:
        headers = get_auth_headers(client)
        res = client.get("/admin/archive", headers=headers)
        assert res.status_code == 200
        items = res.json()
        assert len(items) >= 10

        item_res = client.get("/admin/archive/A-001", headers=headers)
        assert item_res.status_code == 200
        assert item_res.json()["archive_id"] == "A-001"

        missing_res = client.get("/admin/archive/NON-EXISTENT", headers=headers)
        assert missing_res.status_code == 404


def test_admin_update_metadata_and_verification():
    with TestClient(app) as client:
        headers = get_auth_headers(client)

        # Unauthenticated updates are rejected.
        assert client.patch("/admin/archive/A-001", json={"title": "x"}).status_code in {401, 403}

        # Update metadata and the verification status (review workflow).
        res = client.patch(
            "/admin/archive/A-001",
            json={"title": "Annihilation of Caste (reviewed)", "verification_status": "VERIFIED"},
            headers=headers,
        )
        assert res.status_code == 200
        body = res.json()
        assert body["title"] == "Annihilation of Caste (reviewed)"
        assert body["verification_status"] == "VERIFIED"

        # Change is persisted.
        detail = client.get("/admin/archive/A-001", headers=headers).json()
        assert detail["verification_status"] == "VERIFIED"

        # Empty payloads and unknown ids are handled.
        assert client.patch("/admin/archive/A-001", json={}, headers=headers).status_code == 400
        assert client.patch("/admin/archive/NON-EXISTENT", json={"title": "x"}, headers=headers).status_code == 404

        # The public detail endpoint still exposes full extracted_text.
        public = client.get("/archive/A-001").json()
        assert len(public["extracted_text"]) > 200


def test_admin_ingest_and_delete_document():
    with TestClient(app) as client:
        headers = get_auth_headers(client)
        sample_text = (
            "Equality of opportunity is not enough without equality of conditions. "
            "Dr. B. R. Ambedkar stressed the necessity of social and economic democracy. "
            "Without social democracy, political democracy cannot survive in the long run."
        )
        file_content = io.BytesIO(sample_text.encode("utf-8"))

        data = {
            "archive_id": "TEST-ADMIN-001",
            "title": "Admin Ingestion Test Document",
            "description": "A test archival document for admin ingestion verification.",
            "document_type": "Essay",
            "date": "1945",
            "author_speaker": "B. R. Ambedkar",
            "language": "English",
            "source": "Historical Archives",
            "source_url": "https://example.com/doc",
            "tags": "equality, democracy, constitution",
            "content_start_page": "1",
        }
        files = {
            "file": ("test_doc.txt", file_content, "text/plain")
        }

        # 1. Ingest document via POST /admin/archive
        create_res = client.post("/admin/archive", data=data, files=files, headers=headers)
        assert create_res.status_code == 200
        created = create_res.json()
        assert created["archive_id"] == "TEST-ADMIN-001"
        assert created["title"] == "Admin Ingestion Test Document"
        assert created["short_summary"] != ""

        # 2. Verify duplicate archive_id is rejected with 409
        dup_file = io.BytesIO(sample_text.encode("utf-8"))
        dup_res = client.post("/admin/archive", data=data, files={"file": ("test_doc.txt", dup_file, "text/plain")}, headers=headers)
        assert dup_res.status_code == 409

        # 3. Verify document appears in admin list and admin detail
        detail_res = client.get("/admin/archive/TEST-ADMIN-001", headers=headers)
        assert detail_res.status_code == 200
        assert detail_res.json()["archive_id"] == "TEST-ADMIN-001"

        # 4. Verify document is searchable in search route
        search_res = client.post("/search", json={"query": "equality of conditions"}).json()
        assert any(item["citation"]["archive_id"] == "TEST-ADMIN-001" for item in search_res)

        # 5. Delete document via DELETE /admin/archive/{archive_id}
        del_res = client.delete("/admin/archive/TEST-ADMIN-001", headers=headers)
        assert del_res.status_code == 200
        assert del_res.json()["archive_id"] == "TEST-ADMIN-001"

        # 6. Verify it is now 404
        assert client.get("/admin/archive/TEST-ADMIN-001", headers=headers).status_code == 404
        assert client.delete("/admin/archive/TEST-ADMIN-001", headers=headers).status_code == 404


def test_admin_ingest_invalid_file():
    with TestClient(app) as client:
        headers = get_auth_headers(client)
        data = {
            "archive_id": "TEST-INVALID",
            "title": "Invalid File Test",
            "description": "Invalid file type",
            "document_type": "Image",
            "date": "1950",
            "author_speaker": "Unknown",
            "source": "Source",
        }
        files = {
            "file": ("image.png", io.BytesIO(b"fake image data"), "image/png")
        }
        res = client.post("/admin/archive", data=data, files=files, headers=headers)
        assert res.status_code == 400
        assert "PDF and TXT" in res.json()["detail"]


def test_kiosk_and_reader_endpoints_functional():
    with TestClient(app) as client:
        # Kiosk archive list & detail
        kiosk_res = client.get("/kiosk/archive")
        assert kiosk_res.status_code == 200
        data = kiosk_res.json()
        assert data["total"] >= 10

        item_res = client.get("/kiosk/archive/A-001")
        assert item_res.status_code == 200
        assert item_res.json()["archive_id"] == "A-001"

        # Kiosk responses must never expose the full document body.
        assert "extracted_text" not in item_res.json()
        assert all("extracted_text" not in item for item in data["items"])

        # Kiosk timeline
        timeline_res = client.get("/kiosk/timeline")
        assert timeline_res.status_code == 200
        assert len(timeline_res.json()) >= 15
        for event in timeline_res.json():
            for related in event["related_archive_items"]:
                assert "extracted_text" not in related

        # Kiosk search
        kiosk_search_res = client.get("/kiosk/search?q=caste")
        assert kiosk_search_res.status_code == 200
        assert len(kiosk_search_res.json()) >= 1

