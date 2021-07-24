import type { VercelRequest, VercelResponse } from '@vercel/node';

export default (request: VercelRequest, response: VercelResponse) => {
  const { username = 'navneetlal' } = request.query;
  response.status(200).send(`Hello ${username}!`);
};