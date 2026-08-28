export interface Account {
    accountId: string;
    accountName: string;
    status: string;
    usedStorage: number;
    totalStorage: number;
    numOfUsers: number;
    internalNotes: string;
    createdAt: Date;
    updatedAt: Date;
}