
"use server";

import { Client } from "@notionhq/client";
import { config } from 'dotenv';

config();

// This is a simple, non-production-ready authentication service.
// It uses a separate Notion database to store user credentials.
// For a real application, use a dedicated authentication provider like Firebase Auth, Auth0, or NextAuth.js.

const getNotionClient = (apiKey: string) => {
    return new Client({ auth: apiKey });
};

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const notionApiKey = process.env.NOTION_API_KEY;
    const usersDatabaseId = process.env.NOTION_USERS_DB_ID;

    if (!notionApiKey || !usersDatabaseId) {
        console.error("Missing Notion API Key or Users Database ID in environment variables.");
        return { success: false, error: "Server configuration error. Please contact support." };
    }
    
    try {
        const notion = getNotionClient(notionApiKey);

        const response = await notion.databases.query({
            database_id: usersDatabaseId,
            filter: {
                property: "Email",
                title: {
                    equals: email,
                },
            },
        });

        if (response.results.length === 0) {
            return { success: false, error: "Invalid email or password." };
        }

        const userPage: any = response.results[0];
        const storedPassword = userPage.properties.password.rich_text[0]?.plain_text;

        if (password !== storedPassword) { // In a real app, compare hashed passwords!
            return { success: false, error: "Invalid email or password." };
        }

        // We only return success. The client will handle setting localStorage.
        return { success: true };
    } catch (error: any) {
        console.error("Login error:", error.body || error);
        return { success: false, error: `Failed to log in: ${error.message || 'Please try again.'}` };
    }
}
