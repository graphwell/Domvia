import * as admin from "firebase-admin";

let _app: admin.app.App | null = null;

function getAdminApp(): admin.app.App {
    if (_app) return _app;

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            `Firebase Admin: variáveis ausentes — ` +
            `FIREBASE_PROJECT_ID=${!!projectId}, ` +
            `FIREBASE_CLIENT_EMAIL=${!!clientEmail}, ` +
            `FIREBASE_PRIVATE_KEY=${!!privateKey}`
        );
    }

    if (admin.apps.length > 0) {
        _app = admin.app();
    } else {
        _app = admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
    }

    return _app;
}

export const getAdminDb = () => {
    const app = getAdminApp();
    return admin.database(app);
};

export const getAdminAuth = () => {
    const app = getAdminApp();
    return admin.auth(app);
};

export const adminMessaging = {
    sendEachForMulticast: (message: any) => {
        const app = getAdminApp();
        return admin.messaging(app).sendEachForMulticast(message);
    },
} as any;
