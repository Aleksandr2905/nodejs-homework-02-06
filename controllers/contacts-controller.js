import fs from "fs/promises";
import path from "path";
import Contact from "../models/Contact.js";
import { HttpError } from "../helpers/index.js";
import { ctrlWrapper } from "../decorators/index.js";

const avatarsPath = path.resolve("public", "avatars");

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const result = await Contact.find({ owner }, "-createAt -updateAt", {
    skip,
    limit,
  });
  const total = await Contact.countDocuments({ owner });
  res.json({ result, total });
};

const getById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;

  // const result = await Contact.findById(id);
  const result = await Contact.findOne({ _id: id, owner });
  if (!result) {
    throw HttpError(404, "Not Found");
  }
  res.json(result);
};

const add = async (req, res) => {
  const { _id: owner } = req.user;
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarsPath, filename);
  await fs.rename(oldPath, newPath);
  const avatar = path.join("avatars", filename);
  const result = await Contact.create({ ...req.body, avatar, owner });
  res.status(201).json(result);
};

const updateById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  // const result = await Contact.findByIdAndUpdate(id, req.body);
  const result = await Contact.findOneAndUpdate({ _id: id, owner }, req.body);
  if (!result) {
    throw HttpError(404, "Not Found");
  }
  res.json(result);
};

const deleteById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  // const result = await Contact.findByIdAndDelete(id);
  const result = await Contact.findOneAndDelete({ _id: id, owner });
  if (!result) {
    throw HttpError(404, "Not Found");
  }
  res.json({ message: "contact deleted" });
};

const updateFavoriteById = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  // const result = await Contact.findByIdAndUpdate(id, req.body);
  const result = await Contact.findOneAndUpdate({ _id: id }, req.body);
  if (!result) {
    throw HttpError(400, "missing field favorite");
  }
  res.json(result);
};

export default {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  add: ctrlWrapper(add),
  updateById: ctrlWrapper(updateById),
  deleteById: ctrlWrapper(deleteById),
  updateFavoriteById: ctrlWrapper(updateFavoriteById),
};
