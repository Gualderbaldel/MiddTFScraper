import {
    PublicClientApplication,
    type AuthenticationResult,
} from "@azure/msal-node";

import {
    DataProtectionScope,
    PersistenceCreator,
    PersistenceCachePlugin,
} from "@azure/msal-node-extensions";

import path from "node:path";
import "dotenv/config";

function getClientId(): string {
    
    const clientId = process.env.CLIENT_ID;

    if (!clientId) {
        throw new Error("CLIENT_ID is not defined in .env");
    }
    return clientId;
}

async function createMsalClient() {
    const cachePath = path.join(
        process.env.LOCALAPPDATA ?? ".",
        "MiddTFScraper",
        "msal-cache.json"
    );

    const persistenceConfiguration = {
        cachePath,
        dataProtectionScope: DataProtectionScope.CurrentUser,
    };

    const persistence = await PersistenceCreator.createPersistence(
        persistenceConfiguration
    );

    const cachePlugin = new PersistenceCachePlugin(persistence);

    return new PublicClientApplication({
        auth: {
            clientId: getClientId(),
            authority: "https://login.microsoftonline.com/consumers",
        },
        cache: {
            cachePlugin,
        },
    });
}

export async function sendEmail(
    subject: string,
    body: string,
    recipient: string[]
) {
    console.log("Getting Microsoft Graph access token...");

    const pca = await createMsalClient();

    const accounts = await pca.getTokenCache().getAllAccounts();
    console.log("Cached accounts:", accounts.map((a) => a.username));

    let result: AuthenticationResult | null = null;

    if (accounts.length > 0) {
        console.log("Found cached Microsoft account.");

        try {
            result = await pca.acquireTokenSilent({
                account: accounts[0],
                scopes: ["Mail.Send"],
            });

            console.log("Authenticated using cached credentials.");
        } catch {
            console.log("Cached token unavailable. Logging in again...");

            result = await pca.acquireTokenByDeviceCode({
                scopes: ["Mail.Send"],
                deviceCodeCallback: (response) => {
                    console.log(response.message);
                },
            });
        }
    } else {
        console.log("No cached account found. Logging in...");

        result = await pca.acquireTokenByDeviceCode({
            scopes: ["Mail.Send"],
            deviceCodeCallback: (response) => {
                console.log(response.message);
            },
        });
    }

    if (!result) {
        throw new Error("Could not acquire Microsoft Graph token.");
    }

    console.log("Authentication successful!");

    for (let i = 0; i< recipient.length; i++){
    const response = await fetch(
        "https://graph.microsoft.com/v1.0/me/sendMail",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${result.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: {
                    subject,
                    body: {
                        contentType: "HTML",
                        content: body,
                    },
                    toRecipients: [
                        {
                            emailAddress: {
                                address: recipient[i],
                            },
                        },
                    ],
                },
            }),
        }
    );

    console.log(`Graph status for email ${i + 1}:`, response.status);

    if (!response.ok) {
        const error = await response.text();
        throw new Error(
            `Graph API error ${response.status}: ${error}`
        );
    }

    console.log(`Email ${i + 1} sent successfully!`);
}
}