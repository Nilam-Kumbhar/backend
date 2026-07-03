// helper file
const asyncHandler = (requestHandler) =>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err) => next(err))
    }
}



export {asyncHandler}

//it is higher order funtion that accepts as a parameter or return as a veriable
// const asyncHandler = () => {}
// const asyncHandler = (fn) => () => {} //further function
// const asyncHandler = (fn) => async() => {} //make async
         

        //work as wraper 
// const asyncHandler = (fn) => async (req,res,next) => {
//     try{
//         await fn(req,res,next)
//     }catch(error){
//         res.status(error.code || 500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }

