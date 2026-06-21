import { encrypt } from "../common/crypt";
import { usersContainer } from "../config/cosmos";
import { UserModel } from "../models/user.model";

export async function upsertUser(user: UserModel) {
    
    const document = {
        username: user.username,
        name: user.name,
        email: user.email,
        githubToken: encrypt(user.githubToken)
    };

    const { resource: createdUser } = await usersContainer.items.upsert(document);

    return createdUser;
}
