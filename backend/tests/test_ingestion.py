from app.services.ingestion import chunk_text, select_content_pages, stitch_chunks


def test_chunk_text_stops_at_final_chunk_and_preserves_overlap():
    text = " ".join(f"word{index}" for index in range(600))
    chunks = chunk_text([(7, text)], size=120, overlap=20)

    assert chunks
    assert len(chunks) < 100
    assert all(page_number == 7 and 0 < len(chunk) <= 120 for page_number, chunk in chunks)
    assert chunks[-1][1] not in {"w", "wo", "wor"}
    assert chunks[1][1].split()[0] in chunks[0][1]


def test_chunk_text_does_not_emit_descending_tail_fragments():
    chunks = chunk_text([(1, "a" * 750)], size=700, overlap=100)
    assert [len(chunk) for _, chunk in chunks] == [700, 150]


def test_stitch_chunks_removes_retrieval_overlap_for_page_display():
    source = "The Conference was to meet at Easter, but was subsequently postponed."
    chunks = [(1, source[:52]), (1, source[32:])]
    assert stitch_chunks([chunk for _, chunk in chunks]) == source


def test_select_content_pages_is_conservative_by_default():
    pages = [(1, "cover"), (2, "publisher"), (3, "content")]
    assert select_content_pages(pages) == pages


def test_select_content_pages_keeps_original_numbers_after_exclusion():
    pages = [(1, "cover"), (2, "publisher"), (3, "content"), (4, "contents"), (5, "article")]
    assert select_content_pages(pages, content_start_page=1, excluded_pages={2, 4}) == [(1, "cover"), (3, "content"), (5, "article")]


def test_select_content_pages_honours_content_start_page():
    pages = [(1, "cover"), (2, "imprint"), (3, "article")]
    assert select_content_pages(pages, content_start_page=3) == [(3, "article")]
