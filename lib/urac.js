'use strict';
var fs = require("fs");
var uuid = require('uuid');
var userCollectionName = "users";
var groupsCollectionName = "groups";

var guest = require("./guest.js");
var account = require("./account.js");
var user = require("./user.js");
var group = require("./group.js");
var token = require("./token.js");

var utils = require("./utils.js");

var Mongo = require("soajs").mongo;
var mongoCore = null;

var soajs = require("soajs");
var Auth = soajs.authorization;

var async = require('async');

function checkIfTenantIsDBTN(req, cb) {
	//todo tenantCode is hard coded for now until acl is fixed
	if (!mongoCore) {
		mongoCore = new Mongo(req.soajs.registry.coreDB.provision);
	}
	if (!req.soajs.inputmaskData) {
		req.soajs.inputmaskData = {};
	}
	
	req.soajs.inputmaskData.isOwner = true;
	//todo just for test cases
	if (process.env.SOAJS_TEST){
		mongoCore.findOne('tenants', { 'locked': true }, { applications: 0 }, function (error, tenant) {
			if (!error && tenant) {
				req.soajs.inputmaskData.tenantCode = tenant.code;
			}
			return cb(error, true);
		});
	}
	else {
		req.soajs.inputmaskData.tenantCode = 'DBTN';
		return cb(null, true);
	}
}

var libProduct = {
	"model": null,
	
	"guest": guest,
	
	"account": account,
	
	"adminOLD": {
		/**
		 * List all the users and groups
		 * @param {Request Object} req
		 * @param {Callback Function} cb
		 */
		"listAll": function (req, cb) {
			checkIfTenantIsDBTN(req, function (error) {
				var data = {
					config: req.soajs.config,
					error: error,
					code: 405
				};
				utils.checkIfError(req, cb, data, false, function () {
					var combo = {
						collection: userCollectionName,
						condition: {},
						fields: {
							'password': 0, 'socialId': 0
						}
					};
					libProduct.model.initConnection(req.soajs);
					libProduct.model.findEntries(req.soajs, combo, function (err, userRecords) {
						data = {
							config: req.soajs.config,
							error: err,
							code: 405
						};
						utils.checkIfError(req, cb, data, false, function () {
							var combo = {
								collection: groupsCollectionName,
								condition: {}
							};
							libProduct.model.findEntries(req.soajs, combo, function (err, grpRecords) {
								libProduct.model.closeConnection(req.soajs);
								data.code = 415;
								data.error = err;
								utils.checkIfError(req, cb, data, false, function () {
									return cb(null, {
										'users': userRecords,
										'groups': grpRecords
									});
								});
							});
						});
					});
				});
			});
		},
		/*
		"user": {
			"countUsers": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.countUsers(req, cb);
					});
				});
			},
			
			"listUsers": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.listUsers(req, cb);
					});
				});
			},
			
			"getUser": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.getUser(req, cb);
					});
				});
			},
			
			"addUser": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.addUser(req, cb);
					});
				});
			},
			
			"editUser": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.editUser(req, cb);
					});
				});
			},
			
			"editConfig": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.editConfig(req, cb);
					});
				});
			},
			
			"changeStatus": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.changeStatus(req, cb);
					});
				});
			}
		},
		
		"group": {
			"list": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						group.list(req, cb);
					});
				});
			},
			
			"add": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						group.add(req, cb);
					});
				});
			},
			
			"edit": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						group.edit(req, cb);
					});
				});
			},
			
			"delete": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						group.delete(req, cb);
					});
				});
			},
			
			"addUsers": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						group.addUsers(req, cb);
					});
				});
			}
		},
		
		"tokens": token
		*/
	},
	
	"admin": {
		"user": user,
		
		"group": group,
		
		"tokens": token
	},
	
	"tenant": {

		"list": function (req, cb) {
			let config = req.soajs.config;
			
			var opts = {
				collection: "tenants"
			};
			
			if (req.soajs.inputmaskData.type) {
				if (Object.hasOwnProperty.call(req.soajs.inputmaskData, "negate") && req.soajs.inputmaskData.negate === true) {
					opts.conditions = { 'type': { $ne: req.soajs.inputmaskData.type } };
				}
				else {
					opts.conditions = { 'type': req.soajs.inputmaskData.type };
				}
			}
			
			opts.options = { "sort": { "name": 1 } };
			
			if (!mongoCore) {
				mongoCore = new Mongo(req.soajs.registry.coreDB.provision);
			}
			
			mongoCore.find(opts.collection, opts.conditions, opts.options, function (err, records) {
				utils.checkIfError(req, cb, { config: config, error: err, code: 436 }, false, function () {
					//generate oauth authorization if needed.
					records.forEach(function (oneTenant) {
						if (oneTenant.oauth && oneTenant.oauth.secret && oneTenant.oauth.secret !== '') {
							oneTenant.oauth.authorization = Auth.generate(oneTenant._id, oneTenant.oauth.secret);
						}
						else {
							oneTenant.oauth.authorization = "No Authorization Enabled, update tenant and set an 'oAuth Secret' to enable token generation.";
						}
					});
					return cb(null, records);
				});
			});
		},
		
		"getUserAclInfo": function (req, cb) {
			let config = req.soajs.config;
			let output = {};
			if (!mongoCore) {
				mongoCore = new Mongo(req.soajs.registry.coreDB.provision);
			}
			
			function listEnvironment(listEnvironmentCb) {
				let opts = {
					collection: "environment"
				};
				
				mongoCore.find(opts.collection, {locked: {$ne: true} }, function (err, records) {
					utils.checkIfError(req, listEnvironmentCb, {
						config: config,
						error: err,
						code: 437
					}, false, function () {
						return listEnvironmentCb(null, records);
					});
				});
			}
			
			function getTenant(getTenantCb) {
				
				function validateId(soajs, id, validateIdCb) {
					var id1;
					try {
						id1 = mongoCore.ObjectId(id);
						return validateIdCb(null, id1);
					}
					catch (e) {
						soajs.log.error(e);
						return validateIdCb({
							config: config,
							error: e,
							code: 426
						});
					}
				}
				
				var opts = {};
				validateId(req.soajs, req.soajs.inputmaskData.tenantId, function (err, tenantId) {
					utils.checkIfError(req, getTenantCb, { config: config, error: err, code: 438 }, false, function () {
						opts.collection = "tenants";
						opts.conditions = { "_id": tenantId };
						mongoCore.findOne(opts.collection, opts.conditions, function (err, data) {
							utils.checkIfError(req, getTenantCb, {
								config: config,
								error: err || !data,
								code: 438
							}, false, function () {
								return getTenantCb(null, data);
							});
						});
					});
				});
			}
			
			function listServices(listServicesCb) {
				var opts = {};
				opts.collection = "services";
				mongoCore.find(opts.collection, function (error, records) {
					if (error) {
						req.soajs.log.error(error);
						return listServicesCb({ code: 400, msg: error });
					}
					
					return listServicesCb(null, records);
				});
			}
			
			function getAndSetPackages(oneApplication, getPackagesCb) {
				var opts = {};
				opts.collection = "products";
				opts.conditions = { "code": oneApplication.product };
				mongoCore.findOne(opts.collection, opts.conditions, function (err, product) {
					utils.checkIfError(req, getPackagesCb, {
						config: config,
						error: err || !product,
						code: 460
					}, false, function () {
						var pck = {};
						var found = false;
						for (var i = 0; i < product.packages.length; i++) {
							if (product.packages[i].code === oneApplication.package) {
								pck = product.packages[i];
								found = true;
								break;
							}
						}
						
						utils.checkIfError(req, getPackagesCb, {
							config: config,
							error: !found,
							code: 461
						}, false, function () {
							oneApplication.parentPackageAcl = pck.acl;
							return getPackagesCb(null, pck);
						});
					});
				});
			}
			
			async.parallel([
					listEnvironment,
					getTenant,
					listServices
				],
				function (asyncParallelError, asyncParallelResults) {
					if (asyncParallelError) {
						return cb(asyncParallelError);
					}

					output.environment = asyncParallelResults[0];
					output.tenant = asyncParallelResults[1];
					output.services = asyncParallelResults[2];

					let applications = output.tenant.applications;
					async.each(applications, function (oneApplication, asyncEachCb) {
						if (!Object.hasOwnProperty.call(oneApplication, 'acl')) {
							getAndSetPackages(oneApplication, asyncEachCb);
						} else {
							return asyncEachCb();
						}
					}, function (asyncError) {
						if (asyncError) {
							req.soajs.log.error(asyncError);
							return cb(asyncError);
						} else {
							return cb(null, output);
						}
					});
				});
		}
	}
};

module.exports = {
	"clearMongo": function () { // added for unit test cases only
		mongoCore = null;
	},
	
	"init": function (modelName, cb) {
		var modelPath = __dirname + "/../model/" + modelName + ".js";
		return requireModel(modelPath, cb);
		
		/**
		 * checks if model file exists, requires it and returns it.
		 * @param filePath
		 * @param cb
		 */
		function requireModel(filePath, cb) {
			//check if file exist. if not return error
			fs.exists(filePath, function (exists) {
				if (!exists) {
					return cb(new Error("Requested Model Not Found!"));
				}
				
				account.model = require(filePath);
				guest.model = require(filePath);
				user.model = require(filePath);
				group.model = require(filePath);
				token.model = require(filePath);
				
				libProduct.model = require(filePath);
				return cb(null, libProduct);
			});
		}
	}
};