
import betterAuthServerClient from '../../integrations/better-auth';
import { createUnsecureRoute } from '../middlewares/session-middleware';


export const authenticationRoutes = createUnsecureRoute();

 
authenticationRoutes.use((c) => {
    return betterAuthServerClient.handler(c.req.raw);
})