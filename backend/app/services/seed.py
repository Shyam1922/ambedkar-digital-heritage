from sqlalchemy import select
from sqlalchemy.orm import Session
from app.models import ArchiveItem, DocumentChunk, TimelineEvent, Admin
from app.core.security import hash_password
from app.services.ingestion import chunk_text

SOURCE = "Ambedkar.org / public archival texts"
URL = "https://ambedkar.org/"
ITEMS = [
 ("A-001", "Annihilation of Caste", "Writing", "1936", "B. R. Ambedkar", "A public address prepared for the Jat-Pat-Todak Mandal.", "caste, equality, social reform", "Caste is not merely a division of labour. It is also a division of labourers. It is a hierarchy in which the divisions of labourers are graded one above the other. The real remedy for breaking Caste is intermarriage."),
 ("A-002", "The Buddha and His Dhamma", "Book", "1957", "B. R. Ambedkar", "A posthumously published account of the Buddha's life and teaching.", "buddhism, dhamma, equality", "The religion of the Buddha is morality. The Buddha's Dhamma teaches that morality is the essence of religion and that human welfare is its measure."),
 ("A-003", "Constituent Assembly: Objectives Resolution Debate", "Constitutional Debate", "1946-12-17", "B. R. Ambedkar", "Intervention during deliberations on the Objectives Resolution.", "constitution, democracy, unity", "The resolution aims at creating a united India and a Constitution which will make India a united democratic country."),
 ("A-004", "Constituent Assembly: Final Speech", "Constitutional Debate", "1949-11-25", "B. R. Ambedkar", "Closing speech before adoption of the Constitution.", "constitution, democracy, liberty, equality", "Political democracy cannot last unless there lies at the base of it social democracy. Social democracy means a way of life which recognises liberty, equality and fraternity as the principles of life."),
 ("A-005", "Speech at Mahad Satyagraha", "Speech", "1927", "B. R. Ambedkar", "Public mobilisation for equal access to water and civic rights.", "mahad, equality, civil rights", "We are not going to the Chavdar Tank to merely drink its water. We are going to the Tank to assert that we too are human beings like others."),
 ("A-006", "What Congress and Gandhi Have Done to the Untouchables", "Book", "1945", "B. R. Ambedkar", "A political analysis of representation and caste discrimination.", "representation, rights, untouchability", "The emancipation of the Untouchables depends upon their acquiring political power and upon safeguards that make equality effective."),
 ("A-007", "States and Minorities", "Writing", "1947", "B. R. Ambedkar", "Memorandum proposing constitutional safeguards and economic democracy.", "minorities, constitution, economic democracy", "The purpose of a Constitution is not merely to create organs of the State but to secure conditions in which liberty and equality can be realised."),
 ("A-008", "The Constitution of India", "Constitutional Document", "1949-11-26", "Constituent Assembly of India", "The supreme law of India, drafted by the Constituent Assembly with Dr. B. R. Ambedkar as Chairman of the Drafting Committee.", "constitution, fundamental rights, law, democracy", "We, the People of India, having solemnly resolved to constitute India into a sovereign socialist secular democratic republic and to secure to all its citizens justice, liberty, equality and fraternity, adopt, enact and give to ourselves this Constitution."),
 ("A-009", "Castes in India: Their Mechanism, Genesis and Development", "Article", "1916", "B. R. Ambedkar", "Early academic paper on caste formation.", "caste, sociology, endogamy", "Endogamy is the only characteristic that is peculiar to caste and it is the key to understanding the mechanism of caste."),
 ("A-010", "Pakistan or the Partition of India", "Book", "1940", "B. R. Ambedkar", "Study of communal politics, constitutional arrangements and partition.", "politics, partition, minorities", "Constitutional arrangements must be judged by whether they protect minorities and permit a stable democratic order."),
]
EVENTS = [
 ("T-001","1891-04-14","Birth in Mhow","B. R. Ambedkar was born in Mhow, Central Provinces.",["A-009"]),
 ("T-002","1913","Studies at Columbia University","Ambedkar began graduate study in the United States.",["A-009"]),
 ("T-003","1916","Castes in India paper","He presented his paper on caste formation.",["A-009"]),
 ("T-004","1923","The Problem of the Rupee","His economic study on currency and the value of the rupee was published.",[]),
 ("T-005","1927","Mahad Satyagraha","Campaign for equal access to public water.",["A-005"]),
 ("T-006","1930","Round Table Conference","Ambedkar represented the Depressed Classes in London.",["A-006"]),
 ("T-007","1932","Poona Pact","Agreement concerning political representation for Depressed Classes.",["A-006"]),
 ("T-008","1935","Yeola declaration","Ambedkar announced his intention to leave Hinduism.",["A-001"]),
 ("T-009","1936","Annihilation of Caste","The prepared address was published as a book.",["A-001"]),
 ("T-010","1942","Viceroy's Executive Council","Ambedkar served as Labour Member.",["A-006"]),
 ("T-011","1946","Constituent Assembly","He entered the Constituent Assembly debates.",["A-003"]),
 ("T-012","1947-08-29","Drafting Committee","Ambedkar was appointed chairman of the Drafting Committee.",["A-007"]),
 ("T-013","1949-11-26","Constitution adopted","The Constituent Assembly adopted the Constitution of India.",["A-004","A-008"]),
 ("T-014","1951","Resignation from Cabinet","Ambedkar resigned as Law Minister.",["A-007"]),
 ("T-015","1956-10-14","Conversion at Nagpur","Ambedkar embraced Buddhism with followers at Nagpur.",["A-002"]),
 ("T-016","1956-12-06","Death in Delhi","B. R. Ambedkar died in Delhi.",["A-002"]),
]


def seed_database(db: Session) -> None:
    if not db.scalar(select(Admin.id).limit(1)):
        db.add(
            Admin(
                username="admin",
                password_hash=hash_password("admin123"),
            )
        )
        db.commit()

    if db.scalar(select(ArchiveItem.id).limit(1)):
        return
    lookup = {}
    for archive_id, title, kind, date, author, description, tags, text in ITEMS:
        item = ArchiveItem(archive_id=archive_id, title=title, type=kind, date=date, author_speaker=author, description=description, tags=tags, source=SOURCE, source_url=URL, extracted_text=text, verification_status="DEMO / NOT VERIFIED")
        db.add(item); db.flush(); lookup[archive_id] = item
        for index, (page_number, chunk) in enumerate(chunk_text([(None, text)])):
            db.add(
                DocumentChunk(
                archive_item_id=item.id,
                chunk_text=chunk,
                chunk_index=index,
                page_number=page_number,
                vector_metadata="fallback-keyword"
                )
            )
    for event_id, date, title, description, related in EVENTS:
        db.add(TimelineEvent(event_id=event_id, date=date, title=title, description=description, image="", verification_status="DEMO / NOT VERIFIED", archive_items=[lookup[key] for key in related]))
    db.commit()
