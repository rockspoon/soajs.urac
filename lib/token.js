'use strict';
var fs = require("fs");
var uuid = require('uuid');
var tokenCollectionName = "tokens";

var utils = require("./utils.js");

var libProduct = {
	"model": null,
	
	/**
	 * List all tokens
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
	// "list": function (req, cb) {
	// 	libProduct.model.initConnection(req.soajs);
	//
	// 	var condition = {};
	// 	var combo = {
	// 		collection: tokenCollectionName,
	// 		condition: condition
	// 	};
	//
	// 	var returnObj = {
	// 		records: []
	// 	};
	//
	// 	function getRecords() {
	// 		var pagination = {};
	// 		// add pagination
	// 		pagination['skip'] = req.soajs.inputmaskData.start;
	// 		pagination['limit'] = req.soajs.inputmaskData.limit;
	// 		combo.options = pagination;
	//
	// 		libProduct.model.findEntries(req.soajs, combo, function (err, records) {
	// 			var data = {
	// 				model: libProduct.model,
	// 				error: err || !records, code: 425
	// 			};
	// 			utils.checkIfError(req, cb, data, false, function () {
	// 				libProduct.model.closeConnection(req.soajs);
	// 				returnObj.records = records;
	// 				return cb(null, returnObj);
	// 			});
	// 		});
	// 	}
	//
	// 	if (req.soajs.inputmaskData.start === 0) {
	// 		libProduct.model.countEntries(req.soajs, combo, function (err, count) {
	// 			var data = {
	// 				model: libProduct.model,
	// 				error: err, code: 400
	// 			};
	// 			utils.checkIfError(req, cb, data, false, function () {
	// 				//if no records return empty array
	// 				if (count === 0) {
	// 					returnObj.totalCount = 0;
	// 					return cb(null, returnObj);
	// 				}
	// 				returnObj.totalCount = count;
	// 				getRecords();
	// 			});
	// 		});
	// 	}
	// 	else {
	// 		getRecords();
	// 	}
	//
	// },
	
	/**
	 * Delete a token record
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
	// "delete": function (req, cb) {
	// 	libProduct.model.initConnection(req.soajs);
	//
	// 	libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['tokenId'], function (err, tokenId) {
	// 		if (err) {
	// 			libProduct.model.closeConnection(req.soajs);
	// 			return cb({
	// 				"code": 426,
	// 				"msg": req.soajs.config.errors[426]
	// 			});
	// 		}
	// 		var combo = {
	// 			collection: tokenCollectionName,
	// 			condition: {'_id': tokenId}
	// 		};
	// 		libProduct.model.findEntry(req.soajs, combo, function (error, record) {
	// 			var data = {
	// 				model: libProduct.model,
	// 				config: req.soajs.config, error: error || !record, code: 425
	// 			};
	// 			utils.checkIfError(req, cb, data, true, function () {
	//
	// 				libProduct.model.removeEntry(req.soajs, combo, function (error) {
	// 					libProduct.model.closeConnection(req.soajs);
	// 					data.code = 400;
	// 					data.error = error;
	// 					utils.checkIfError(req, cb, data, false, function () {
	// 						return cb(null, true);
	// 					});
	// 				});
	// 			});
	// 		});
	// 	});
	// }
};

module.exports = libProduct;