"use server"
import {getDbUserId} from "./syncUser";
import prisma from "@/lib/prisma";
import {revalidatePath} from "next/cache";
export async function createPost(content:string , imageUrl:string){
    try{
        const userId  =await  getDbUserId();
        if(!userId) return;
        const post =await prisma.post.create({
            data:{
                content,
                image:imageUrl,
                authorId:userId,
            }
        })
        revalidatePath("/");
        return {success:true,post};

    }
    catch(error){
        console.log("Error creating post",error);
        return {success:false, error: "Failed to create post" };
    }

}