from fastapi import FastAPI

from pydantic import BaseModel

from sentence_transformers import SentenceTransformer

from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

class AnalyzeData(BaseModel):

    text: str

    tags: list[str]

semantic_tags = {

    "comedy":
    """
    standup comedy
    funny jokes
    roast
    memes
    laughter
    comic
    prank
    humor
    stand up
    crowd work
    funny video
    satire
    """,

    "politics":
    """
    election
    government
    BJP
    congress
    modi
    parliament
    political debate
    news politics
    geopolitics
    propaganda
    """,

    "war":
    """
    war
    military
    missile
    israel
    palestine
    russia
    ukraine
    attack
    army
    bombing
    terrorism
    conflict
    """,

    "crime":
    """
    murder
    gangster
    mafia
    criminal
    violence
    police case
    attack
    shooting
    drugs
    """,

    "ragebait":
    """
    controversy
    outrage
    toxic debate
    triggering
    angry rant
    exposed
    cancel
    attention seeking
    drama
    """
}

@app.get("/")
def home():

    return {
        "message": "Semantic AI Running"
    }

@app.post("/classify")
def classify(data: AnalyzeData):

    video_embedding = model.encode(
        [data.text]
    )

    best_tag = None

    best_score = 0

    for tag in data.tags:

        semantic_text = semantic_tags.get(
            tag,
            tag
        )

        tag_embedding = model.encode(
            [semantic_text]
        )

        similarity = cosine_similarity(
            video_embedding,
            tag_embedding
        )[0][0]

        print(tag, similarity)

        if similarity > best_score:

            best_score = similarity

            best_tag = tag

    blocked = best_score > 0.18

    return {

        "blocked": bool(blocked),

        "matched_tag": str(best_tag),

        "confidence": float(best_score)
    }