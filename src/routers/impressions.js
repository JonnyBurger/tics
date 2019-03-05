"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var express_1 = require("express");
var body_parser_1 = require("body-parser");
var ow_1 = require("ow");
var lodash_1 = require("lodash");
var mongodb_1 = require("mongodb");
var http_errors_1 = require("http-errors");
var handler_1 = require("../handler");
exports["default"] = (function (_a) {
    var db = _a.db;
    var router = express_1.Router();
    router.use(body_parser_1["default"].json());
    router.post('/impression', handler_1.asyncHandler(function (request) { return __awaiter(_this, void 0, void 0, function () {
        var _a, identifier, content, content_id, level, platform, language, direction, version, impression, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = request.body, identifier = _a.identifier, content = _a.content, content_id = _a.content_id, level = _a.level, platform = _a.platform, language = _a.language, direction = _a.direction, version = _a.version;
                    ow_1["default"](identifier, ow_1["default"].string);
                    ow_1["default"](content, ow_1["default"].string);
                    ow_1["default"](level, ow_1["default"].string);
                    ow_1["default"](platform, ow_1["default"].any(ow_1["default"].string, ow_1["default"].nullOrUndefined));
                    ow_1["default"](content_id, ow_1["default"].any(ow_1["default"].string, ow_1["default"].nullOrUndefined));
                    ow_1["default"](language, ow_1["default"].any(ow_1["default"].string, ow_1["default"].nullOrUndefined));
                    ow_1["default"](direction, ow_1["default"].any(ow_1["default"].string, ow_1["default"].nullOrUndefined));
                    ow_1["default"](version, ow_1["default"].any(ow_1["default"].string, ow_1["default"].nullOrUndefined));
                    impression = lodash_1.pickBy({
                        identifier: identifier,
                        content: content,
                        content_id: content_id,
                        level: level,
                        platform: platform,
                        language: language,
                        version: version,
                        direction: direction,
                        date: Date.now()
                    });
                    return [4 /*yield*/, db.insert(impression)];
                case 1:
                    result = _b.sent();
                    return [2 /*return*/, {
                            impression: result.ops ? result.ops[0] : result
                        }];
            }
        });
    }); }));
    router.patch('/impression/:id', handler_1.asyncHandler(function (request) { return __awaiter(_this, void 0, void 0, function () {
        var identifier, id, dbImpression, lastUpdated;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    identifier = request.body.identifier;
                    id = request.params.id;
                    ow_1["default"](identifier, ow_1["default"].string);
                    if (id.length !== 24) {
                        throw http_errors_1["default"](400, 'Impression ID invalid');
                    }
                    return [4 /*yield*/, db.findOne({
                            _id: new mongodb_1.ObjectId(id)
                        })];
                case 1:
                    dbImpression = _a.sent();
                    if (!dbImpression) {
                        throw http_errors_1["default"](404, 'Impression not found');
                    }
                    if (identifier !== dbImpression.identifier) {
                        throw http_errors_1["default"](400, 'Should be the same identifier');
                    }
                    lastUpdated = Date.now();
                    return [4 /*yield*/, db.update({
                            _id: new mongodb_1.ObjectId(id)
                        }, {
                            $set: { lastUpdated: lastUpdated }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, {
                            impression: __assign({}, dbImpression, { lastUpdated: lastUpdated })
                        }];
            }
        });
    }); }));
    return router;
});
