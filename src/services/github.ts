import axios from "axios";
import { UserModel, UserSchema } from "../models/user.model";

export async function getGithubUser(accessToken: string): Promise<{ githubUser?: UserModel; githubUserError?: string }> {

    const userResponse = await axios.get("https://api.github.com/user", {
        headers: {
            Authorization: `token ${accessToken}`
        }
    });

    const user = UserSchema.safeParse({
        username: userResponse.data.login,
        name: userResponse.data.name || "",
        email: userResponse.data.email || "",
        githubToken: accessToken
    });

    if (!user.success) {
        return {
            githubUserError: "Failed to parse GitHub user data"
        };
    }

    return {
        githubUser: user.data
    };
}