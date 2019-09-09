module.exports = {
    type: 'service',
    prerequisites: {
        cpu: '',
        memory: ''
    },
    "serviceVersion": 3,
    "serviceName": "urac",
    "serviceGroup": "SOAJS Core Services",
    "servicePort": 4001,
    "requestTimeout": 30,
    "requestTimeoutRenewal": 5,
    "extKeyRequired": true,
    "oauth": true,

    "hashIterations": 1024,
    "seedLength": 32,

    "errors": {
        400: "Business logic required data are missing.",
        420: "Unable to find group.",

        520: "Unable to find user.",

        599: "Token has expired.",
        600: "unable to find token",
        601: "Model not found",
        602: "Model error: ",
    },

    "schema": {
        "commonFields": {
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
            }
        },
        "get": {


            '/forgotPassword': {
                "_apiInfo": {
                    "l": "Forgot Password",
                    "group": "Guest Password Settings"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/validate/join': {
                "_apiInfo": {
                    "l": "Validate registered account",
                    "group": "Guest Join"
                },
                "token": {
                    "source": ['query.token'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/checkUsername': {
                "_apiInfo": {
                    "l": "Check If Username Exists",
                    "group": "Guest Check Username"
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/validate/changeEmail': {
                "_apiInfo": {
                    "l": "Validate change email address",
                    "group": "Guest Email Validation"
                },
                "token": {
                    "source": ['query.token'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/user': {
                "_apiInfo": {
                    "l": "Get User Info by username",
                    "group": "My Account",
                    "groupMain": true
                },
                "username": {
                    "source": ['query.username'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },

            '/admin/user': {
                "_apiInfo": {
                    "l": "Get user record by id",
                    "group": "Administration"
                },
                "uId": {
                    "source": ['query.uId'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },
            '/admin/users': {
                "_apiInfo": {
                    "l": "List users",
                    "group": "Administration",
                    "groupMain": true
                },
                "commonFields": ["start", "limit", "keywords"],
                "config": {
                    "source": ['query.config'],
                    "required": false,
                    "validation": {"type": "boolean"}
                }
            },
            '/admin/users/uIds': {
                "_apiInfo": {
                    "l": "List users by Id",
                    "group": "Administration",
                    "groupMain": true
                },
                "commonFields": ["start", "limit"],
                "uIds": {
                    "source": ['query.uIds'],
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
                "commonFields": ["keywords"]
            },

            '/admin/groups': {
                "_apiInfo": {
                    "l": "List groups",
                    "group": "Administration"
                }
            },
            '/admin/group': {
                "_apiInfo": {
                    "l": "Get group record by id",
                    "group": "Administration"
                },
                "id": {
                    "source": ['query.id'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            },

            '/admin/all': {
                "_apiInfo": {
                    "l": "Get all users & groups",
                    "group": "Administration"
                }
            }

        },

        "post": {
            '/admin/group': {
                "_apiInfo": {
                    "l": "Add new Group",
                    "group": "Administration"
                },
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
            '/admin/groups/environments': {
                "_apiInfo": {
                    "l": "Add environment(s) to group(s)",
                    "group": "Administration"
                },
                "environments": {
                    "source": ['body.environments'],
                    "required": true,
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "minItems": 1,
                            "pattern": "^([A-Za-z]+)$"
                        }
                    }
                },
                "groups": {
                    "source": ['body.groups'],
                    "required": true,
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "minItems": 1,
                            "format": "alphanumeric",
                            "maxLength": 20
                        }
                    }
                }
            },
            '/admin/groups/packages': {
                "_apiInfo": {
                    "l": "Add package(s) to group(s)",
                    "group": "Administration"
                },
                "packages": {
                    "source": ['body.packages'],
                    "required": true,
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "minItems": 1,
                            "patternProperties": {
                                "product": {
                                    "type": "string"
                                },
                                "package": {
                                    "type": "string"
                                }
                            },
                            "additionalProperties": false
                        }
                    }
                },
                "groups": {
                    "source": ['body.groups'],
                    "required": true,
                    "validation": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "minItems": 1,
                            "format": "alphanumeric",
                            "maxLength": 20
                        }
                    }
                }
            }
        },
        "delete": {
            '/admin/group': {
                "_apiInfo": {
                    "l": "Delete Group",
                    "group": "Administration"
                },
                "gId": {
                    "source": ['query.gId'],
                    "required": true,
                    "validation": {"type": "string"}
                }
            }
        },
        "put": {
            '/admin/user/status': {
                "_apiInfo": {
                    "l": "Change user status",
                    "group": "Administration"
                },
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

            '/admin/group': {
                "_apiInfo": {
                    "l": "Edit Group",
                    "group": "Administration"
                },
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
            }
        }
    }
};