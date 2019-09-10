'use strict';

const async = require("async");
const fs = require("fs");

const lib = {
    "mail": require("../lib/mail.js")
};

let SSOT = {};
let model = process.env.SOAJS_SERVICE_MODEL || "mongo";

const BLs = ["user", "group", "token"];

function init(service, localConfig, cb) {

    let fillModels = (blName, cb) => {
        let typeModel = __dirname + `/../model/${model}/${blName}.js`;

        if (fs.existsSync(typeModel)) {
            SSOT[`${blName}Model`] = require(typeModel);
        }
        if (SSOT[`${blName}Model`]) {
            let temp = require(`./${blName}.js`);
            temp.model = SSOT[`${blName}Model`];
            temp.soajs_service = service;
            temp.localConfig = localConfig;
            bl[blName] = temp;
            return cb(null);
        } else {
            return cb({name: blName, model: typeModel});
        }
    };
    async.each(BLs, fillModels, function (err) {
        if (err) {
            service.log.error(`Requested model not found. make sure you have a model for ${err.name} @ ${err.model}`);
            return cb({"code": 601, "msg": localConfig.errors[601]});
        }
        return cb(null);
    });
}

let bl = {
    init: init,
    group: null,
    user: null,
    token: null,

    "join": (soajs, inputmaskData, options, cb) => {
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        bl.user.countUser(soajs, inputmaskData, options, (error, found) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            if (found) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(bl.user.handleError(soajs, 402, null));
            }
            bl.user.join(soajs, inputmaskData, options, (error, userRecord) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                let data = {};
                data.userId = userRecord._id.toString();
                data.username = userRecord.username;
                data.service = "join";
                bl.token.add(soajs, data, options, (error, tokenRecord) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error){
                        return cb(error, null);
                    }
                    lib.mail.send(soajs, "join", userRecord, tokenRecord, function (error, mailRecord) {
                        if (error) {
                            soajs.log.info('No Mail was sent: ' + error);
                        }
                        return cb(null, {
                            token: tokenRecord.token,
                            link: mailRecord.link || null
                        });
                    });
                });
            })
        });
    },

    "deleteGroup": (soajs, inputmaskData, options, cb) => {
        bl.group.deleteGroup(soajs, inputmaskData, null, (error, record) => {
            if (error) {
                return cb(error, null);
            }
            else {
                //close response but continue to clean up deleted group from users
                cb(null, true);
                let data = {};
                if (record && record.tenant) {
                    data.tId = record.tenant.id;
                    data.groupCode = record.code;
                    bl.user.cleanDeletedGroup(soajs, data, (error) => {
                        if (error) {
                            soajs.log.error(error);
                        }
                    });
                }
            }
        });
    },

    "validateJoin": (soajs, inputmaskData, options, cb) => {
        //get model since token and user are in the same db always, aka main tenant db
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        inputmaskData = inputmaskData || {};
        inputmaskData.service = 'join';
        bl.token.get(soajs, inputmaskData, options, (error, tokenRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.uId = tokenRecord.userId;
            data.status = 'pendingJoin';
            bl.user.getUser(soajs, data, options, (error, userRecord) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                let tokenData = {};
                tokenData.token = tokenRecord.token;
                tokenData.status = 'used';
                //update token status and do not wait for result
                bl.token.updateStatus(soajs, tokenData, options, (error, tokenRecord) => {
                    // no need to do anything here.
                });
                let userData = {};
                userData._id = userRecord._id;
                userData.what = 'status';
                userData.status = 'active';
                bl.user.updateOneField(soajs, userData, options, (error) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    return cb(null, true);
                });
            });
        });
    },

    "validateChangeEmail": (soajs, inputmaskData, options, cb) => {
        //get model since token and user are in the same db always, aka main tenant db
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        inputmaskData = inputmaskData || {};
        inputmaskData.service = 'changeEmail';
        bl.token.get(soajs, inputmaskData, options, (error, tokenRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let data = {};
            data.uId = tokenRecord.userId;
            bl.user.getUser(soajs, data, options, (error, userRecord) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                let tokenData = {};
                tokenData.token = tokenRecord.token;
                tokenData.status = 'used';
                //update token status and do not wait for result
                bl.token.updateStatus(soajs, tokenData, options, () => {
                    // no need to do anything here.
                });
                let userData = {};
                userData._id = userRecord._id;
                userData.what = 'email';
                userData.email = tokenRecord.email;
                bl.user.updateOneField(soajs, userData, options, (error) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    return cb(null, true);
                });
            });
        });
    },

    "forgotPassword": (soajs, inputmaskData, options, cb) => {
        //get model since token and user are in the same db always, aka main tenant db
        let modelObj = bl.user.mt.getModel(soajs);
        options = {};
        options.mongoCore = modelObj.mongoCore;
        bl.user.getUserByUsername(soajs, inputmaskData, options, (error, userRecord) => {
            if (error) {
                //close model
                bl.user.mt.closeModel(modelObj);
                return cb(error, userRecord);
            }
            //No need to assure userRecord. At this point userRecord is valid and not empty
            let data = {};
            data.userId = userRecord._id.toString();
            data.username = userRecord.username;
            data.service = "forgotPassword";
            bl.token.add(soajs, data, options, (error, tokenRecord) => {
                //close model
                bl.user.mt.closeModel(modelObj);
                if (error){
                    return cb(error, null);
                }
                lib.mail.send(soajs, "forgotPassword", userRecord, tokenRecord, function (error, mailRecord) {
                    if (error) {
                        soajs.log.info('No Mail was sent: ' + error);
                    }
                    return cb(null, {
                        token: tokenRecord.token,
                        link: mailRecord.link || null
                    });
                });
            });
        });
    },

    "getUsersAndGroups": (soajs, inputmaskData, options, cb) => {
        if (soajs.tenant.type === "client" && soajs.tenant.main) {
            bl.group.getGroups(soajs, inputmaskData, null, (error, groupRecords) => {
                if (error) {
                    return cb(error, null);
                }
                return cb(null, {'users': [], 'groups': groupRecords});
            });
        }
        else {
            //TODO: better to make this async
            //As main tenant both users and groups share the same DB connection
            let modelObj = bl.user.mt.getModel(soajs);
            options = {};
            options.mongoCore = modelObj.mongoCore;
            bl.group.getGroups(soajs, inputmaskData, options, (error, groupRecords) => {
                if (error) {
                    return cb(error, null);
                }
                bl.user.getUsers(soajs, inputmaskData, options, (error, userRecords) => {
                    if (error) {
                        return cb(error, null);
                    }
                    return cb(null, {'users': userRecords, 'groups': groupRecords});
                });
            });
        }
    }
};

module.exports = bl;