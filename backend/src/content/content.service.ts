import Content from "./content.schema";
import userSchema from "../user/user.schema";
import { getChannel } from "../common/services/rabbitmq.service";
export const createContent = async (content: string, userId: string) => {
    const user = await userSchema.findById(userId);
    console.log("user", user);
    if (!user) throw new Error("User not found");

    const newContent = new Content({
        content,
    });

    await newContent.save();
    user.content.push(newContent.id);
    await user.save();
    return newContent;
};

export const getAllContent = async (userId: string) => {
    console.log("userId", userId);
    const user = await userSchema.findById(userId).populate('content');
    if (!user) throw new Error("User not found");

    return user.content;
};

export const getContentById = async (contentId: string, userId: string) => {
   const content = await Content.findById(contentId);
   if (!content) throw new Error("Content not found");

   return content;
}

export const updateContent = async (contentId: string, content: string, userId: string) => {
    const user = await userSchema.findById(userId);
    if (!user) throw new Error("User not found");

    const updatedContent = await Content.findByIdAndUpdate(contentId, { content }, { new: true });
    if (!updatedContent) throw new Error("Content not found");

    const channel = getChannel();
    if (!channel) {
        console.error("Failed to get channel");
        return updatedContent;
    }
       channel.sendToQueue(
            'embedding_jobs',
            Buffer.from(JSON.stringify({ contentId: updatedContent._id, userId }))
            );
       channel.close();

    return updatedContent;
}

export const deleteContent = async (contentId: string, userId: string) => {
    const user = await userSchema.findById(userId);
    if (!user) throw new Error("User not found");

    const deletedContent = await Content.findByIdAndDelete(contentId);
    if (!deletedContent) throw new Error("Content not found");

    return deletedContent;
}