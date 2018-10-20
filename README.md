# tics
> Simple self-hosted analytics for Express / React Native stack

## Install

On both your frontend and backend, install the tics library.

```
npm i tics
```

## Usage
### Backend

```js
const tics = require('tics/server');
const {impressions, analytics, stats} = tics({ db: <db_collection> });
```

**tics()** takes a MongoDB database collection as an argument. Collections from `mongodb` and `then-mongo` drivers have been tested.

**tics()** returns an object with 3 items:

- `impressions` is an Express.js router that the frontend can call to collect telemetry data.
- `analytics` is an Express.js router that exposes a JSON API with analytics data. You should add some middleware to protect this router with some sort of authentication.
- `stats` is an object containing the following methods:
    - `stats.dau()` returns daily active users
    - `stats.wau()` returns weekly active users
    - `stats.mau()` returns monthly active users
    - `stats.userCount(filter)` counts users. You can add a mongo query to only count a subset of impressions.
    - `stats.platforms()` returns a breakdown of the different platforms. Example response: `[{id: 'ios', count: 1000, id: 'android', count: 2000}]`
    - `stats.languages()` returns a breakdown of the languages of the users devices. Example response: `[{id: 'de', count: 1000, id: 'en', count: 2000}]`
    - `stats.versions()` returns a breakdown of the different versions of the app. Example response: `[{id: '1.0.0', count: 200}, {id: '1.0.1', count: 400}, {id: '1.1.0', count: 4000}]`
    - `stats.contents()` returns a breakdown of the different contents that the analytics are tracking.
    - `stats.breakDown()` allows to break down a custom field similar to the breakdowns above
    - `stats.activityLevels` focus on breaking down the different interactions of one content.
        - `stats.activityLevels.byContentType` returns a breakdown of the impressions of the different contents. Example: `[{id: 'register-screen', count: 1000}, {id: 'article-page', count: '100'}]`
        - `stats.activityLevels.byContentId(content_id)` returns the breakdown of the different interactions with one entity of a content. Example reponse: `[{id: 'view', count: 20000, {id: 'click', count: 1000}, {id: 'conversion': 20}}]`,
    - `stats.db` provides raw access to make queries yourself

