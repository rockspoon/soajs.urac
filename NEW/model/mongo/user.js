"use strict";
const colName = "users";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function User(soajs, mongoCore) {
    let __self = this;
    if (mongoCore)
        __self.mongoCore = mongoCore;
    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
        if (indexing && soajs && soajs.tenant && soajs.tenant.id && !indexing[soajs.tenant.id]) {
            indexing[soajs.tenant.id] = true;

            __self.mongoCore.createIndex(colName, {'username': 1, 'email': 1}, {}, function (err, result) {
            });
            __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {
            });
            __self.mongoCore.createIndex(colName, {'username': 1, 'tenant.id': 1}, {}, function (err, result) {
            });
            soajs.log.debug("Indexes for " + soajs.tenant.id + " Updated!");
        }
    }
}

/**
 * To get a user
 *
 * @param data
 *  should have:
 *      required (id)
 *
 * @param cb
 */
User.prototype.getUser = function (data, cb) {
    let __self = this;
    if (!data.id) {
        let error = new Error("id is required.");
        return cb(error, null);
    }
    __slef.validateId(data.id, (err, _id) => {
        if (err) {
            return cb(err, null);
        }
        let condition = {'_id': _id};

        __self.mongoCore.findOne(colName, condition, {socialId: 0, password: 0}, null, (err, record) => {
            return cb(err, record);
        });
    });
};


User.prototype.validateId = function (id, cb) {
    let __self = this;

    if (!id) {
        let error = new Error("must provide an id.");
        return cb(error, null);
    }

    try {
        id = __self.mongoCore.ObjectId(id);
        return cb(null, id);
    } catch (e) {
        return cb(e, null);
    }
};

User.prototype.closeConnection = function () {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = User;