import axios from "axios";

export default (baseURL) => {
    const api = axios.create({
        baseURL,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

    api.interceptors.request.use(
        (config) => {
            const userRaw = localStorage.getItem("user");
            const farmRaw = localStorage.getItem("farm");

            let currentAuth = null;

            try {
                const user = userRaw ? JSON.parse(userRaw) : null;
                const farm = farmRaw ? JSON.parse(farmRaw) : null;

                // Nếu user là farm thì ưu tiên farm
                if (user && (user.role === "farm" || user.role === "Farm")) {
                    currentAuth = farm || user;
                } else {
                    currentAuth = user;
                }
            } catch (error) {
                currentAuth = null;
            }

            if (currentAuth) {
                config.headers["x-user"] = encodeURIComponent(
                    JSON.stringify(currentAuth)
                );
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    return api;
};