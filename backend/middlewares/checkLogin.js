export async function checkLogin(req,res,next){
    // Bypassing auth for development
    // if(!req.cookies.user){
    //     return res.status(401).json({msg:"logged out"});
    // }
    next();
}
