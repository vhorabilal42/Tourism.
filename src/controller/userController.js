const User = require("../models/userModels");
const factory = require('./handlerFactory')

exports.getAllUsers = async (req, res) => {
  try {
    const allUser = await User.find()
    return res.status(200).json({
      status: 'success',
      results: allUser.length,
      data: {
        allUser
      }
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message || "Not Get all users."
    });
  }
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

/*
const filterObj = (obj, ...allowedField)=>{
  const newObj = {}
  Object.keys(obj).forEach(el=>{
    if(allowedField.includes(el)){
      newObj[el] = obj[el];
    }
  })
  return newObj;
}
*/
// exports.updateMe = async (req, res)=>{
//   /* Stop them to update the password and conformed password */
//   if(req.body.password || req.body.passwordConform){
//     return res.status(400).json({
//       status: 'fail',
//       message: 'To update password this is not correct routes.'
//     })
//   }
//   /* Get userFrom collection */
//   /* we dont allow the user to update all the things. */

//   const filterBody = filterObj(req.body, 'name', 'email')
//   const Updateduser = await User.findByIdAndUpdate(req.user.id, filterBody, {
//     new: true,
//     runValidators: true
//   });
//   return res.status(201).json({
//     status: 'success',
//     user: {
//       Updateduser
//     }
//   })
//   /* update there values (Name and Email)*/
// };

exports.updateMe = async (req, res) => {
  try {
    // Prevent updating password fields
    if (req.body.password || req.body.passwordConform) {
      return res.status(400).json({
        status: "fail",
        message:
          "This route is not for password updates. Please use /updatePassword.",
      });
    }

    // Destructure allowed fields directly from req.body
    const { name, email } = req.body;

    // Update user in the database with allowed fields
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      {
        new: true,
        runValidators: true,
      }
    );

    // Send the response
    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message || "An error occurred while updating the user.",
    });
  }
};

exports.deleteMe = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
};
