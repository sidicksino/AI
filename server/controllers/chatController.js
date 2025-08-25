import Chat from "../models/Chat.js"


// Ipa controller for creating a new chat
export const createChat = async (req, res) => {
    try {
        const userId = req.user._id
        const chatData = {
            userId,
            messages: [],
            name: "New Chat",
            userName: req.user.name
        }

        await Chat.create(chatData)
        res.json({ success: true, message: 'Chat created successfully' })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


// Ipa controller for getting all chats of a user
export const getChats = async (req, res) => {
    try {
        const userId = req.user._id
        const chats = await Chat.find({ userId }).sort({ updatedAt: -1 })

        res.json({ success: true, chats })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Ipa controller for deleting a chat
export const deleteChats = async (req, res) => {
    try {
        const userId = req.user._id
        const {chatId} = req.body

        await Chat.deleteOne({ _id: chatId, userId })

        res.json({ success: true, message: 'Chat deleted successfully' })
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
