'use strict';
const soajs = require('soajs');
const config = require('./config.js');
config.packagejson = require("./package.json");
const service = new soajs.server.service(config);
const uracDriver = require("soajs.urac.driver");
const coreModules = require("soajs");
const provision = coreModules.provision;
let BL = {
	product: require("./lib/product.js")
};
let SSOT = {
	product: require('./model/product'),
};

const BLModule = require('./lib/urac.js');

/**
 * Initialize the Business Logic model
 * @param {Request Object} req
 * @param {Response Object} res
 * @param {Callback Function} cb
 */
function initBLModel(req, res, cb) {
	var modelName = config.model;
	if (req.soajs.inputmaskData.model) {
		modelName = req.soajs.inputmaskData.model;
	}
	if (req.soajs.servicesConfig && req.soajs.servicesConfig.model) {
		modelName = req.soajs.servicesConfig.model;
	}
	BLModule.init(modelName, function (error, BL) {
		if (error) {
			req.soajs.log.error(error);
			return res.json(req.soajs.buildResponse({"code": 601, "msg": config.errors[601]}));
		} else {
			return cb(BL);
		}
	});
}

service.init(function () {
	var reg = service.registry.get();

    let dbConfig = reg.coreDB.provision;
    if (reg.coreDB.oauth) {
        dbConfig = {
            "provision": reg.coreDB.provision,
            "oauth": reg.coreDB.oauth
        };
    }
    provision.init(dbConfig, service.log);
	//provision.init(reg.coreDB.provision, service.log);
	
	/**
	 * Login through passport
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get('/passport/login/:strategy', function (req, res) {
		req.soajs.config = config;
		uracDriver.passportLibInit(req, function (error, passport) {
			if (error) {
				return res.json(req.soajs.buildResponse(error));
			}
			uracDriver.passportLibInitAuth(req, res, passport);
		});
	});
	
	/**
	 * Validate Login through passport
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get('/passport/validate/:strategy', function (req, res) {
		req.soajs.config = config;
		uracDriver.passportLibInit(req, function (error, passport) {
			if (error) {
				return res.json(req.soajs.buildResponse(error));
			}
			uracDriver.passportLibAuthenticate(req, res, passport, function (error, user) {
				if (error) {
					return res.json(req.soajs.buildResponse(error, null));
				}
				user.id = user._id.toString();
				provision.generateSaveAccessRefreshToken(user, req, function (err, accessData) {
					if (err) {
						return res.json(req.soajs.buildResponse({
							code: 499,
							msg: err.message
						}, null));
					}
					
					initBLModel(req, res, function (BLInstance) {
						BLInstance.guest.customLogin(req, user, function (error, data) {
							data.accessTokens = accessData;
							// data.access_token = accessData.access_token;
							// data.refresh_token = accessData.refresh_token;
							// data.token_type = accessData.token_type;
							// data.expires_in = accessData.expires_in;
							return res.json(req.soajs.buildResponse(error, data));
						});
					});
				});
			});
		});
	});
	
	/**
	 * Login through OpenAM
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post('/openam/login', function (req, res) {
		var data = {
			'token': req.soajs.inputmaskData['token']
		};
		
		req.soajs.config = config;
		uracDriver.openamLogin(req.soajs, data, function (error, data) {
			if (error) {
				return res.json(req.soajs.buildResponse({
					code: error.code,
					msg: error.msg
				}, null));
			}
			provision.generateSaveAccessRefreshToken(data, req, function (err, accessData) {
				if (err) {
					return res.json(req.soajs.buildResponse({
						code: 499,
						msg: err.message
					}, null));
				}
				data.accessTokens = accessData;
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Login through lDap
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post('/ldap/login', function (req, res) {
		var data = {
			'username': req.soajs.inputmaskData['username'],
			'password': req.soajs.inputmaskData['password']
		};
		
		req.soajs.config = config;
		uracDriver.ldapLogin(req.soajs, data, function (error, data) {
			if (error) {
				return res.json(req.soajs.buildResponse({
					code: error.code,
					msg: error.msg
				}, null));
			}
			
			provision.generateSaveAccessRefreshToken(data, req, function (err, accessData) {
				if (err) {
					return res.json(req.soajs.buildResponse({
						code: 499,
						msg: err.message
					}, null));
				}
				data.accessTokens = accessData;
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Allow user to send an email to reset password
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/forgotPassword", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.forgotPassword(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Reset the password of the user
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/resetPassword", function (req, res) {
		//validate that the password and its confirmation match
		if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
			return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.resetPassword(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Check if the username exists
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/checkUsername", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.checkUsername(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Join: Create a new user
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/join", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.join(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Validate the joined user email
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/join/validate", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.joinValidate(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Validate the new email
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/changeEmail/validate", function (req, res) {
		//check if user account is there
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.guest.changeEmailValidate(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Get the logged in user record
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/account/getUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.getUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Change the password of the logged in user
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/account/changePassword", function (req, res) {
		//validate that the password and its confirmation match
		if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
			return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.changePassword(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Change the email of the logged in user
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/account/changeEmail", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.changeEmail(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Edit the logged in user profile
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/account/editProfile", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.account.editProfile(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Return user records
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/admin/listUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.listUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Return user records by id
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/listUsers/uId", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.listUsersById(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Return the count of user records
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/admin/users/count", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.countUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Return a user record
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/admin/getUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.getUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Add a new user record
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/addUser", function (req, res) {
		
		if (req.soajs.inputmaskData['status'] === 'pendingNew' && req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
			return res.jsonp(req.soajs.buildResponse({"code": 424, "msg": config.errors[424]}));
		}
		
		if (req.soajs.inputmaskData['status'] !== 'pendingNew' && (!req.soajs.inputmaskData['password'] || req.soajs.inputmaskData['password'] === '')) {
			return res.jsonp(req.soajs.buildResponse({"code": 424, "msg": config.errors[424]}));
		}
		
		if (req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
			if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
				return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
			}
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.addUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Change a user status
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/admin/changeUserStatus", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.changeStatus(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Edit a user record
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/editUser", function (req, res) {
		if (req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
			if (req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
				return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
			}
		}
		
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.editUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Edit user configuration
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/editUserConfig", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.editConfig(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * List all group records
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/admin/group/list", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.list(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Get one group record
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/admin/group", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.getGroup(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Add a new group record
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/group/add", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.add(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Edit a group record
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/group/edit", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.edit(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Delete a group record
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.delete("/admin/group/delete", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.delete(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Delete a user record
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.delete("/admin/user/delete", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.delete(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Add multiple Users To Group
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/group/addUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.addUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Add multiple Users To Group
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/group/addEnvironment", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.group.addEnvironment(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * List all users and groups
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/admin/all", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.adminOLD.listAll(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Invite User by user or password
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/inviteUser", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.inviteUser(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Invite Users by user or password (bulk)
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/inviteUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.inviteUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Invite User by id
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/inviteUser/uId", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.inviteUserByID(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Un Invite User by emails or usernames
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.put("/admin/unInviteUsers", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.unInviteUsers(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Un Invite User by ids
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.put("/admin/unInviteUser/uId", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.unInviteUserByID(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * add  User tenant config
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/admin/userTenantConfig", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.addEditPinCode(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * update  User tenant config
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.put("/admin/userTenantConfig", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.addEditPinCode(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Recover  User pin code
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/admin/recoverPinCode", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.recoverPinCode(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	/**
	 * Invite User
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.delete("/admin/pinConfig", function (req, res) {
		initBLModel(req, res, function (BLInstance) {
			req.soajs.config = config;
			BLInstance.admin.user.deletePinCode(req, function (error, data) {
				return res.json(req.soajs.buildResponse(error, data));
			});
		});
	});
	
	// service.get("/tenant/list", function (req, res) {
	// 	initBLModel(req, res, function (BLInstance) {
	// 		req.soajs.config = config;
	// 		BLInstance.tenant.list(req, function (error, data) {
	// 			return res.json(req.soajs.buildResponse(error, data));
	// 		});
	// 	});
	// });
	//
	// service.get("/tenant/getUserAclInfo", function (req, res) {
	// 	initBLModel(req, res, function (BLInstance) {
	// 		req.soajs.config = config;
	// 		BLInstance.tenant.getUserAclInfo(req, function (error, data) {
	// 			return res.json(req.soajs.buildResponse(error, data));
	// 		});
	// 	});
	// });
	
	/**
	 * Products features
	 */
	
	/**
	 * List available products
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/product/list", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.list(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * List available console products
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/product/console/list", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.listConsole(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * Get a specific product
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/product", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.get(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * Purge a specific product
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/product/purge", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.purgeProduct(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * Get package of specific product
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/product/package", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.getPackage(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * List all product packages
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.get("/product/packages/list", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.listPackage(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * Delete an existing product
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.delete("/product", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.delete(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * Add a new product
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/product", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.add(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * Update an existing product
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.put("/product", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.update(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * Update a product scope
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.put("/product/scope", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.updateScope(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	
	/**
	 * Add a new product package
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/product/package", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.addPackage(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * Add a new console product package
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.post("/product/console/package", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.addConsolePackage(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * Update a product package
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.put("/product/package", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.updatePackage(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	/**
	 * Delete a product package
	 * @param {String} API route
	 * @param {Function} API middleware
	 */
	service.delete("/product/package", function (req, res) {
		req.soajs.config = config;
		let product = new SSOT.product(req.soajs);
		BL.product.deletePackage(req.soajs, product, function (error, data) {
			product.closeConnection();
			return res.json(req.soajs.buildResponse(error, data));
		});
	});
	
	service.start();
});