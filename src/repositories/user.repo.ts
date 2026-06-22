import { dataContainer } from "../config/cosmos";
import { UserModel } from "../models/user.model";

export async function getUserByUsername(username: string) {
    const { resource } = await dataContainer.item(username, username).read<UserModel>();

    return resource;
}

export async function createUser(user: UserModel) {
    const userToCreate = {
        ...user,
        id: user.username
    };
    const { resource } = await dataContainer.items.create<UserModel>(userToCreate);

    return resource;
}