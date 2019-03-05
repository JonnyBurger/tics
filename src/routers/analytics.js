"use strict";
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
var ms_1 = require("ms");
var express_1 = require("express");
var ow_1 = require("ow");
var body_parser_1 = require("body-parser");
var lodash_1 = require("lodash");
var cors_1 = require("cors");
var handler_1 = require("../handler");
var methods_1 = require("../methods");
var getDate = function (date) {
    if (date === 'yearly') {
        return { $gt: Date.now() - ms_1["default"]('1y') };
    }
    if (date === 'monthly') {
        return { $gt: Date.now() - ms_1["default"]('30d') };
    }
    if (date === 'weekly') {
        return { $gt: Date.now() - ms_1["default"]('7d') };
    }
    if (date === 'daily') {
        return { $gt: Date.now() - ms_1["default"]('1d') };
    }
    if (date === 'hourly') {
        return { $gt: Date.now() - ms_1["default"]('1h') };
    }
    return null;
};
exports["default"] = (function (_a) {
    var db = _a.db;
    var router = express_1.Router();
    router.use(cors_1["default"]());
    router.use(body_parser_1["default"].json());
    router.get('/stats', handler_1.asyncHandler(function () { return __awaiter(_this, void 0, void 0, function () {
        var dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers, platformBreakdown;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, methods_1.getUsers(db, {
                        date: { $gt: Date.now() - ms_1["default"]('1d') }
                    })];
                case 1:
                    dailyActiveUsers = _a.sent();
                    return [4 /*yield*/, methods_1.getUsers(db, {
                            date: { $gt: Date.now() - ms_1["default"]('7d') }
                        })];
                case 2:
                    weeklyActiveUsers = _a.sent();
                    return [4 /*yield*/, methods_1.getUsers(db, {
                            date: { $gt: Date.now() - ms_1["default"]('30d') }
                        })];
                case 3:
                    monthlyActiveUsers = _a.sent();
                    return [4 /*yield*/, methods_1.getBreakdown(db, 'platform')];
                case 4:
                    platformBreakdown = _a.sent();
                    return [2 /*return*/, {
                            activeUsers: {
                                daily: dailyActiveUsers,
                                weekly: weeklyActiveUsers,
                                monthly: monthlyActiveUsers
                            },
                            breakdown: {
                                platform: platformBreakdown
                            }
                        }];
            }
        });
    }); }));
    router.get('/query', handler_1.asyncHandler(function (request) { return __awaiter(_this, void 0, void 0, function () {
        var _a, date, content, platform, level, version, query, uniqueUsers, sessions, impressions, totalTimeSpent, averageSession;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = request.query, date = _a.date, content = _a.content, platform = _a.platform, level = _a.level, version = _a.version;
                    ow_1["default"](date, ow_1["default"].any(ow_1["default"].string, ow_1["default"].nullOrUndefined));
                    ow_1["default"](content, ow_1["default"].any(ow_1["default"].string, ow_1["default"].nullOrUndefined));
                    ow_1["default"](platform, ow_1["default"].any(ow_1["default"].string, ow_1["default"].nullOrUndefined));
                    ow_1["default"](level, ow_1["default"].any(ow_1["default"].string, ow_1["default"].nullOrUndefined));
                    ow_1["default"](version, ow_1["default"].any(ow_1["default"].string, ow_1["default"].nullOrUndefined));
                    query = lodash_1.pickBy({
                        date: getDate(date),
                        content: content,
                        platform: platform,
                        level: level,
                        version: version
                    });
                    return [4 /*yield*/, methods_1.getUsers(db, query)];
                case 1:
                    uniqueUsers = _b.sent();
                    return [4 /*yield*/, methods_1.getSessions(db, query)];
                case 2:
                    sessions = _b.sent();
                    return [4 /*yield*/, methods_1.getImpressions(db, query)];
                case 3:
                    impressions = _b.sent();
                    return [4 /*yield*/, methods_1.getTotalTimeSpent(db, query)];
                case 4:
                    totalTimeSpent = _b.sent();
                    averageSession = totalTimeSpent === 0
                        ? 0
                        : Math.round(totalTimeSpent / (sessions + impressions));
                    return [2 /*return*/, {
                            uniqueUsers: uniqueUsers,
                            sessions: sessions,
                            impressions: impressions,
                            totalTimeSpent: totalTimeSpent,
                            averageSession: averageSession
                        }];
            }
        });
    }); }));
    router.get('/content', handler_1.asyncHandler(function () { return __awaiter(_this, void 0, void 0, function () {
        var content;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, methods_1.getContent(db)];
                case 1:
                    content = _a.sent();
                    return [2 /*return*/, {
                            content: content
                        }];
            }
        });
    }); }));
    router.get('/content/:id', handler_1.asyncHandler(function (request) { return __awaiter(_this, void 0, void 0, function () {
        var id, levels;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = request.params.id;
                    return [4 /*yield*/, methods_1.getContentEngagementLevel(db, id)];
                case 1:
                    levels = _a.sent();
                    return [2 /*return*/, {
                            levels: levels
                        }];
            }
        });
    }); }));
    router.get('/platforms', handler_1.asyncHandler(function () { return __awaiter(_this, void 0, void 0, function () {
        var platforms;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.distinct('platform', {})];
                case 1:
                    platforms = _a.sent();
                    return [2 /*return*/, {
                            platforms: platforms
                        }];
            }
        });
    }); }));
    router.get('/versions', handler_1.asyncHandler(function () { return __awaiter(_this, void 0, void 0, function () {
        var versions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db.distinct('version', {})];
                case 1:
                    versions = _a.sent();
                    return [2 /*return*/, {
                            versions: versions
                        }];
            }
        });
    }); }));
    router.get('/platforms/breakdown', handler_1.asyncHandler(function () { return __awaiter(_this, void 0, void 0, function () {
        var platforms;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, methods_1.getBreakdown(db, 'platform')];
                case 1:
                    platforms = _a.sent();
                    return [2 /*return*/, {
                            platforms: platforms
                        }];
            }
        });
    }); }));
    return router;
});
