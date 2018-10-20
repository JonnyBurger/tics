const impressionRouter = require('./routers/impressions');
const analyticsRouter = require('./routers/analytics');

module.exports = ({db}) => {
	const impressions = impressionRouter({db});
	const analytics = analyticsRouter({db});
	return {impressions, analytics};
};
