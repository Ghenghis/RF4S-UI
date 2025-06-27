import { EventManager } from '../core/EventManager';
import { rf4sService } from '../rf4s/services/rf4sService';

interface SessionState {
  isActive: boolean;
  startTime: Date | null;
  endTime: Date | null;
  currentProfile: string | null;
  currentMode: string | null;
  pauseCount: number;
  totalPauseTime: number;
  lastActivity: Date;
}

interface SessionEvent {
  type: 'start' | 'stop' | 'pause' | 'resume' | 'profile_change' | 'mode_change';
  timestamp: Date;
  data?: any;
}

class SessionStateServiceImpl {
  private sessionState: SessionState = {
    isActive: false,
    startTime: null,
    endTime: null,
    currentProfile: null,
    currentMode: null,
    pauseCount: 0,
    totalPauseTime: 0,
    lastActivity: new Date()
  };

  private sessionHistory: SessionEvent[] = [];
  private stateUpdateInterval: NodeJS.Timeout | null = null;

  start(): void {
    console.log('Session State Service started');
    this.setupEventListeners();
    this.startStateMonitoring();
  }

  stop(): void {
    if (this.stateUpdateInterval) {
      clearInterval(this.stateUpdateInterval);
      this.stateUpdateInterval = null;
    }
    console.log('Session State Service stopped');
  }

  private setupEventListeners(): void {
    EventManager.subscribe('rf4s.session_started', () => {
      this.handleSessionStart();
    });

    EventManager.subscribe('rf4s.session_stopped', () => {
      this.handleSessionStop();
    });

    EventManager.subscribe('profile.activated', (data: any) => {
      this.handleProfileChange(data.profileId);
    });

    EventManager.subscribe('fishing.mode_activated', (data: any) => {
      this.handleModeChange(data.modeId);
    });

    EventManager.subscribe('system.pause_requested', () => {
      this.handleSessionPause();
    });

    EventManager.subscribe('system.resume_requested', () => {
      this.handleSessionResume();
    });
  }

  private startStateMonitoring(): void {
    this.stateUpdateInterval = setInterval(() => {
      this.updateSessionState();
    }, 5000);
  }

  private updateSessionState(): void {
    if (this.sessionState.isActive) {
      this.sessionState.lastActivity = new Date();
      
      EventManager.emit('session.state_updated', {
        ...this.sessionState,
        duration: this.getSessionDuration()
      }, 'SessionStateService');
    }
  }

  private handleSessionStart(): void {
    this.sessionState = {
      ...this.sessionState,
      isActive: true,
      startTime: new Date(),
      endTime: null,
      lastActivity: new Date()
    };

    this.addSessionEvent('start');
    this.emitStateChange('session_started');
  }

  private handleSessionStop(): void {
    this.sessionState = {
      ...this.sessionState,
      isActive: false,
      endTime: new Date()
    };

    this.addSessionEvent('stop');
    this.emitStateChange('session_stopped');
  }

  private handleProfileChange(profileId: string): void {
    this.sessionState.currentProfile = profileId;
    this.addSessionEvent('profile_change', { profileId });
    this.emitStateChange('profile_changed');
  }

  private handleModeChange(modeId: string): void {
    this.sessionState.currentMode = modeId;
    this.addSessionEvent('mode_change', { modeId });
    this.emitStateChange('mode_changed');
  }

  private handleSessionPause(): void {
    this.sessionState.pauseCount++;
    this.addSessionEvent('pause');
    this.emitStateChange('session_paused');
  }

  private handleSessionResume(): void {
    this.addSessionEvent('resume');
    this.emitStateChange('session_resumed');
  }

  private addSessionEvent(type: SessionEvent['type'], data?: any): void {
    const event: SessionEvent = {
      type,
      timestamp: new Date(),
      data
    };

    this.sessionHistory.push(event);
    
    // Keep only last 100 events
    if (this.sessionHistory.length > 100) {
      this.sessionHistory.shift();
    }
  }

  private emitStateChange(eventType: string): void {
    EventManager.emit(`session.${eventType}`, {
      state: this.sessionState,
      duration: this.getSessionDuration()
    }, 'SessionStateService');
  }

  getSessionState(): SessionState {
    return { ...this.sessionState };
  }

  getSessionDuration(): number {
    if (!this.sessionState.startTime) return 0;
    
    const endTime = this.sessionState.endTime || new Date();
    return Math.floor((endTime.getTime() - this.sessionState.startTime.getTime()) / 1000);
  }

  getSessionHistory(): SessionEvent[] {
    return [...this.sessionHistory];
  }

  isSessionActive(): boolean {
    return this.sessionState.isActive;
  }

  getCurrentProfile(): string | null {
    return this.sessionState.currentProfile;
  }

  getCurrentMode(): string | null {
    return this.sessionState.currentMode;
  }
}

export const SessionStateService = new SessionStateServiceImpl();
