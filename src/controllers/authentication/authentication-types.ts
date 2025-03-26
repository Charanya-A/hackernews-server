import type { User } from "@prisma/client";

export enum signUpWithUsernameAndPasswordError{
    CONFLICTING_USERNAME ="CONFLICTING_USERNAME",
    UNKOWN="UNKOWN",
}

export type SignInWithUsernameAndPasswordResult = {
    token: string;
    user: User;
};

export type LogInWithUsernameAndPasswordResult={
    token: string;
    user: User;
};

export enum LogInWithUsernameAndPasswordError{
    INCORRECT_USERNAME_OR_PASSWORD = "INCORRECT_USERNAME_OR_PASSWORD",
    UNKOWN="UNKOWN",
}