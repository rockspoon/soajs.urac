'use strict';

const soajs = require('soajs');

let config = require('./config.js');
config.packagejson = require("./package.json");

const bl = require("./bl/index.js");

const service = new soajs.server.service(config);

service.init(() => {
    bl.init(service, config, (error) => {
        if (error) {
            throw new Error('Failed starting service');
        }

        //GET methods
        service.get("/forgotPassword", function (req, res) {
            bl.forgotPassword(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/validate/join", function (req, res) {
            bl.validateJoin(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/checkUsername", function (req, res) {
            bl.user.countUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/validate/changeEmail", function (req, res) {
            bl.validateChangeEmail(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/user", function (req, res) {
            bl.user.getUserByUsername(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/user", function (req, res) {
            bl.user.getUser(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/users", function (req, res) {
            bl.user.getUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/users/uIds", function (req, res) {
            bl.user.getUsersByIds(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/users/count", function (req, res) {
            bl.user.countUsers(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/groups", function (req, res) {
            bl.group.getGroups(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/group", function (req, res) {
            bl.group.getGroup(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.get("/admin/all", function (req, res) {
            bl.getUsersAndGroups(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });

        //DELETE methods
        service.delete("/admin/group", function (req, res) {
            bl.deleteGroup(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });

        //PUT methods
        service.put("/admin/user/status", function (req, res) {
            bl.user.updateStatus(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.put("/admin/group", function (req, res) {
            bl.group.edit(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });

        //POST methods
        service.post("/join", function (req, res) {
            bl.join(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.post("/admin/group", function (req, res) {
            bl.group.add(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.post("admin/groups/environments", function (req, res) {
            bl.group.addEnvironments(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });
        service.post("/admin/groups/packages", function (req, res) {
            bl.group.addPackages(req.soajs, req.soajs.inputmaskData, null, (error, data) => {
                return res.json(req.soajs.buildResponse(error, data));
            });
        });


        service.start();
    });
});