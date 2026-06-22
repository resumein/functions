import { usersContainer } from "../config/cosmos";
import { UserModel } from "../models/user.model";

export async function getUserByUsername(username: string) {
    const { resource } = await usersContainer.item(username, username).read<UserModel>();

    return resource;
}

export async function createUser(user: UserModel) {
    const { resource } = await usersContainer.items.create<UserModel>(user);

    return resource;
}