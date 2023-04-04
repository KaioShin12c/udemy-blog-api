const Category = require("../../models/Category/Category");
const { appErr } = require("../../utils/appErr");

const createCategoryCtrl = async (req, res, next) => {
  const { title } = req.body;
  try {
    const category = await Category.create({ title, user: req.userAuth });
    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};
const fetchCategoriesCtrl = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};
const categoryDetailsCtrl = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};
const deleteCategoryCtrl = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({
      status: "success",
      data: "Delete category successfully",
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};
const updateCategoryCtrl = async (req, res, next) => {
  const { title } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );
    res.json({
      status: "success",
      data: category,
    });
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

module.exports = {
  createCategoryCtrl,
  fetchCategoriesCtrl,
  categoryDetailsCtrl,
  deleteCategoryCtrl,
  updateCategoryCtrl,
};
