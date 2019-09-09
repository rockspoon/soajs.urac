'use strict';
let accessSchema = {
	"oneOf": [
		{"type": "boolean", "required": false},
		{"type": "array", "minItems": 1, "items": {"type": "string", "required": true}, "required": false}
	]
};
let acl = {
	"type": "object",
	"required": false,
	"properties": {
		"access": accessSchema,
		"apisPermission": {"type": "string", "enum": ["restricted"], "required": false},
		"apis": {
			"type": "object",
			"required": false,
			"patternProperties": {
				"^[_a-z\/][_a-zA-Z0-9\/:]*$": { //pattern to match an api route
					"type": "object",
					"required": true,
					"properties": {
						"access": accessSchema
					},
					"additionalProperties": false
				}
			}
		},
		"apisRegExp": {
			"type": "array",
			"required": false,
			"minItems": 1,
			"items": {
				"type": "object",
				"properties": {
					"regExp": {"type": "pattern", required: true, "pattern": /\.+/},
					"access": accessSchema
				},
				"additionalProperties": false
			}
		}
	}
};
let productAclSchema = require("./schemas/productAcl.js");

module.exports = {
	type: 'service',
	prerequisites: {
		cpu: '',
		memory: ''
	},
	"serviceVersion": 2,
	"serviceName": "urac",
	"serviceGroup": "SOAJS Core Services",
	"servicePort": 4001,
	"requestTimeout": 30,
	"requestTimeoutRenewal": 5,
	"hashIterations": 1024,
	"seedLength": 32,
	"extKeyRequired": true,
	"oauth": true,
	"session": false,
	"model": 'mongo',
	"console": {
		"product": "DSBRD"
	},
	"cmd": ["/etc/init.d/postfix start"],
	
	"maxStringLimit": 30,
	"errors": {
		399: "Missing Service config. Contact system Admin",
		400: "Database connection error",
		401: "Unable to log in the user. User not found.",
		402: "User account already exists.",
		403: "User Not Found!",
		404: "Unable to logout the user. User not found.",
		405: "Unable to find User. Please try again.",
		406: "Invalid or token has expired.",
		407: "Problem validating Request. Please try again.",
		408: "The password and its confirmation do not match",
		409: "Invalid old password provided",
		410: "username taken, please choose another username",
		411: "invalid user id provided",
		412: "You have provided the same existing email address",
		413: "Problem with the provided password.",
		414: "Unable to add user.",
		415: "Unable to find group.",
		416: "Unable to create Group.",
		417: "Invalid group id provided",
		418: "Unable to edit Group.",
		419: "Unable to delete Group.",
		420: "Group name already exists. Choose another",
		421: "Group code already exists. Choose another",
		424: "Invalid Request, cannot add a pending user account and provide a password at the same time.",
		425: "Unable to find record.",
		426: "Invalid id provided",
		427: "Driver not found",
		428: "A username or an email must be provided.",
		429: "You already invited this user.",
		430: "Tenant not found for this user.",
		
		436: "Invalid tenant Id provided",
		437: "Unable to get the environment records",
		438: "Invalid tenant Id provided",
		460: "Unable to find product",
		461: "Unable to find package",
		
		462: "You are not allowed to remove the tenant you are currently logged in with",
		463: "You are not allowed to remove the application you are currently logged in with",
		464: "You are not allowed to remove the key you are currently logged in with",
		465: "You are not allowed to remove the external key you are currently logged in with",
		466: "You are not allowed to remove the product you are currently logged in with",
		467: "You are not allowed to remove the package you are currently logged in with",
		
		468: "Product already exists",
		469: "Unable to add the product record",
		470: "Unable to add the product package",
		471: "Product package already exists",
		472: "Unable to update the product record",
		473: "Unable to update the product package",
		474: "Missing required field: either id or code",
		475: "Unable to remove product record",
		476: "Unable to remove product package",
		477: "Invalid product code provided",
		
		499: "Error in oAuth",
		500: "This record in locked. You cannot modify or delete it",
		
		601: "Model not found",
		611: "Invalid tenant id provided",
		
		700: "Unable to log in. Ldap connection refused!",
		701: "Unable to log in. Invalid ldap admin user.",
		702: "Unable to log in. Invalid ldap admin credentials.",
		703: "Unable to log in. Invalid ldap user credentials.",
		704: "Unable to log in. General Error.",
		705: "Unable to log in. Authentication failed.",
		706: "Missing Configuration. Contact Web Master.",
		
		710: "Unable to log in. OpenAM connection error.",
		711: "Unable to log in. OpenAM token invalid.",
		712: "Unable to log in. OpenAM general error.",
		
		998: "This group has a project associated to it. Remove the project first so you can delete this group.",
		999: "Limit Exceed, please upgrade your account"
		
	},
	"pinConfiguration": {
		"charLength": 4,
		"characters": "0123456789"
	},
	"schema": {
		"commonFields": {
			"tId": {
				"source": ['query.tId', 'body.tId'],
				"required": true,
				"validation": {"type": "string"}
			},
			"tCode": {
				"source": ['query.tCode', 'body.tCode'],
				"required": true,
				"validation": {"type": "string"}
			},
			"tenantCode": {
				"source": ['query.tenantCode', 'query.tCode'],
				"required": true,
				"validation": {"type": "string"}
			},
			"keywords": {
				"source": ['query.keywords', 'body.keywords'],
				"required": false,
				"validation": {"type": "string"}
			},
			"start": {
				"required": false,
				"source": ["query.start"],
				"default": 0,
				"validation": {
					"type": "integer",
					"min": 0
				}
			},
			"limit": {
				"required": false,
				"source": ["query.limit"],
				"default": 1000,
				"validation": {
					"type": "integer",
					"max": 2000
				}
			},
			"isOwner": {
				"required": false,
				"source": ["servicesConfig.isOwner"],
				"default": true,
				"validation": {
					"type": "boolean"
				}
			},
			"model": {
				"source": ['query.model'],
				"required": false,
				"default": "mongo",
				"validation": {
					"type": "string",
					"enum": ["memory", "mongo"]
				}
			},
			"soajs_project": {
				"source": ['query.soajs_project', 'body.soajs_project'],
				"required": false,
				"validation": {
					"type": "string"
				}
			},
			"id": {
				"source": ['query.id'],
				"required": true,
				"validation": {
					"type": "string"
				}
			},
			"description": {
				"source": ['body.description'],
				"required": false,
				"validation": {
					"type": "string"
				}
			},
			"_TTL": {
				"source": ['body._TTL'],
				"required": true,
				"validation": {
					"type": "string",
					"enum": ['6', '12', '24', '48', '72', '96', '120', '144', '168']
				}
			},
			'acl': productAclSchema,
			"name": {
				"source": ['body.name'],
				"required": true,
				"validation": {
					"type": "string"
				}
			}
		},
		
		"get": {
			"/passport/login/:strategy": {
				"_apiInfo": {
					"l": "Login Through Passport",
					"group": "Guest Login(s)"
				},
				"commonFields": ["model"],
				"uracConfig": {
					"source": ['servicesConfig.urac'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"passportLogin": {
								"type": "object",
								"required": true,
								"properties": {
									"facebook": {
										"type": "object",
										"properties": {
											"clientID": {
												"type": "string",
												"required": true
											},
											"clientSecret": {
												"type": "string",
												"required": true
											},
											"callbackURL": {
												"type": "string",
												"required": true
											}
										}
									},
									"twitter": {
										"type": "object",
										"properties": {
											"clientID": {
												"type": "string",
												"required": true
											},
											"clientSecret": {
												"type": "string",
												"required": true
											},
											"callbackURL": {
												"type": "string",
												"required": true
											}
										}
									},
									"google": {
										"type": "object",
										"properties": {
											"clientID": {
												"type": "string",
												"required": true
											},
											"clientSecret": {
												"type": "string",
												"required": true
											},
											"callbackURL": {
												"type": "string",
												"required": true
											}
										}
									},
									"github": {
										"type": "object",
										"properties": {
											"clientID": {
												"type": "string",
												"required": true
											},
											"clientSecret": {
												"type": "string",
												"required": true
											},
											"callbackURL": {
												"type": "string",
												"required": true
											}
										}
									}
								}
							}
						}
					}
				},
				"strategy": {
					"source": ['params.strategy'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["facebook", "google", "twitter", "github", "azure"]
					}
				}
			},
			
			"/passport/validate/:strategy": {
				"_apiInfo": {
					"l": "Login Through Passport Callback",
					"group": "Guest Login(s)"
				},
				"commonFields": ["model"],
				"strategy": {
					"source": ['params.strategy'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ["facebook", "google", "twitter", "github", "azure"]
					}
				},
				"oauth_token": {
					"source": ['query.oauth_token'],
					"required": false,
					"validation": {
						"type": "string"
					}
				},
				"oauth_verifier": {
					"source": ['query.oauth_verifier'],
					"required": false,
					"validation": {
						"type": "string"
					}
				}
			},
			
			'/join/validate': {
				"_apiInfo": {
					"l": "Validate registered account",
					"group": "Guest Join"
				},
				"commonFields": ["model"],
				"token": {
					"source": ['query.token'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			
			'/forgotPassword': {
				"_apiInfo": {
					"l": "Forgot Password",
					"group": "Guest Password Settings"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['query.username'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/checkUsername': {
				"_apiInfo": {
					"l": "Check If Username Exists",
					"group": "Guest Check Username"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['query.username'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/changeEmail/validate': {
				"_apiInfo": {
					"l": "Validate change email address",
					"group": "Guest Email Validation"
				},
				"commonFields": ["model"],
				"token": {
					"source": ['query.token'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			
			'/account/getUser': {
				"_apiInfo": {
					"l": "Get User Info by username",
					"group": "My Account",
					"groupMain": true
				},
				"commonFields": ["model"],
				"username": {
					"source": ['query.username'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			
			'/admin/changeUserStatus': {
				"_apiInfo": {
					"l": "Change user status",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"status": {
					"source": ['query.status'],
					"required": true,
					"validation": {"type": "string", "enum": ['active', 'inactive']}
				}
			},
			'/admin/listUsers': {
				"_apiInfo": {
					"l": "List users",
					"group": "Administration",
					"groupMain": true
				},
				"commonFields": ["model", "start", "limit", "keywords"],
				"tId": {
					"source": ['query.tId'],
					"required": false,
					"validation": {"type": "string"}
				},
				"config": {
					"source": ['query.config'],
					"required": false,
					"validation": {"type": "boolean"}
				}
			},
			'/admin/listUsers/uId': {
				"_apiInfo": {
					"l": "List users by Id",
					"group": "Administration",
					"groupMain": true
				},
				"commonFields": ["model", "start", "limit"],
				"tId": {
					"source": ['query.tId'],
					"required": false,
					"validation": {"type": "string"}
				},
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {
						"type": "array",
						"items": {
							"type": "string",
							"minItems": 1
						}
					}
				},
				"config": {
					"source": ['query.config'],
					"required": false,
					"validation": {"type": "boolean"}
				}
			},
			'/admin/users/count': {
				"_apiInfo": {
					"l": "Total users count",
					"group": "Administration"
				},
				"commonFields": ["model", "keywords"],
				"tId": {
					"source": ['query.tId'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			'/admin/getUser': {
				"_apiInfo": {
					"l": "Get user record by _id",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/admin/group/list': {
				"_apiInfo": {
					"l": "List groups",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"tId": {
					"source": ['query.tId'],
					"required": false,
					"validation": {"type": "string"}
				}
			},
			'/admin/group': {
				"_apiInfo": {
					"l": "Get group record by _id",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"id": {
					"source": ['query.id'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			"/admin/all": {
				"_apiInfo": {
					"l": "Get all users & groups",
					"group": "Administration"
				},
				"commonFields": ["model", "isOwner"]
			}
		},
		
		"post": {
			
			"/openam/login": {
				"_apiInfo": {
					"l": "OpenAM Login",
					"group": "Guest Login(s)"
				},
				"commonFields": ["model"],
				"token": {
					"source": ['body.token'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			"/ldap/login": {
				"_apiInfo": {
					"l": "Ldap Login",
					"group": "Guest Login(s)"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"password": {
					"source": ['body.password'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			'/join': {
				"_apiInfo": {
					"l": "Register",
					"group": "Guest Join"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"password": {
					"source": ['body.password'],
					"required": true,
					"validation": {"type": "string"}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", format: "email"}
				}
			},
			'/resetPassword': {
				"_apiInfo": {
					"l": "Reset Password",
					"group": "Guest Password Settings"
				},
				"commonFields": ["model"],
				"token": {
					"source": ['query.token'],
					"required": true,
					"validation": {"type": "string"}
				},
				"password": {
					"source": ['body.password'],
					"required": true,
					"validation": {"type": "string"}
				},
				"confirmation": {
					"source": ['body.confirmation'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/account/changePassword': {
				"_apiInfo": {
					"l": "Change Password",
					"group": "My Account"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"oldPassword": {
					"source": ['body.oldPassword'],
					"required": true,
					"validation": {"type": "string"}
				},
				"password": {
					"source": ['body.password'],
					"required": true,
					"validation": {"type": "string"}
				},
				"confirmation": {
					"source": ['body.confirmation'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			'/account/changeEmail': {
				"_apiInfo": {
					"l": "Change Email",
					"group": "My Account"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", format: "email"}
				}
			},
			'/account/editProfile': {
				"_apiInfo": {
					"l": "Edit Profile",
					"group": "My Account"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"profile": {
					"source": ['body.profile'],
					"required": false,
					"validation": {"type": "object"}
				}
			},
			'/admin/listUsers/uId': {
				"_apiInfo": {
					"l": "List users by Id",
					"group": "Administration",
					"groupMain": true
				},
				"commonFields": ["model", "start", "limit"],
				"tId": {
					"source": ['query.tId'],
					"required": false,
					"validation": {"type": "string"}
				},
				"uId": {
					"source": ['body.uId'],
					"required": true,
					"validation": {
						"type": "array",
						"items": {
							"type": "string",
							"minItems": 1
						}
					}
				},
				"config": {
					"source": ['query.config'],
					"required": false,
					"validation": {"type": "boolean"}
				}
			},
			'/admin/addUser': {
				"_apiInfo": {
					"l": "Add new User",
					"group": "Administration"
				},
				"commonFields": ["model", 'tId', 'tCode', 'soajs_project'],
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", format: "email"}
				},
				"profile": {
					"source": ['body.profile'],
					"required": false,
					"validation": {"type": "object"}
				},
				"groups": {
					"source": ['body.groups'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				},
				"status": {
					"source": ['body.status'],
					"default": "pendingNew",
					"required": false,
					"validation": {
						"type": "string",
						"enum": ['active', 'inactive', 'pendingNew']
					}
				},
				"password": {
					"source": ['body.password'],
					"required": false,
					"validation": {"type": "string"}
				},
				"confirmation": {
					"source": ['body.confirmation'],
					"required": false,
					"validation": {"type": "string"}
				},
				"pin": {
					"source": ['body.pin'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"code": {
								"required": true,
								"type": 'string'
							},
							"allowed": {
								"required": true,
								"type": 'boolean'
							}
						},
						"additionalProperties": false
					}
				}
			},
			'/admin/editUser': {
				"_apiInfo": {
					"l": "Edit User Record",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"username": {
					"source": ['body.username'],
					"required": true,
					"validation": {
						"type": "string",
						"pattern": /^[a-zA-Z0-9_-]+$/
					}
				},
				"firstName": {
					"source": ['body.firstName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"lastName": {
					"source": ['body.lastName'],
					"required": true,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['body.email'],
					"required": true,
					"validation": {"type": "string", 'format': 'email'}
				},
				"groups": {
					"source": ['body.groups'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				},
				"config": {
					"source": ['body.config'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"keys": {
								"type": "object",
								"required": false,
							},
							"packages": {
								"type": "object",
								"required": false,
								"additionalProperties": {
									"type": 'object',
									'additionalProperties': {
										'acl': acl
									}
								}
							},
							"allowedTenants": {
								"type": "array",
								"items": {
									"type": "object",
									"properties": {
										"tenant": {
											"type": 'object',
											"properties": {
												"id": {
													"type": 'string'
												},
												"code": {
													"type": 'string'
												},
												"pin": {
													"type": 'object',
													"properties": {
														"code": {
															"type": 'boolean'
														},
														"allowed": {
															"type": 'boolean'
														}
													},
													"additionalProperties": false
												}
											}
										},
										"groups": {
											"type": "array",
										}
									},
									"additionalProperties": false
								}
							}
						}
					}
				},
				"status": {
					"source": ['body.status'],
					"required": true,
					"validation": {
						"type": "string",
						"enum": ['active', 'inactive', 'pendingNew']
					}
				},
				"profile": {
					"source": ['body.profile'],
					"required": false,
					"validation": {"type": "object"}
				},
				"password": {
					"source": ['body.password'],
					"required": false,
					"validation": {"type": "string"}
				},
				"confirmation": {
					"source": ['body.confirmation'],
					"required": false,
					"validation": {"type": "string"}
				},
				"pin": {
					"source": ['body.pin'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"code": {
								"required": false,
								"type": 'string'
							},
							"allowed": {
								"required": false,
								"type": 'boolean'
							}
						},
						"additionalProperties": false
					}
				}
			},
			'/admin/editUserConfig': {
				"_apiInfo": {
					"l": "Edit User Config",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"config": {
					"source": ['body.config'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"keys": {
								"type": "object",
								"required": false,
							},
							"packages": {
								"type": "object",
								"required": false,
								"additionalProperties": {
									type: 'object',
									'additionalProperties': {
										'acl': acl
									}
								}
							},
							"allowedTenants": {
								"type": "array",
								"items": {
									"type": "object",
									"properties": {
										"tenant": {
											"type": 'object',
											"properties": {
												"id": {
													"type": 'string'
												},
												"code": {
													"type": 'string'
												},
												"pin": {
													"type": 'object',
													"properties": {
														"code": {
															"type": 'string'
														},
														"allowed": {
															"type": 'boolean'
														}
													},
													"additionalProperties": false
												}
											}
										},
										"groups": {
											"type": "array"
										}
									},
									"additionalProperties": false
								}
							}
						}
					}
				}
			},
			'/admin/group/add': {
				"_apiInfo": {
					"l": "Add new Group",
					"group": "Administration"
				},
				"commonFields": ["model", 'tId', 'tCode'],
				"code": {
					"source": ['body.code'],
					"required": true,
					"validation": {
						"type": "string",
						"format": "alphanumeric",
						"maxLength": 20
					}
				},
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {"type": "string"}
				},
				"description": {
					"source": ['body.description'],
					"required": true,
					"validation": {"type": "string"}
				},
				"config": {
					"source": ['body.config'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"allowedPackages": {
								"validation": {
									"type": "object",
									"patternProperties": {
										"^([A-Za-z0-9]+)$": { //pattern to match an api route
											"type": "array",
											"required": true,
											"items": {
												"type": "string"
											}
										}
									},
									"additionalProperties": false
								}
							},
							"allowedEnvironments": {
								"validation": {
									"type": "object",
									"patternProperties": {
										"^([A-Za-z]+)$": {
											"type": "object",
											"validation": {
												"type": "object"
											}
										}
									},
									"additionalProperties": false
								}
							}
						}
					}
				}
			},
			'/admin/group/edit': {
				"_apiInfo": {
					"l": "Edit Group",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"gId": {
					"source": ['query.gId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"name": {
					"source": ['body.name'],
					"required": true,
					"validation": {"type": "string"}
				},
				"description": {
					"source": ['body.description'],
					"required": true,
					"validation": {"type": "string"}
				},
				"config": {
					"source": ['body.config'],
					"required": true,
					"validation": {
						"type": "object",
						"properties": {
							"allowedPackages": {
								"validation": {
									"type": "object",
									"patternProperties": {
										"^([A-Za-z0-9]+)$": { //pattern to match an api route
											"type": "array",
											"required": true,
											"items": {
												"type": "string"
											}
										}
									},
									"additionalProperties": false
								}
							},
							"allowedEnvironments": {
								"validation": {
									"type": "object",
									"patternProperties": {
										"^([A-Za-z]+)$": {
											"type": "object",
											"validation": {
												"type": "object"
											}
										}
									},
									"additionalProperties": false
								}
							}
						}
					}
				}
			},
			"/admin/group/addUsers": {
				"_apiInfo": {
					"l": "Add Users to Group",
					"group": "Administration"
				},
				"commonFields": ["model", 'tId'],
				"code": {
					"source": ['body.groupCode'],
					"required": true,
					"validation": {"type": "string"}
				},
				"users": {
					"source": ['body.users'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				}
			},
			'/admin/group/addEnvironment': {
				"_apiInfo": {
					"l": "Add Allowed Environment to Group",
					"group": "Administration"
				},
				"groups": {
					"source": ['body.groups'],
					"required": true,
					"validation": {
						"type": "array",
						"minItems": 1,
						"items": {
							"type": "string",
							"required": true
						}
					}
				},
				"env": {
					"source": ['body.env'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			
			"/admin/inviteUser": {
				"_apiInfo": {
					"l": "Invite User",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['query.username'],
					"required": false,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['query.email'],
					"required": false,
					"validation": {"type": "string"}
				},
				"tenantId": {
					"source": ['body.tenantId'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"tenantCode": {
					"source": ['body.tenantCode'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"groups": {
					"source": ['body.groups'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				},
				"pin": {
					"source": ['body.pin'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"code": {
								"type": "boolean",
								"required": true
							},
							"allowed": {
								"type": "boolean",
								"required": true
							}
						}
					}
				}
			},
			
			"/admin/inviteUsers": {
				"_apiInfo": {
					"l": "Invite Users",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"users": {
					"source": ['body.users'],
					"required": true,
					"validation": {
						"type": "array",
						"items": {
							"type": "object",
							"minItems": 1,
							"properties": {
								"username": {
									"required": false,
									"type": "string",
								},
								"email": {
									"required": false,
									"type": "string",
								},
								"tenantId": {
									"required": true,
									"type": "string"
								},
								"tenantCode": {
									"required": true,
									"type": "string"
								},
								"pin": {
									"required": false,
									"type": "object",
									"properties": {
										"code": {
											"type": "boolean",
											"required": true
										},
										"allowed": {
											"type": "boolean",
											"required": true
										}
									}
								},
								"groups": {
									"required": false,
									"validation": {
										"type": "array",
										"items": {
											"type": "string"
										}
									}
								}
							}
						}
					}
				}
			},
			
			"/admin/inviteUser/uId": {
				"_apiInfo": {
					"l": "Invite User by uId",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				},
				"tenantId": {
					"source": ['body.tenantId'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"tenantCode": {
					"source": ['body.tenantCode'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"groups": {
					"source": ['body.groups'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				},
				"pin": {
					"source": ['body.pin'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"code": {
								"type": "boolean",
								"required": true
							},
							"allowed": {
								"type": "boolean",
								"required": true
							}
						},
						"additionalProperties": false
					}
				}
			},
			
			"/admin/userTenantConfig": {
				"_apiInfo": {
					"l": "Add Pin Information",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['query.username'],
					"required": false,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['query.email'],
					"required": false,
					"validation": {"type": "string"}
				},
				"tenantId": {
					"source": ['body.tenantId'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"pin": {
					"source": ['body.pin'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"code": {
								"type": "boolean",
								"required": true
							},
							"allowed": {
								"type": "boolean",
								"required": false
							}
						},
						"additionalProperties": false
					}
				}
			}
		},
		
		"put": {
			"/admin/userTenantConfig": {
				"_apiInfo": {
					"l": "Add Pin Information",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['query.username'],
					"required": false,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['query.email'],
					"required": false,
					"validation": {"type": "string"}
				},
				"tenantId": {
					"source": ['body.tenantId'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"pin": {
					"source": ['body.pin'],
					"required": false,
					"validation": {
						"type": "object",
						"properties": {
							"code": {
								"type": "boolean",
								"required": true
							},
							"allowed": {
								"type": "boolean",
								"required": false
							}
						},
						"additionalProperties": false
					}
				},
				"groups": {
					"source": ['body.groups'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string"
						}
					}
				}
			},
			
			"/admin/unInviteUsers": {
				"_apiInfo": {
					"l": "Un-Invite User",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['body.username'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string",
							"min": 1
						}
					}
				},
				"email": {
					"source": ['body.email'],
					"required": false,
					"validation": {
						"type": "array",
						"items": {
							"type": "string",
							"min": 1
						}
					}
				},
				"tenantId": {
					"source": ['query.tenantId'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			},
			
			"/admin/unInviteUser/uId": {
				"_apiInfo": {
					"l": "Un-Invite User by Ids",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {
						"type": "string"
					}
				},
				"tenantId": {
					"source": ['query.tenantId'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			}
		},
		
		"delete": {
			
			'/admin/user/delete': {
				"_apiInfo": {
					"l": "Delete User",
					"group": "Administration"
				},
				"commonFields": ["model", "soajs_project"],
				"uId": {
					"source": ['query.uId'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			
			'/admin/group/delete': {
				"_apiInfo": {
					"l": "Delete Group",
					"group": "Administration"
				},
				"commonFields": ["model", "soajs_project"],
				"gId": {
					"source": ['query.gId'],
					"required": true,
					"validation": {"type": "string"}
				}
			},
			
			"/admin/pinConfig": {
				"_apiInfo": {
					"l": "Remove Pin",
					"group": "Administration"
				},
				"commonFields": ["model"],
				"username": {
					"source": ['query.username'],
					"required": false,
					"validation": {"type": "string"}
				},
				"email": {
					"source": ['query.email'],
					"required": false,
					"validation": {"type": "string"}
				},
				"tenantId": {
					"source": ['query.tenantId'],
					"required": true,
					"validation": {
						"type": "string"
					}
				}
			}
		
	}
};