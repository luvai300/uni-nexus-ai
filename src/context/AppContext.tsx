import React, { createContext, useContext, useEffect, useState, useCallback, useReducer } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AppUser {
  id: string;
  name: string;
  avatar: string;
  university: string;
  course: string;
  year: string;
  bio: string;
  verified: boolean;
  phone: string;
  is_verified: boolean;
  campus: string;
  followers_count: number;
  following_count: number;
  mixerOptIn?: boolean;
}

export interface Meetup {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  host: string;
  hostAvatar: string;
  attendees: number;
  maxAttendees: number;
  rsvp: boolean;
}

export interface CampusConnectProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  university: string;
  course: string;
  clubs: string[];
}

export interface CommunityMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isMine: boolean;
}

export interface Community {
  id: string;
  name: string;
  icon: string;
  description: string;
  members: number;
  unread: number;
  messages: CommunityMessage[];
}

interface AppState {
  meetups: Meetup[];
  campusConnect: CampusConnectProfile[];
  communities: Community[];
  user: { mixerOptIn: boolean };
}

type AppAction =
  | { type: "TOGGLE_MIXER_OPTIN" }
  | { type: "ADD_COMMUNITY_MESSAGE"; payload: { communityId: string; text: string } };

interface AppContextType {
  user: AppUser | null;
  authUser: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  state: AppState;
  toggleRsvp: (id: string) => void;
  dispatch: (action: AppAction) => void;
}

const defaultUser = (authId: string): AppUser => ({
  id: authId,
  name: "Student",
  avatar: "https://storage.googleapis.com/dala-prod-public-storage/generated-images/90039330-b5d9-4eaa-80c0-3c6f4cd15fa6/student-avatar-1-1cee1aa3-1784558456374.webp",
  university: "",
  course: "",
  year: "",
  bio: "",
  phone: "",
  verified: false,
  is_verified: false,
  campus: "",
  followers_count: 0,
  following_count: 0,
});

const AppContext = createContext<AppContextType | null>(null);

const sampleMeetups: Meetup[] = [
  { id: "1", title: "Tech Hackathon 2025", description: "Build something amazing", category: "Tech", date: "2025-03-15", time: "10:00 AM", location: "Main Auditorium", host: "Tech Club", hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech", attendees: 45, maxAttendees: 100, rsvp: false },
  { id: "2", title: "Freshers' Party", description: "Welcome new students", category: "Social", date: "2025-03-20", time: "6:00 PM", location: "Student Center", host: "Student Council", hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=council", attendees: 120, maxAttendees: 200, rsvp: false },
  { id: "3", title: "Basketball Tournament", description: "Inter-department games", category: "Sports", date: "2025-03-25", time: "2:00 PM", location: "Sports Complex", host: "Sports Club", hostAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sports", attendees: 30, maxAttendees: 50, rsvp: false },
];

const sampleCampusConnect: CampusConnectProfile[] = [
  { id: "1", name: "Alice Johnson", age: 20, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice", university: "MIT", course: "Computer Science", clubs: ["Tech Club", "Dance"] },
  { id: "2", name: "Bob Smith", age: 21, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob", university: "MIT", course: "Mechanical Engineering", clubs: ["Robotics", "Sports"] },
];

const sampleCommunities: Community[] = [
  { id: "1", name: "Tech Enthusiasts", icon: "💻", description: "For all tech lovers", members: 234, unread: 3, messages: [] },
  { id: "2", name: "Music Lovers", icon: "🎵", description: "Share your playlists", members: 156, unread: 0, messages: [] },
];

const initialState: AppState = {
  meetups: sampleMeetups,
  campusConnect: sampleCampusConnect,
  communities: sampleCommunities,
  user: { mixerOptIn: false },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "TOGGLE_MIXER_OPTIN":
      return { ...state, user: { ...state.user, mixerOptIn: !state.user.mixerOptIn } };
    case "ADD_COMMUNITY_MESSAGE":
      return {
        ...state,
        communities: state.communities.map((c) =>
          c.id === action.payload.communityId
            ? { ...c, messages: [...c.messages, { id: Date.now().toString(), senderId: "me", senderName: "You", senderAvatar: "", text: action.payload.text, timestamp: new Date().toISOString(), isMine: true }] }
            : c
        ),
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, dispatch] = useReducer(appReducer, initialState);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      if (data) {
        setUser({
          id: data.id,
          name: data.full_name || "Student",
          avatar: data.avatar_url || defaultUser(userId).avatar,
          university: data.university || "",
          course: data.course || "",
          year: data.year_of_study || "",
          bio: data.bio || "",
          phone: data.phone || "",
          verified: data.is_verified || false,
          is_verified: data.is_verified || false,
          campus: data.campus || "",
          followers_count: 0,
          following_count: 0,
        });
      }
    } catch {
      setUser(defaultUser(userId));
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then((result) => {
      const session = result?.data?.session ?? null;
      if (session?.user) {
        setAuthUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: authData } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setAuthUser(null);
        setUser(null);
      }
    });

    return () => authData?.subscription?.unsubscribe();
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (authUser) await fetchProfile(authUser.id);
  }, [authUser, fetchProfile]);

  const toggleRsvp = useCallback((id: string) => {
    dispatch({ type: "TOGGLE_MIXER_OPTIN" });
  }, []);

  return (
    <AppContext.Provider value={{ user, authUser, loading, signOut, refreshProfile, state, toggleRsvp, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}