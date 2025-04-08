"use strict";

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// connect to mongoDB
const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected...");
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// Create Issue Schema and Model
const IssueSchema = new mongoose.Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: "" },
  status_text: { type: String, default: "" },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true },
  project: { type: String, required: true },
});

const Issue = mongoose.model("Issue", IssueSchema);

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      let project = req.params.project;

      // create filter object with project name
      let filter = { project: project };

      // Add any query parameters to the filter
      const queryParams = { ...req.query };
      Object.keys(queryParams).forEach((key) => {
        filter[key] = queryParams[key];
      });

      // Find issues matching the filter
      Issue.find(filter)
        .then((issues) => {
          res.json(issues);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error retrieving issues");
        });
    })

    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;

      // check for required fields
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }

      // Crete new issue
      const newIssue = new Issue({
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        project,
      });

      // Save to database
      newIssue
        .save()
        .then((savedIssue) => {
          res.json(savedIssue);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Error saving issue");
        });
    })

    .put(function (req, res) {
      let project = req.params.project;
      const { _id, ...updateFields } = req.body;

      // Check if _id is provided
      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      // Check if at least one field to update is provided
      const fieldsToUpdate = Object.keys(updateFields).filter(
        (key) => updateFields[key] !== "" && updateFields[key] !== undefined
      );

      if (fieldsToUpdate.length === 0) {
        return res.json({ error: "no update field(s) sent", _id });
      }

      // Create update object with only provided fields
      const updateObj = {};
      fieldsToUpdate.forEach((field) => {
        updateObj[field] = updateFields[field];
      });

      // Always update the updated_on field
      updateObj.updated_on = new Date();

      // Validate _id format
      if (!ObjectId.isValid(_id)) {
        return res.json({ error: "could not update", _id });
      }

      // Update the issue
      Issue.findOneAndUpdate({ _id, project }, updateObj, { new: true })
        .then((updatedIssue) => {
          if (!updatedIssue) {
            return res.json({ error: "could not update", _id });
          }
          res.json({ result: "successfully updated", _id });
        })
        .catch((err) => {
          console.error(err);
          res.json({ error: "could not update", _id });
        });
    })

    .delete(function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;

      // Check if _id is provided
      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      // Validate _id format
      if (!ObjectId.isValid(_id)) {
        return res.json({ error: "Could not delete", _id });
      }

      // Delete the issue
      Issue.findOneAndDelete({ _id, project })
        .then((deletedIssue) => {
          if (!deletedIssue) {
            return res.json({ error: "could not delete", _id });
          }
          res.json({ result: "successfully deleted", _id });
        })
        .catch((err) => {
          console.error(err);
          res.json({ error: "could not delete", _id });
        });
    });
};
