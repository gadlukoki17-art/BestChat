const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "https://gadlukoki17-art.github.io"
];

const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error(`Origin not allowed by CORS: ${origin}`)
        );
    },
    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],
    allowedHeaders: [
        "Content-Type",
        "Authorization"
    ],
    optionsSuccessStatus: 204
};

// Le CORS doit être placé avant les routes
app.use(cors(corsOptions));

// Lire les données JSON envoyées par le frontend
app.use(express.json());

// Route de test
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "BestChat server is running"
    });
});

// Proxy vers l’API Kadea
app.use("/api", async (req, res) => {
    try {
        const kadeaApiUrl = process.env.KADEA_API_URL;
        const kadeaApiKey = process.env.KADEA_API_KEY;

        if (!kadeaApiUrl || !kadeaApiKey) {
            console.error("Missing Kadea environment variables");

            return res.status(500).json({
                success: false,
                message: "Server configuration error"
            });
        }

        const targetUrl = `${kadeaApiUrl}${req.url}`;

        const headers = {
            "Content-Type": "application/json",
            "x-api-key": kadeaApiKey
        };

        // Transmettre le token du frontend
        if (req.headers.authorization) {
            headers.Authorization = req.headers.authorization;
        }

        const options = {
            method: req.method,
            headers
        };

        // GET et HEAD ne doivent pas contenir de body
        if (!["GET", "HEAD"].includes(req.method)) {
            options.body = JSON.stringify(req.body);
        }

        const apiResponse = await fetch(targetUrl, options);

        const contentType =
            apiResponse.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const data = await apiResponse.json();

            return res
                .status(apiResponse.status)
                .json(data);
        }

        const text = await apiResponse.text();

        return res
            .status(apiResponse.status)
            .send(text);
    } catch (error) {
        console.error("Proxy error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Gestion des erreurs CORS et autres erreurs Express
app.use((error, req, res, next) => {
    console.error("Server error:", error.message);

    if (error.message.startsWith("Origin not allowed by CORS")) {
        return res.status(403).json({
            success: false,
            message: error.message
        });
    }

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// Démarrer le serveur
app.listen(PORT, "0.0.0.0", () => {
    console.log(`BestChat server started on port ${PORT}`);
});