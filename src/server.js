"use strict";
exports.__esModule = true;
var ms_1 = require("ms");
var impressions_1 = require("./routers/impressions");
var analytics_1 = require("./routers/analytics");
var methods_1 = require("./methods");
exports["default"] = (function (_a) {
    var db = _a.db;
    var impressions = impressions_1["default"]({ db: db });
    var analytics = analytics_1["default"]({ db: db });
    var stats = {
        dau: function () {
            return methods_1.getUsers(db, {
                date: { $gt: Date.now() - ms_1["default"]('1d') }
            });
        },
        wau: function () {
            return methods_1.getUsers(db, {
                date: { $gt: Date.now() - ms_1["default"]('7d') }
            });
        },
        mau: function () {
            return methods_1.getUsers(db, {
                date: { $gt: Date.now() - ms_1["default"]('30d') }
            });
        },
        userCount: function (query) {
            if (query === void 0) { query = {}; }
            methods_1.getUsers(db, query);
        },
        platforms: function () { return methods_1.getBreakdown(db, 'platform'); },
        languages: function () { return methods_1.getBreakdown(db, 'language'); },
        versions: function () { return methods_1.getBreakdown(db, 'version'); },
        contents: function () { return methods_1.getBreakdown(db, 'content'); },
        breakDown: function (field) { return methods_1.getBreakdown(db, field); },
        activityLevels: {
            byContentType: function (content) { return methods_1.getActivityLevels(db, content); },
            byContentId: function (content_id) { return methods_1.getActivityLevelsById(db, content_id); }
        },
        db: db
    };
    return { impressions: impressions, analytics: analytics, stats: stats };
});
