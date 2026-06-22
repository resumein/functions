import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import axios from "axios";
import { AuthRequest, AuthRequestSchema } from "../schema/auth.schema";
import { ApiErrorResponse, InvalidRequest } from "../common/response";
import { getGithubUser } from "../services/github";
import { syncUser } from "../services/user.service";

export async function auth(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const validation = AuthRequestSchema.safeParse(await request.json());

    if (!validation.success) return InvalidRequest
    const { code } = validation.data as AuthRequest;

    try {
        const response = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, {
            headers: {
                'Accept': 'application/json'
            }
        });
        const { access_token } = response.data;

        const { githubUser, githubUserError } = await getGithubUser(access_token);

        if (!githubUser) {
            return ApiErrorResponse(
                githubUserError || "Failed to fetch user from GitHub"
            );
        }

        const {user, syncError} = await syncUser(githubUser);

        if (!user) return ApiErrorResponse(syncError);

        return {
            status: 200,
            jsonBody: {
                message: "User authenticated successfully",
                user
            }
        };
    } catch (error) {
        return ApiErrorResponse('Failed to exchange code for access token')
    }
};

app.http('auth', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: auth
});
