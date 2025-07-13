import API from "../api/axios";

class AuthService{
    async login(username, password) {
        try {
            const res = await API.post("/users/login", { username, password });

            const accessToken = res.data.statusCode.accessToken;
            const user = res.data.statusCode.user;

            


            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("role", user.role);
            API.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
            return user;

        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const res = await API.get("/users/me");
            return res.data.statusCode.user;
        } catch (error) {
            throw error;
        }
    }

    async logout(){
        try {
            const res = await API.post("/users/logout");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");
            delete API.defaults.headers.common["Authorization"];
        } catch (error) {

            throw error;
        }
    }

    isAdmin() {
        return localStorage.getItem("role") === "admin";
    }

    getRole() {
        return localStorage.getItem("role");
    }
}

const authService = new AuthService();
export default authService;