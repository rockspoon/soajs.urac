"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let editAccountSchema = require("../schemas/editAccount");
let listUsersSchema = require("../schemas/getUsers.js");

describe("Testing update User status API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    let users;
    let selectedUser;

    it("Success - by id will return all user records - no data", (done) => {
        let params = {
            qs: {
            }
        };
        requester('/admin/users', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data.length > 0);
            users = body.data;
            users.forEach(user => {
                if (user.username === 'johnd') {
                    selectedUser = user;
                }
            });
            let check = validator.validate(body, listUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - by id will change status of User", (done) => {
        let params = {
            body: {
                id: selectedUser._id,
                status: 'active'
            }
        };
        requester('/admin/user/status', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            assert.deepEqual(body.data, 1);
            let check = validator.validate(body, editAccountSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Fails - will not update status - No data", (done) => {
        let params = {
        };
        requester('/admin/user/status', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [ { code: 172, message: 'Missing required field: id, status' } ]);
            let check = validator.validate(body, editAccountSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will not update status  - Not valid", (done) => {
        let params = {
            body: {
                id: 'notvalid',
                status: 'active'
            }
        };
        requester('/admin/user/status', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [ { code: 602,
                message:
                    'Model error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters' } ]);
            let check = validator.validate(body, editAccountSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});