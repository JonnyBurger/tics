import {Request, Response, NextFunction} from 'express';

export const errorHandler = (
	response: Response,
	err: Error & {status?: number}
) => {
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

export const successHandler = (response: Response, data: any) => {
	response.json({
		success: true,
		data
	});
};

type ExpressRequest = Pick<
	Request,
	Exclude<keyof Request, 'body' | 'params' | 'query' | 'user'>
> & {
	language?: Language;
};

export const asyncHandler = <Req, Res>(
	fn: (req: ExpressRequest & Req, res: Response) => Promise<Res>
) => {
	return async function(request: Request & Req, response: Response) {
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
