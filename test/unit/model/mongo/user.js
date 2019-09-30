"use strict";
const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../../helper.js");
const Model = helper.requireModule('./model/mongo/user.js');
const assert = require('assert');

describe("Unit test for: model - user", function () {
    let addedUser1_id = null;
    let user2 = null;
    let user3 = null;
    let soajs = {
        "meta": core.meta,
        "tenant": {
            "code": "TES0",
            "id": "5c0e74ba9acc3c5a84a51259"
        },
        "registry": {
            "tenantMetaDB": {
                "urac": {
                    "prefix": "",
                    "cluster": "test_cluster",
                    "name": "#TENANT_NAME#_urac",
                    "servers": [
                        {
                            "host": "127.0.0.1",
                            "port": 27017
                        }
                    ],
                    "credentials": null,
                    "streaming": {
                        "batchSize": 1000
                    },
                    "URLParam": {
                        "bufferMaxEntries": 0
                    },
                    "timeConnected": 1552747598093
                }
            }
        },
        "log": {
            "error": (msg) => {
                console.log(msg);
            },
            "debug": (msg) => {
                console.log(msg);
            }
        }
    };
    let soajs_sub = {
        "meta": soajs.meta,
        "tenant": {
            "code": "TES2",
            "id": "5c8d0c4f5653de3985aa0ff2",
            "type": "client",
            "main":{
                "code": "TES0",
                "id": "5c0e74ba9acc3c5a84a51259"
            }
        },
        "registry": soajs.registry,
        "log": soajs.log
    };
    let modelObj = null;
    let modelObj_sub = null;

    it("Constructor - with tenant - open connection", function (done) {
        let localConfig = helper.requireModule("config.js");
        modelObj = new Model(soajs, localConfig, null);
        modelObj_sub = new Model(soajs_sub, localConfig, null);
        done();
    });

    it("Get UserByUsername - error", function (done) {
        modelObj.getUserByUsername(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("getUserByUsername- with username", function (done) {
        let data = {
            "username": "tony"
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUserByUsername - with email", function (done) {
        let data = {
            "username": "tony@localhost.com"
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUserByUsername - with email and status", function (done) {
        let data = {
            "username": "tony@localhost.com",
            "status": "active"
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUserByUsername - with email and status as array", function (done) {
        let data = {
            "username": "tony@localhost.com",
            "status": ["active", "pendingNew"]
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUser - error", function (done) {
        modelObj.getUser(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("getUser - with id", function (done) {
        let data = {
            "id": "5d7fee0876186d9ab9b36492"
        };

        modelObj.getUser(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUser - with id and status", function (done) {
        let data = {
            "id": "5d7fee0876186d9ab9b36492",
            "status": "active"
        };

        modelObj.getUser(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUser - with id and status as well as keeping password", function (done) {
        let data = {
            "id": "5d7fee0876186d9ab9b36492",
            "status": "active",
            "keep": {"pwd": 1}
        };

        modelObj.getUser(data, (error, record) => {
            assert.ok(record);
            assert.ok(record.password);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUser - with invalid id", function (done) {
        let data = {
            "id": "1212121"
        };

        modelObj.getUser(data, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("getUsers - with keywords", function (done) {
        let data = {
            "keywords": "ony",
            "limit": 10,
            "start": 0,
            "config": true
        };

        modelObj.getUsers(data, (error, records) => {
            assert.ok(records);
            done();
        });
    });

    it("getUsersByIds - error", function (done) {
        modelObj.getUsersByIds(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("getUsersByIds - invalid ids", function (done) {
        let data = {
            "ids": ["12121212"],
            "limit": 10,
            "start": 0,
            "config": true
        };
        modelObj.getUsersByIds(data, (error, records) => {
            assert.equal(records.length, 0);
            done();
        });
    });

    it("getUsersByIds", function (done) {
        let data = {
            "ids": ["5d7fee0876186d9ab9b36492"],
            "limit": 10,
            "start": 0,
            "config": true
        };

        modelObj.getUsersByIds(data, (error, records) => {
            assert.ok(records);
            done();
        });
    });

    it("checkUsername - error", function (done) {
        modelObj.checkUsername(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("checkUsername - with username", function (done) {
        let data = {
            "username": "tony"
        };

        modelObj.checkUsername(data, (error, count) => {
            assert.ok(count);
            assert.equal(count, 1);
            done();
        });
    });

    it("checkUsername - with username and exclude_id", function (done) {
        modelObj.validateId("5d7fee0876186d9ab9b36492", (error, _id) => {
            let data = {
                "username": "tony",
                "exclude_id": _id
            };
            modelObj.checkUsername(data, (error, count) => {
                assert.equal(count, 0);
                done();
            });
        });
    });

    it("countUsers - with keywords", function (done) {
        let data = {
            "keywords": "ony"
        };

        modelObj.countUsers(data, (error, count) => {
            assert.ok(count);
            assert.equal(count, 1);
            done();
        });
    });

    it("add - error", function (done) {
        modelObj.add(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("add - addedUser1_id", function (done) {
        let data = {
            "username": "test",
            "firstName": "unit",
            "lastName": "test",
            "email": "test@soajs.org",

            "password": "password",
            "status": "active",

            "tenant": {
                "code": "TES0",
                "id": "5c0e74ba9acc3c5a84a51259"
            }
        };
        modelObj.add(data, (error, record) => {
            assert.ok(record);
            assert.ok(record._id);
            addedUser1_id = record._id;
            done();
        });
    });

    it("add - error duplicate", function (done) {
        let data = {
            "username": "test",
            "firstName": "unit",
            "lastName": "test",
            "email": "test@soajs.org",

            "password": "password",
            "status": "active",

            "tenant": {
                "code": "TES0",
                "id": "5c0e74ba9acc3c5a84a51259"
            }
        };
        modelObj.add(data, (error) => {
            assert.ok(error);
            let index = error.message.indexOf("duplicate key");
            assert.ok(index > 0);
            done();
        });
    });

    it("edit - error no id", function (done) {
        modelObj.edit(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("edit - error nothing to edit", function (done) {
        let data = {
            _id: addedUser1_id
        };
        modelObj.edit(data, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("edit - using addedUser1_id _id", function (done) {
        let data = {
            _id: addedUser1_id,
            "username": "test_edit",
            "firstName": "unit_edit",
            "lastName": "test_edit",
            "email": "test_edit@soajs.org",
            "status": "inactive",
            "groups": ["tata"],
            "profile": {
                "venue": "la ronda",
                "id": "11111111"
            }
        };
        modelObj.edit(data, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("edit - using addedUser1_id id", function (done) {
        let data = {
            id: addedUser1_id.toString(),
            "username": "test2_edit",
            "firstName": "unit2_edit",
            "lastName": "test2_edit",
            "email": "test2_edit@soajs.org",
            "status": "active"
        };
        modelObj.edit(data, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("edit - using addedUser1_id - error id", function (done) {
        let data = {
            id: "12121212121",
            "username": "test2_edit",
            "firstName": "unit2_edit",
            "lastName": "test2_edit",
            "email": "test2_edit@soajs.org",
            "status": "active"
        };
        modelObj.edit(data, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("edit - using addedUser1_id - error not found", function (done) {
        let data = {
            id: "5cfb05c22ac09278709d0141",
            "username": "test3_edit",
            "firstName": "unit3_edit",
            "lastName": "test3_edit",
            "email": "test3_edit@soajs.org",
            "status": "active"
        };
        modelObj.edit(data, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("add - user2", function (done) {
        let data = {
            "username": "user2",
            "firstName": "user",
            "lastName": "two",
            "email": "two@soajs.org",

            "password": "password",
            "status": "active",

            "tenant": {
                "code": "TES0",
                "id": "5c0e74ba9acc3c5a84a51259"
            }
        };
        modelObj.add(data, (error, record) => {
            assert.ok(record);
            assert.ok(record._id);
            user2 = record;
            done();
        });
    });

    it('Success - uninvite user  - user2', (done) => {
        let data = {
            "username": user2.username
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "user2");
            data = {};
            data.user = {"id": record._id};
            data.status = record.status;
            data.tenant = soajs_sub.tenant;

            modelObj_sub.uninvite(data, (err, result) => {
                assert.ok(result);
                done();
            });
        });
    });

    it('Fails - uninvite user  - null data', (done) => {
        modelObj.uninvite(null, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("User: user [id | username | email], status, and tenant information are required."));
            done();
        });
    });

    it("add - user for uninvite with username", function (done) {
        let data = {
            "username": "user3",
            "firstName": "user",
            "lastName": "three",
            "email": "three@soajs.org",

            "password": "password",
            "status": "active",

            "tenant": {
                "code": "TES0",
                "id": "5c0e74ba9acc3c5a84a51259"
            }
        };
        modelObj.add(data, (error, record) => {
            assert.ok(record);
            assert.ok(record._id);
            user3 = record;
            done();
        });
    });

    it('Success - uninvite user - user3', (done) => {
        let data = {
            "username": user3.username
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "user3");
            data = {};
            data.user = {"id": record._id};
            data.status = record.status;
            data.tenant = soajs_sub.tenant;

            modelObj_sub.uninvite(data, (err, result) => {
                assert.ok(result);
                assert.deepEqual(result, 1);
                done();
            });
        });
    });

    it('Fails - uninvite user - invalid ID', (done) => {
        let data = {
            "username": user3.username
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "user3");
            data = {};
            data.user = {"id": "123123"};
            data.status = record.status;
            data.tenant = soajs_sub.tenant;

            modelObj_sub.uninvite(data, (err) => {
                assert.ok(err);
                done();
            });
        });
    });

    it('Fails - uninvite user  - null data', (done) => {
        let data = {
            "username": user3.username
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "user3");
            data = {};
            data.user = {"username": "notfoundUsername"};
            data.id = "5cdc190fd52c82e0ddb1dcd5";
            data.status = record.status;
            data.tenant = soajs_sub.tenant;

            modelObj_sub.uninvite(data, (err) => {
                assert.ok(err);
                done();
            });
        });
    });

    it.skip("Success - save record - data", (done) => {
        let data = {
            "username": user3.username
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "user3");
            data._id = record._id;

            modelObj.save(data, (error, result) => {
                console.log("result", result, error);
                assert.ok(result);
                done();
            });
        });
    });

    it("Fails - save record - null data", (done) => {
        modelObj.save(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("User: _id is required."));
            done();
        });
    });

    it('Success - updateOneField - data with _id (intenal usage)', (done) => {
        let data = {
            _id: user3._id,
            what: 'username',
            username: 'user1Updt',
            status: 'active'
        };

        modelObj.updateOneField(data, (err, result) => {
            assert.ok(result);
            assert.deepEqual(result, 1);
            done();
        });
    });

    it('Success - updateOneField - data with id (external usage)', (done) => {
        let data = {
            id: user3._id,
            what: 'username',
            username: 'user1Updt2',
            status: 'active'
        };

        modelObj.updateOneField(data, (err, result) => {
            assert.ok(result);
            assert.deepEqual(result, 1);
            done();
        });
    });

    it('Fails - updateOneField - data with id (external usage) - invalid id', (done) => {
        let data = {
            id: '12123',
            what: 'username',
            username: 'user1Updt2',
            status: 'active'
        };

        modelObj.updateOneField(data, (err) => {
            assert.ok(err);
            done();
        });
    });

    it('Fails - updateOneField - data - update error', (done) => {
        let data = {
            id: "5cdc190fd52c82e0ddb1dcd5", //Doesn't exist
            what: 'username',
            username: 'user1Updt2',
            status: 'active'
        };

        modelObj.updateOneField(data, (err) => {
            assert.ok(err);
            done();
        });
    });

    it('Fails - updateOneField - null data', (done) => {
        modelObj.updateOneField(null, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("User: either id or _id and the what field to update are required."));
            done();
        });
    });

    it('Fails - updateOneField - empty data', (done) => {
        modelObj.updateOneField({}, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("User: either id or _id and the what field to update are required."));
            done();
        });
    });

    it('Fails - cleanDeletedGroup - null data', (done) => {
        modelObj.cleanDeletedGroup(null, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("User: group Code and tenant information are required."));
            done();
        });
    });

    it('Fails - cleanDeletedGroup - empty data', (done) => {
        modelObj.cleanDeletedGroup({}, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("User: group Code and tenant information are required."));
            done();
        });
    });

    it('Fails - cleanDeletedGroup - data no group code', (done) => {
        modelObj.cleanDeletedGroup({
            tId: "someid",
            tenant: {}
        }, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("User: group Code and tenant information are required."));
            done();
        });
    });

    it('Success - cleanDeletedGroup - data', (done) => {
        modelObj.cleanDeletedGroup({
            groupCode: 'BBBB',
            tenant: {
                id: "5c0e74ba9acc3c5a84a51259",
                code: "TES0",
            }
        }, (err, result) => {
            assert.ok(result);
            assert.deepEqual(result, 4);
            done();
        });
    });

    it("validateId - error", function (done) {
        modelObj.validateId(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("validateId - error invalid id", function (done) {
        modelObj.validateId("121212", (error) => {
            assert.ok(error);
            let index = error.message.indexOf("12 bytes or a string of 24 hex characters");
            assert.ok(index > 0);
            done();
        });
    });

    it("validateId - with id", function (done) {
        modelObj.validateId("5cfb05c22ac09278709d0141", (error, _id) => {
            assert.ok(_id);
            done();
        });
    });

    it("Constructor - with tenant - close connection", function (done) {
        modelObj.closeConnection();
        modelObj_sub.closeConnection();
        done();
    });
});