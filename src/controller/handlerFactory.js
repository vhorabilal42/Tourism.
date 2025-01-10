const { Model } = require("mongoose");

const deleteOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).json({
        status: "fail",
        message: "No documents Found this ID",
      });
    }

    return res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

const updateOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // show the update record
      runValidators: true, // the validator put in mondoDB is also apply during update.
    });
    res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error,
    });
  }
};

const createOne = (Model) => async (req, res) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({
      message: "Tour is create",
      status: "success",
      data: {
        doc,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

module.exports = {
  deleteOne,
  updateOne,
  createOne
};
