import {AUTO_SAVE_COOKIE_KEY} from "shared/utils/Constants";

import {CircuitMetadata} from "core/models/CircuitMetadata";

import {AuthState} from "shared/api/auth/AuthState";

import {GetCookie, SetCookie} from "shared/utils/Cookies";
import {CreateState} from "shared/utils/CreateState";


const [initialState, actions, reducer] = CreateState()(
    {
        auth: undefined as AuthState,
        isLoggedIn: false,
        circuits: [] as CircuitMetadata[],
        loading: false,
        error: undefined as string,
        autoSave: (JSON.parse(GetCookie(AUTO_SAVE_COOKIE_KEY) || "false")) as boolean,
    },
    {
        SetAutoSave:        (autoSave: boolean) => ({ type: "SET_AUTOSAVE_ID",       autoSave }) as const,
        Logout:             ()                  => ({ type: "LOGOUT_ACTION_ID"                }) as const,
        _Login:             (auth: AuthState)   => ({ type: "LOGIN_ACTION_ID",       auth     }) as const,
        _LoadCircuitsStart: ()                  => ({ type: "LOAD_CIRCUITS_START_ID"          }) as const,
        _LoadCircuitsFinish: (circuits: CircuitMetadata[], err?: string) => (
            { type: "LOAD_CIRCUITS_FINISH_ID", circuits, err }
        ) as const,
    },
    {
        "SET_AUTOSAVE_ID":  (state, action) => {
            SetCookie(AUTO_SAVE_COOKIE_KEY, JSON.stringify(!state.autoSave));
            return { ...state, autoSave: action.autoSave };
        },
        "LOGOUT_ACTION_ID": (state) => {
            if (state.auth) state.auth.logOut();
            return { ...state, auth: undefined, isLoggedIn: false, circuits: [] };
        },
        "LOGIN_ACTION_ID": (state, action) => ({ ...state, auth: action.auth, isLoggedIn: true }),
        "LOAD_CIRCUITS_START_ID": (state) => {
            if (!state.auth)
                return { ...state, circuits: [], error: "MNot logged in!" };
            return { ...state, loading: true };
        },
        "LOAD_CIRCUITS_FINISH_ID": (state, action) => {
            if (!state.auth)
                return { ...state, circuits: [], loading: false, error: "MNot logged in!" };
            return { ...state, circuits: (action.circuits ?? []), error: action.err, loading: false };
        },
    }
);

export type UserInfoState = typeof initialState;
export const {SetAutoSave, Logout, _Login, _LoadCircuitsStart, _LoadCircuitsFinish} = actions;
export const userInfoReducer = reducer;
