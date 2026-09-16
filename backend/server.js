const express = require("express");

const cors = require("cors");

const axios = require("axios");

const app = express();

const { YoutubeTranscript } = require("youtube-transcript");

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {

    res.json({
        message: "Semantic Filter Backend Running"
    });

});

app.post("/analyze", async (req, res) => {

    let transcriptText = "";

    try {

        const transcript =
            await YoutubeTranscript.fetchTranscript(
                req.body.videoId
            );

        transcriptText = transcript
            .map(item => item.text)
            .join(" ");

        console.log("Transcript:");

        console.log(
            transcriptText.slice(0, 500)
        );

    } catch (error) {

        console.log(
            "Transcript not available"
        );
    }
    

    try {

        console.log("Received Video Data:");

        console.log(req.body);

        console.log(
            "Thumbnail:",
            req.body.thumbnail
        );

        const aiResponse = await axios.post(
            "http://127.0.0.1:8000/classify",
            {
                text:
                    req.body.title
                    +
                    " "
                    +
                    req.body.description
                    +
                    " "
                    +
                    transcriptText,

                tags:
                    req.body.selectedTags                
            }
        );

        console.log("AI Classification:");

        console.log(aiResponse.data);


        res.json({

            success: true,

            blocked:
                aiResponse.data.blocked,

            matched_tag:
                aiResponse.data.matched_tag,

            confidence:
                aiResponse.data.confidence
        });

    } catch (error) {

        console.error(
            "AI Service Error:",
            error.message
        );

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

const PORT = 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});