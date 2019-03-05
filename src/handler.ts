exports.errorHandler = (response, err) => {
	const statusCode = err.status
		? err.status
		: err.name === 'ArgumentError'
		? 400
		: 500;
	response.status(statusCode).json({
		success: false,
		error: err.message
	});
};

exports.successHandler = (response, data) => {
	response.json({
		success: true,
		data
	});
};

exports.asyncHandler = fn => {
	return async function(request, response) {
		try {
			const data = await fn(request, response);
			exports.successHandler(response, data);
		} catch (err) {
			if (!process.env.TEST || (!err.status && err.name !== 'ArgumentError')) {
				console.log(err);
			}
			exports.errorHandler(response, err);
		}
	};
};
