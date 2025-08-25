import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"
import imagekit from "../configs/imageKit.js"
import openai from "../configs/openai.js"

export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id
        // check creadits
        if (req.user.credits < 1) {
            return res.json({ success: false, message: "You don't have enough credits to use this features" })
        }
        const { chatId, prompt } = req.body

        const chat = await Chat.findOne({ userId, _id: chatId })
        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false })

        const { choices } = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const reply = { ...choices[0].message, timestamp: Date.now(), isImage: false }
        res.json({ success: true, reply })

        chat.messages.push(reply)
        await chat.save()
        await User.updateOne({ _id: userId }, { $inc: { credits: -1 } })

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


// Image Generation Message Controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id
        // check creadits
        if (req.user.credits < 2) {
            return res.json({ success: false, message: "You don't have enough credits to use this features" })
        }
        const { prompt, chatId, isPublished } = req.body

        // find the chat
        const chat = await Chat.findOne({ userId, _id: chatId })
        // push user message to chat
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        });

        // Encode the prompt to handle special characters
        const encodedPrompt = encodeURIComponent(prompt)

        // Construct ImageKit Ai generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/sinoai/${Date.now()}.png?tr=w-800, h-800`;
        // Fetch the generated image from ImageKit
        const aiImageResponse = await axios.get(generatedImageUrl, { responseType: "arraybuffer" })
        // Convert the image data to a base64 string
        const base64Image = `data:image/png;base64, ${Buffer.from(aiImageResponse.data, "binary").toString('base64')}`
        // Upload the image to ImageKit Media Library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "sinoai",
        });

        const reply = {
            role: 'assistant',
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        }
        res.json({ success: true, reply })

        // push the assistant reply to chat
        chat.messages.push(reply)

        await chat.save()

        // deduct 2 credits from user
        await User.updateOne({ _id: userId }, { $inc: { credits: -2 }})

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}