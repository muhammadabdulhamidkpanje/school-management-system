const jwt = require('jsonwebtoken');


function protect(reg, res, next){
    const token = reg.headers.authorization.split(" ")[1];
    if(!token){ res.status(401).json({message: "unauthorized access"})}
try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    reg.user = decoded;

    next();
    
}
catch(error){
    res.status(403).json({message: "invalid token" + error.message})
}
}

module.exports = {protect};