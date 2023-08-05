const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const authenticateMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const bearer = authHeader && authHeader.split(" ")[0];
  if (bearer != "Bearer") return res.sendStatus(401);

  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res.status(401).json({
      message: "Not authenticated.",
    });

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err)
      return res.status(403).json({
        message: err.message,
      });
    if (payload) {
      const login = await User.findById(payload._id);
      if (!login) {
        return res.status(401).json({
          message: "Not authenticated.",
        });
      }
      req.user = login;
      next();
    }
  });
};

module.exports = authenticateMiddleware;
