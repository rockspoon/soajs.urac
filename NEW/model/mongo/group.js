"use strict";
const colName = "groups";
const core = require("soajs");
const Mongo = core.mongo;
const User = require("./user.js");

let indexing = {};

function Group(soajs, mongoCore) {
    let __self = this;
    if (mongoCore)
        __self.mongoCore = mongoCore;
    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
        if (indexing && soajs && soajs.tenant && soajs.tenant.id && !indexing[soajs.tenant.id]) {
            indexing[soajs.tenant.id] = true;

            __self.mongoCore.createIndex(colName, {'code': 1}, {unique: true}, function (err, result) {
            });
            __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {
            });
            soajs.log.debug("Indexes for " + soajs.tenant.id + " Updated!");
        }
    }
}

/**
 * To get group(s)
 *
 * @param data
 *  should have:
 *      optional (tId)
 *
 * @param cb
 */
Group.prototype.getGroups = function (data, cb) {
    let __self = this;
    let condition = {};
    if (data && data.tId) {
        condition = {"tenant.id": data.tId};
    }
    __self.mongoCore.find(colName, condition, null, null, (err, records) => {
        return cb(err, records);
    });
};

/**
 * To get a group
 *
 * @param data
 *  should have:
 *      required (id)
 *      optional (code)
 *
 * @param cb
 */
Group.prototype.getGroup = function (data, cb) {
    let __self = this;
    if (!data || !(data.id || data.code)) {
        let error = new Error("must provide either id or code.");
        return cb(error, null);
    }
    let condition = {};
    if (data.id) {
        condition = {'_id': data.id};
    } else if (data.code) {
        condition = {'code': data.code};
    }
    __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
        return cb(err, record);
    });
};

Group.prototype.closeConnection = function () {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = Group;