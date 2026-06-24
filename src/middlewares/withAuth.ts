import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { verifyJWT, TokenPayload } from "../utils/jwt";

type AzureHttpHandler = (request: HttpRequest, context: InvocationContext) => Promise<HttpResponseInit>;

export interface AuthenticatedRequest extends Omit<HttpRequest, "user"> {
    user: TokenPayload;
}

export interface AuthenticatedContext {
    user: TokenPayload;
}

export function withAuth(
    handler: (
        request: HttpRequest,
        context: InvocationContext,
        auth: AuthenticatedContext
    ) => Promise<HttpResponseInit>
): AzureHttpHandler {
    return async (
        request: HttpRequest,
        context: InvocationContext
    ): Promise<HttpResponseInit> => {

        const authHeader = request.headers.get("authorization");

        const { isValid, payload, error } = verifyJWT(authHeader);

        if (!isValid || !payload) {
            return {
                status: 401,
                jsonBody: {
                    error: error || "Unauthorized access"
                }
            };
        }

        return handler(
            request,
            context,
            { user: payload }
        );
    };
}