
"use server";

import { Client } from "@notionhq/client";
import type { PageObjectResponse, QueryDatabaseResponse, CreatePageParameters, UpdatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { Lead, LeadStatus, LEAD_STATUSES, LeadPriority, LEAD_PRIORITIES, LeadSource, LEAD_SOURCES } from "./types";
import type { AddLeadFormValues } from "@/components/add-lead-dialog";

if (!process.env.NOTION_API_KEY) {
    throw new Error("Missing NOTION_API_KEY environment variable");
}
if (!process.env.NOTION_DATABASE_ID) {
    throw new Error("Missing NOTION_DATABASE_ID environment variable");
}

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

function isLeadStatus(value: string): value is LeadStatus {
    return (LEAD_STATUSES as readonly string[]).includes(value);
}
function isLeadPriority(value: string): value is LeadPriority {
    return (LEAD_PRIORITIES as readonly string[]).includes(value);
}
function isLeadSource(value: string): value is LeadSource {
    return (LEAD_SOURCES as readonly string[]).includes(value);
}

// Helper function to ensure the status from Notion is a valid app status.
function mapNotionStatusToAppStatus(notionStatus: string): LeadStatus {
    if (isLeadStatus(notionStatus)) {
        return notionStatus;
    }
    // Fallback to "New Lead" if the status from Notion is unexpected.
    // This could happen if statuses are renamed in Notion but not in the app's type definitions.
    console.warn(`Unexpected status "${notionStatus}" from Notion. Defaulting to "New Lead".`);
    return 'New Lead';
}

const mapPageToLead = (page: PageObjectResponse): Lead | null => {
    try {
        const { properties } = page;

        const nameProp = properties["Name"];
        const name = (nameProp?.type === "title" && nameProp.title[0]?.plain_text) || "Unnamed Lead";
        
        const statusProp = properties["Status"];
        const statusRaw = (statusProp?.type === "status" && statusProp.status?.name) || "New Lead";
        const status = mapNotionStatusToAppStatus(statusRaw);

        const contactProp = properties["Contact"];
        const contact = (contactProp?.type === "rich_text" && contactProp.rich_text[0]?.plain_text) || (contactProp?.type === 'email' && contactProp.email) || "N/A";
        
        const sourceProp = properties["Source"];
        const sourceRaw = (sourceProp?.type === "select" && sourceProp.select?.name) || "Other";
        const source = isLeadSource(sourceRaw) ? sourceRaw : "Other";

        const priorityProp = properties["Priority"];
        const priorityRaw = (priorityProp?.type === "select" && priorityProp.select?.name) || "Medium";
        const priority = isLeadPriority(priorityRaw) ? priorityRaw : "Medium";
        
        const notesProp = properties["Notes"];
        const notes = (notesProp?.type === "rich_text" && notesProp.rich_text.map(t => t.plain_text).join("")) || undefined;

        const dateAddedProp = properties["Date Added"];
        const dateAdded = (dateAddedProp?.type === "date" && dateAddedProp.date?.start) 
            ? new Date(dateAddedProp.date.start) 
            : new Date(page.created_time);

        const followUpDateProp = properties["Follow-up Date"];
        const followUpDate = (followUpDateProp?.type === "date" && followUpDateProp.date?.start)
            ? new Date(followUpDateProp.date.start)
            : new Date();
        
        const userEmailProp = properties["User Email"];
        const userEmail = (userEmailProp?.type === 'email' && userEmailProp.email) || undefined;


        return {
            id: page.id,
            name,
            status,
            contact,
            source,
            priority,
            notes,
            dateAdded,
            followUpDate,
            userEmail,
        };
    } catch(error) {
        console.error(`Failed to map page ${page.id} to lead:`, error);
        return null;
    }
};

export async function getLeads(userEmail: string): Promise<Lead[]> {
    try {
        const response: QueryDatabaseResponse = await notion.databases.query({
            database_id: databaseId,
            filter: {
                property: "User Email",
                email: {
                    equals: userEmail,
                },
            },
            sorts: [
                {
                    property: 'Date Added',
                    direction: 'descending',
                },
            ],
        });

        const leads = response.results
            .map(page => mapPageToLead(page as PageObjectResponse))
            .filter((lead): lead is Lead => lead !== null);
            
        return leads;
    } catch (error) {
        console.error("Error fetching leads from Notion:", error);
        return [];
    }
}

function formatDateForNotion(date: Date): string {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T')[0];
}

export async function addLead(leadData: AddLeadFormValues, userEmail: string): Promise<Lead | null> {
    try {
        const properties: CreatePageParameters['properties'] = {
            "Name": {
                type: "title",
                title: [{ type: "text", text: { content: leadData.name } }],
            },
            "User Email": {
                type: "email",
                email: userEmail,
            },
             "Date Added": {
                type: "date",
                date: { start: formatDateForNotion(new Date()) },
            },
        };

        if (leadData.contact) {
            properties["Contact"] = {
                type: "email",
                email: leadData.contact,
            };
        }
        if (leadData.status) {
            properties["Status"] = {
                type: "status",
                status: { name: leadData.status },
            };
        }
        if (leadData.priority) {
            properties["Priority"] = {
                type: "select",
                select: { name: leadData.priority },
            };
        }
        if (leadData.source) {
            properties["Source"] = {
                type: "select",
                select: { name: leadData.source },
            };
        }
        if (leadData.followUpDate) {
            properties["Follow-up Date"] = {
                type: "date",
                date: { start: formatDateForNotion(leadData.followUpDate) },
            };
        }
        if (leadData.notes) {
            properties["Notes"] = {
                type: 'rich_text',
                rich_text: [{ type: 'text', text: { content: leadData.notes } }]
            }
        }
       
        const notionPage: CreatePageParameters = {
            parent: { database_id: databaseId },
            properties: properties,
        };

        const response = await notion.pages.create(notionPage);
        return mapPageToLead(response as PageObjectResponse);
    } catch (error) {
        console.error("Error adding lead to Notion:", error);
        return null;
    }
}

export async function addLeadsBatch(leadsData: AddLeadFormValues[], userEmail: string): Promise<Lead[]> {
    const addedLeads: Lead[] = [];
    for (const leadData of leadsData) {
        try {
            const newLead = await addLead(leadData, userEmail);
            if (newLead) {
                addedLeads.push(newLead);
            }
        } catch (error) {
            console.error(`Failed to add lead "${leadData.name}" in batch:`, error);
        }
        // Small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 350));
    }
    return addedLeads;
}

export async function updateLead(pageId: string, leadData: Partial<Lead>): Promise<Lead | null> {
    try {
        const properties: UpdatePageParameters['properties'] = {};

        if (leadData.status) {
            properties['Status'] = { type: "status", status: { name: leadData.status } };
        }
        if (leadData.priority) {
            properties['Priority'] = { type: "select", select: { name: leadData.priority } };
        }
        if (leadData.source) {
            properties['Source'] = { type: "select", select: { name: leadData.source } };
        }
        if (leadData.notes !== undefined) {
            properties['Notes'] = { type: 'rich_text', rich_text: [{ type: 'text', text: { content: leadData.notes } }] };
        }
        if (leadData.followUpDate) {
            properties['Follow-up Date'] = { type: "date", date: { start: formatDateForNotion(leadData.followUpDate) } };
        }
        if (leadData.contact) {
            properties['Contact'] = { type: "email", email: leadData.contact };
        }


        if (Object.keys(properties).length === 0) {
            console.log("No properties to update.");
            const page = await notion.pages.retrieve({ page_id: pageId });
            return mapPageToLead(page as PageObjectResponse);
        }

        const response = await notion.pages.update({
            page_id: pageId,
            properties: properties,
        });
        
        return mapPageToLead(response as PageObjectResponse);

    } catch (error) {
        console.error(`Error updating lead ${pageId} in Notion:`, error);
        return null;
    }
}


export async function deleteLead(pageId: string): Promise<string | null> {
    try {
        const response = await notion.pages.update({
            page_id: pageId,
            archived: true,
        });
        return response.id;
    } catch (error) {
        console.error(`Error deleting lead ${pageId} from Notion:`, error);
        return null;
    }
}
