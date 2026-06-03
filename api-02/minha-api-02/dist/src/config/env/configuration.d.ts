declare const _default: (() => {
    env: string | undefined;
    port: number;
    database: {
        url: string | undefined;
    };
    glpi: {
        url: string | undefined;
        appToken: string | undefined;
        userToken: string | undefined;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    env: string | undefined;
    port: number;
    database: {
        url: string | undefined;
    };
    glpi: {
        url: string | undefined;
        appToken: string | undefined;
        userToken: string | undefined;
    };
}>;
export default _default;
