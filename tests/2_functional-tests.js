const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
  //  Store issue ID for use in tests
  let testIssueId;

  // Test project name
  const testProject = "apitest";

  // Test 1:Create an issue with every field
  test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .post(`/api/issues/${testProject}`)
      .send({
        issue_title: "Test Issue",
        issue_text: "This is a test issue with all fields",
        created_by: "Test User",
        assigned_to: "Assignee User",
        status_text: "In Progress",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_by");
        assert.property(res.body, "assigned_to");
        assert.property(res.body, "status_text");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "open");
        assert.property(res.body, "_id");
        assert.equal(res.body.issue_title, "Test Issue");
        assert.equal(
          res.body.issue_text,
          "This is a test issue with all fields"
        );
        assert.equal(res.body.created_by, "Test User");
        assert.equal(res.body.assigned_to, "Assignee User");
        assert.equal(res.body.status_text, "In Progress");
        assert.isTrue(res.body.open);

        // Save the ID for later tests
        testIssueId = res.body._id;
        done();
      });
  });

  // Test 2: Create an issue with only required fields
  test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .post(`/api/issues/${testProject}`)
      .send({
        issue_title: "Required Fields Only",
        issue_text: "This is a test issue with only required fields",
        created_by: "Test User",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "issue_title");
        assert.property(res.body, "issue_text");
        assert.property(res.body, "created_by");
        assert.property(res.body, "assigned_to");
        assert.property(res.body, "status_text");
        assert.property(res.body, "created_on");
        assert.property(res.body, "updated_on");
        assert.property(res.body, "open");
        assert.property(res.body, "_id");
        assert.equal(res.body.issue_title, "Required Fields Only");
        assert.equal(
          res.body.issue_text,
          "This is a test issue with only required fields"
        );
        assert.equal(res.body.created_by, "Test User");
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        assert.isTrue(res.body.open);
        done();
      });
  });

  // Test 3: Create an issue with missing required fields
  test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .post(`/api/issues/${testProject}`)
      .send({
        issue_title: "Missing Fields",
        // Missing issue_text and created_by
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });

  // Test 4: View issues on a project
  test("View issues on a project: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .get(`/api/issues/${testProject}`)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 2); // Should have at least the 2 issues we created

        const issue = res.body[0];
        assert.property(issue, "issue_title");
        assert.property(issue, "issue_text");
        assert.property(issue, "created_by");
        assert.property(issue, "assigned_to");
        assert.property(issue, "status_text");
        assert.property(issue, "created_on");
        assert.property(issue, "updated_on");
        assert.property(issue, "open");
        assert.property(issue, "_id");
        done();
      });
  });

  // Test 5: View issues on a project with one filter
  test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .get(`/api/issues/${testProject}?open=true`)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);

        // All issues should have open=true
        res.body.forEach((issue) => {
          assert.equal(issue.open, true);
        });
        done();
      });
  });

  // Test 6: View issues on a project with multiple filters
  test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .get(`/api/issues/${testProject}?open=true&created_by=Test User`)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);

        // All issues should match both filters
        res.body.forEach((issue) => {
          assert.equal(issue.open, true);
          assert.equal(issue.created_by, "Test User");
        });
        done();
      });
  });

  // Test 7: Update one field on an issue
  test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${testProject}`)
      .send({
        _id: testIssueId,
        issue_title: "Updated Title",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "result");
        assert.property(res.body, "_id");
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, testIssueId);
        done();
      });
  });

  // Test 8: Update multiple fields on an issue
  test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${testProject}`)
      .send({
        _id: testIssueId,
        issue_title: "Multiple Updates",
        issue_text: "Updated issue text",
        assigned_to: "New Assignee",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "result");
        assert.property(res.body, "_id");
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, testIssueId);
        done();
      });
  });

  // Test 9: Update an issue with missing _id
  test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${testProject}`)
      .send({
        issue_title: "No ID Provided",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  // Test 10: Update an issue with no fields to update
  test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${testProject}`)
      .send({
        _id: testIssueId,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.property(res.body, "_id");
        assert.equal(res.body.error, "no update field(s) sent");
        assert.equal(res.body._id, testIssueId);
        done();
      });
  });

  // Test 11: Update an issue with an invalid _id
  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .put(`/api/issues/${testProject}`)
      .send({
        _id: "invalid_id",
        issue_title: "Invalid ID",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.property(res.body, "_id");
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, "invalid_id");
        done();
      });
  });

  // Test 12: Delete an issue
  test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .delete(`/api/issues/${testProject}`)
      .send({
        _id: testIssueId,
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "result");
        assert.property(res.body, "_id");
        assert.equal(res.body.result, "successfully deleted");
        assert.equal(res.body._id, testIssueId);
        done();
      });
  });

  // Test 13: Delete an issue with an invalid _id
  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .delete(`/api/issues/${testProject}`)
      .send({
        _id: "invalid_id",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.property(res.body, "_id");
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, "invalid_id");
        done();
      });
  });

  // Test 14: Delete an issue with missing _id
  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
    chai
      .request(server)
      .delete(`/api/issues/${testProject}`)
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, "error");
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
