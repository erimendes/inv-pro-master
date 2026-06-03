export declare class LdapService {
    authenticate(username: string, password: string): Promise<import("ldapts").Entry | null>;
    findUser(username: string): Promise<boolean>;
}
