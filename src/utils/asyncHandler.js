const asyncHandler = (requestHandler) => {
   return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}

export {asyncHandler}

// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success:false,
//             message: error.message
//         })
//     }
// }

//The asyncHandler function you're asking about is a middleware wrapper used in Node.js (usually with Express.js) to handle asynchronous errors in route handlers