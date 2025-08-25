import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light'); // change ('light') to ('theme')

    const fetchUser = async () => {
        setUser(dummyUserData);
    };

    const fetchUsersChats = async () => {
        setChats(dummyChats);
        setSelectedChat(dummyChats[0]);
    };

    // Gestion du thème
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Charger les chats lorsque l'utilisateur change
    useEffect(() => {
        if (user) {
            fetchUsersChats();
        } else {
            setChats([]);
            setSelectedChat(null);
        }
    }, [user]);

    // Charger l'utilisateur au montage
    useEffect(() => {
        fetchUser();
    }, []);

    // useMemo pour rendre l'objet stable et compatible HMR
    const value = useMemo(() => ({
        navigate,
        fetchUser,
        user,
        setUser,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        theme,
        setTheme
    }), [navigate, user, chats, selectedChat, theme]);

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// Hook stable pour accéder au context
export const useAppContext = () => useContext(AppContext);
