import * as admin from "firebase-admin";

function getAdminApp() {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        });
    }
    return admin.apps[0];
}

export const adminDb = {
    get ref() {
        getAdminApp();
        return admin.database().ref;
    }
} as any;

export const adminAuth = {
    get auth() {
        getAdminApp();
        return admin.auth();
    }
} as any;

export const adminMessaging = {
    sendEachForMulticast: (message: any) => {
        getAdminApp();
        return admin.messaging().sendEachForMulticast(message);
    }
} as any;
