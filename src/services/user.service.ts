import { encrypt } from "../common/crypt";
import { UserModel } from "../models/user.model";
import { createUser, getUserByUsername } from "../repositories/user.repo";

export async function syncUser(
    user: UserModel
): Promise<{ user?: UserModel; syncError?: string }> {
    try {
        const existingUser = await getUserByUsername(user.username);

        if (existingUser) {
            return { user: existingUser };
        }

        const createdUser = await createUser({
            ...user,
            githubToken: encrypt(user.githubToken)
        });

        return { user: createdUser };
    } catch (error: any) {
        return {
            syncError: error.message || "Failed to sync user"
        };
    }
}