export interface AuditLogEntry {
    id: string;
    userName: string;
    userId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    timestamp: string;
    studyDetail: string;
}