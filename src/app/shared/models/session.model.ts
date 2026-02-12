/**
 * Active session managed by the auth-service.
 * Maps to Java: com.aizesk.auth.application.dto.ActiveSessionResponse
 */
export interface ActiveSession {
    id: string;
    deviceInfo: string;
    ipAddress: string;
    location: string | null;
    createdAt: string;
    lastActivityAt: string;
    currentSession: boolean;
}

export interface ActiveSessionListResponse {
    sessions: ActiveSession[];
    totalSessions: number;
}
