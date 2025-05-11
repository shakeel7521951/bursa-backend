import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    let token = req.cookies?.token;
    
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1]; 
        }
    }

    if (!token) {
        return res.status(401).json({ message: "You are not logged in. Please login first!" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: "Invalid or expired token" });
    }
};

export default auth;
