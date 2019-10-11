"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let getGroupsSchema = require("../schemas/getGroups");

describe("Testing edit group API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    let groups;
    let selectedGroup;

    it("Success - by id will return all group records - no data", (done) => {
        let params = {
            qs: {
            }
        };
        requester('/admin/groups', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data.length > 0);
            groups = body.data;
            groups.forEach(group => {
                if (group.code === 'FFFF') {
                    selectedGroup = group;
                }
            });
            let check = validator.validate(body, getGroupsSchema);
            console.log('chikos', check)
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - by id will edit group", (done) => {
        let params = {
            body: {
                "id": selectedGroup._id,
                "name": "integrationu",
                "description": "integration updated description",
                "environments": ["dev", "testu"],
                "packages": [{"product": "client", "package": "pack"}]
            }
        };
        requester('/admin/group', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            assert.deepEqual(body.data, 1);
            // let check = validator.validate(body, editAccountSchema);
            // assert.deepEqual(check.valid, true);
            // assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Fails - will not edit group - No data", (done) => {
        let params = {
        };
        requester('/admin/group', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [ { code: 172, message: 'Missing required field: id, name' } ]);
            // let check = validator.validate(body, editAccountSchema);
            // assert.deepEqual(check.valid, true);
            // assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will not edit group  - Not valid", (done) => {
        let params = {
            body: {
                id: 'notvalid',
                name: 'somename'
            }
        };
        requester('/admin/group', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [ { code: 602,
                message:
                    'Model error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters' } ]);
            // let check = validator.validate(body, editAccountSchema);
            // assert.deepEqual(check.valid, true);
            // assert.deepEqual(check.errors, []);
            done();
        });
    });
});