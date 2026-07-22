const allowedOrigins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "https://gadlukoki17-art.github.io"
];

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Origin not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());

// Route de test
app.get("/", (req, res) => {
    res.json({
        message: "BestChat server is running"
    });
});

// Proxy vers l’API Kadea
app.use("/api", async (req, res) => {
    try {
        const targetUrl =
            `${process.env.KADEA_API_URL}${req.url}`;

        const headers = {
            "Content-Type": "application/json",
            "x-api-key": process.env.KADEA_API_KEY
        };

        // Transmettre le token de connexion du frontend
        if (req.headers.authorization) {
            headers.Authorization =
                req.headers.authorization;
        }

        const options = {
            method: req.method,
            headers
        };

        // GET et HEAD ne doivent pas avoir de body
        if (!["GET", "HEAD"].includes(req.method)) {
            options.body = JSON.stringify(req.body);
        }

        const apiResponse = await fetch(
            targetUrl,
            options
        );

        const contentType =
            apiResponse.headers.get("content-type");

        if (contentType?.includes("application/json")) {
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

// Demarrer le serveur
app.listen(PORT, () => {
    console.log(
        `BestChat server started on http://localhost:${PORT}`
    );
});