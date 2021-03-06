"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listUsersSchema = require("../../user/schemas/getUsers.js");
let uninviteUsersSchema = require("../schemas/uninviteUsers.js");

let stExtKey = 'e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18';

describe("Testing edit user API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	let users = [];
	
	it("Success - will return all user records", (done) => {
		let params = {
			headers: {
				key: stExtKey
			}
		};
		requester('/admin/users', 'get', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.data.length > 0);
			body.data.forEach(user => {
				if (user.username === 'inviteTest') {
					users.push(user);
				}
			});
			let check = validator.validate(body, listUsersSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Success - will uninvite Users", (done) => {
		let params = {
			headers: {
				key: stExtKey
			},
			body: {
				users: [
					{
						user: {
							id: users[0]._id
						}
					}
				],
			}
		};
		requester('/admin/users/uninvite', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			let check = validator.validate(body, uninviteUsersSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not uninvite User - found", (done) => {
		let params = {
			headers: {
				key: stExtKey
			},
			body: {
				users: [
					{
						user: {id: '5d63ce63617982b55a1c1800'},
					}
				]
			}
		};
		requester('/admin/users/uninvite', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data.failed);
			let check = validator.validate(body, uninviteUsersSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - uninvite user - No data", (done) => {
		let params = {
			headers: {
				key: stExtKey
			}
		};
		requester('/admin/users/uninvite', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 172,
				message: 'Missing required field: users'
			}]);
			let check = validator.validate(body, uninviteUsersSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});