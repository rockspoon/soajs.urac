"use strict";

const helper = require("../../../helper.js");
const BL = helper.requireModule('bl/index.js');
const assert = require('assert');

let user = {
	_id: "5d7fee0876186d9ab9b36492",
	locked: true,
	username: "tony",
	password: "$2a$12$geJJfv33wkYIXEAlDkeeuOgiQ6y6MjP/YxbqLdHdDSK7LDG.7n7Pq",
	firstName: "tony",
	lastName: "hage",
	email: "tony@localhost.com",
	ts: 1552747600152,
	status: "active",
	profile: {},
	groups: [
		"owner"
	],
	config: {
		allowedTenants: [
			{
				tenant: {
					id: "5c0e74ba9acc3c5a84a51251",
					code: "TES1",
					pin: {
						code: "5678",
						allowed: true
					}
				},
				groups: [
					"sub"
				]
			},
			{
				tenant: {
					id: "THYME_tID",
					code: "THYME_CODE",
					pin: {
						code: "5677",
						allowed: true
					}
				},
				groups: [
					"waiter"
				]
			},
			{
				tenant: {
					id: "ELVIRA_tID",
					code: "ELVIRA_CODE"
				},
				groups: [
					"manager"
				]
			}
		]
	},
	tenant: {
		id: "5c0e74ba9acc3c5a84a51259",
		code: "TES0",
		pin: {
			code: "1235",
			allowed: true
		}
	}
};

describe("Unit test for: BL - join", () => {
	let soajs = {
		"registry": {
			"custom": {
				"mail": {
					"value": {
						"from": "soajs@cloud.rockspoon.io",
						"transport": {
							"type": "smtp",
							"options": {
								"host": "smtp.mailgun.org",
								"port": 465,
								"auth": {
									"user": "soajs@cloud.rockspoon.io",
									"pass": "xxxxxxxxx"
								}
							}
						}
					}
				},
				"urac": {
					"value": {
						"hashIterations": 1024,
						"seedLength": 32,
						"link": {
							"addUser": "https://dev-site.rockspoon.io/#/setNewPassword",
							"changeEmail": "https://dev-site.rockspoon.io/#/changeEmail/validate",
							"forgotPassword": "https://dev-site.rockspoon.io/#/resetPassword",
							"join": "https://dev-site.rockspoon.io/#/join/validate"
						},
						"tokenExpiryTTL": 172800000,
						"validateJoin": true,
						"mail": {
							"addUser": {
								"subject": "Account Created at SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/addUser.tmpl"
							},
							"changeEmail": {
								"subject": "Change Account Email at SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changeEmail.tmpl"
							},
							"changeUPin": {
								"subject": "Change Pin",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changePin.tmpl"
							},
							"changeUserStatus": {
								"subject": "Account Status changed at SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/changeUserStatus.tmpl"
							},
							"forgotPassword": {
								"subject": "Reset Your Password at SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/forgotPassword.tmpl"
							},
							"invitePin": {
								"subject": "Pin Code Created at SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/invitePin.tmpl"
							},
							"join": {
								"subject": "Welcome to SOAJS",
								"path": "/opt/soajs/node_modules/soajs.urac/mail/urac/join.tmpl"
							}
						}
					}
				}
			}
		},
		"tenant": {
			"code": "TES0",
			"id": "5c0e74ba9acc3c5a84a51259"
		},
		"servicesConfig": {
			"urac": {
				"validateJoin": true,
			}
		},
		"log": {
			"error": (msg) => {
				console.log(msg);
			},
			"debug": (msg) => {
				console.log(msg);
			},
			"info": (msg) => {
				console.log(msg);
			}
		}
	};
	
	before((done) => {
		let localConfig = helper.requireModule("config.js");
		BL.init(soajs, localConfig, () => {
			done();
		});
	});
	
	it("testing join", function (done) {
		function UserModel() {
			console.log("user model");
		}
		
		UserModel.prototype.closeConnection = () => {
		};
		UserModel.prototype.checkUsername = (data, cb) => {
			if (data && data.username && data.username === "found") {
				return cb(null, 1);
			} else if (data && data.username && data.username === "error") {
				let error = new Error("User: checkUsername - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, null);
			}
		};
		
		UserModel.prototype.add = (data, cb) => {
			data._id = "5cfb05c22ac09278709d0141";
			return cb(null, data);
		};
		
		BL.user.model = UserModel;
		
		function TokenModel() {
			console.log("user model");
		}
		
		TokenModel.prototype.closeConnection = () => {
		};
		TokenModel.prototype.add = (data, cb) => {
			let token = {
				"token": "f65e8358-ce1d-47ff-b478-82e10c93f70e"
			};
			return cb(null, token);
		};
		BL.token.model = TokenModel;
		
		let data = {
			"username": "found"
		};
		BL.join(soajs, data, null, (error) => {
			assert.ok(error);
			
			let data = {
				"username": "error"
			};
			
			BL.join(soajs, data, null, (error) => {
				assert.ok(error);
				
				let data = {
					"token": "f65e8358-ce1d-47ff-b478-82e10c93f70e"
				};
				
				BL.join(soajs, data, null, (error, result) => {
					assert.ok(result);
					assert.deepEqual(result, {
						token: 'f65e8358-ce1d-47ff-b478-82e10c93f70e',
						link: {join: 'https://dev-site.rockspoon.io/#/join/validate?token=f65e8358-ce1d-47ff-b478-82e10c93f70e'}
					});
					done();
				});
			});
		});
		
	});
});