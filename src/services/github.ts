import axios from "axios";
import { UserModel, UserSchema } from "../models/user.model";

export async function getGithubUser(accessToken: string): Promise<{ githubUser?: UserModel; githubUserError?: string }> {

    const userResponse = await axios.get("https://api.github.com/user", {
        headers: {
            Authorization: `token ${accessToken}`
        }
    });

    let email = userResponse.data.email || "";

    if (!email) {
        try {
            const emailsResponse = await axios.get("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `token ${accessToken}`
                }
            });
            if (Array.isArray(emailsResponse.data) && emailsResponse.data.length > 0) {
                const primaryEmail = emailsResponse.data.find((e: any) => e.primary);
                const verifiedEmail = emailsResponse.data.find((e: any) => e.verified);
                email = primaryEmail?.email || verifiedEmail?.email || emailsResponse.data[0].email || "";
            }
        } catch (err) {
            console.error("Failed to fetch private email from GitHub:", err);
        }
    }

    // Ultimate fallback to satisfy the z.email() schema validation
    if (!email) {
        email = `${userResponse.data.login}@github.com`;
    }

    const user = UserSchema.safeParse({
        id: userResponse.data.login,
        username: userResponse.data.login,
        name: userResponse.data.name || userResponse.data.login || "",
        email: email,
        githubToken: accessToken,
        type: "user"
    });

    if (!user.success) {
        return {
            githubUserError: `Failed to parse GitHub user data: ${user.error.message}`
        };
    }

    return {
        githubUser: user.data
    };
}