import { createHash } from "crypto";
import { LogInWithUsernameAndPasswordError, signUpWithUsernameAndPasswordError, } from "./authentication-types";
import { prisma } from "../../extras/prisma";
import jwt from "jsonwebtoken";
import { secretKey } from "../../../environment";
export const signUpWithUsernameAndPassword = async (parameters) => {
    const isUserExistingAlready = await checkIfUserExistsAlready({
        username: parameters.username,
    });
    if (isUserExistingAlready) {
        throw signUpWithUsernameAndPasswordError.CONFLICTING_USERNAME;
    }
    const passwordHash = createPasswordHash({
        password: parameters.password,
    });
    const user = await prisma.user.create({
        data: {
            username: parameters.username,
            password: passwordHash,
        },
    });
    const token = createJWToken({
        id: user.id,
        username: user.username,
    });
    const result = {
        token,
        user,
    };
    return result;
};
export const logInWithUsernameAndPassword = async (parameters) => {
    // 1. Create the password hash
    const passwordHash = createPasswordHash({
        password: parameters.password,
    });
    // 2. Find the user with the username and password hash
    const user = await prisma.user.findUnique({
        where: {
            username: parameters.username,
            password: passwordHash,
        },
    });
    // 3. If the user is not found, throw an error
    if (!user) {
        throw LogInWithUsernameAndPasswordError.INCORRECT_USERNAME_OR_PASSWORD;
    }
    // 4. If the user is found, create a JWT token and return it
    const token = createJWToken({
        id: user.id,
        username: user.username,
    });
    return {
        token,
        user,
    };
};
const createJWToken = (parameters) => {
    // Generate token
    const jwtPayload = {
        iss: "https://purpleshorts.co.in",
        sub: parameters.id,
        username: parameters.username,
    };
    const token = jwt.sign(jwtPayload, secretKey, {
        expiresIn: "30d",
    });
    return token;
};
const checkIfUserExistsAlready = async (parameters) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            username: parameters.username,
        },
    });
    if (existingUser) {
        return true;
    }
    return false;
};
const createPasswordHash = (parameters) => {
    return createHash("sha256").update(parameters.password).digest("hex");
};
