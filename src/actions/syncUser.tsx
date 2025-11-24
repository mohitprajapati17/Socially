"use server";

import  {auth} from "@clerk/nextjs/server";
import {currentUser} from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

async function syncUser(){
    console.log("Syncing user");
    try{
        const {userId}= await auth()
        const user =await currentUser();
        
        if(!userId||!user){
            return;
        }

        const existingUser=await prisma.user.findUnique({
            where:{
                clerkId:userId,
            }
        })
        if(existingUser){
            console.log("User already exists");
            return existingUser;
        }
        const dbUser=await  prisma.user.create({
            data:{
                clerkId:userId,
                name:`${user.firstName||""} ${user.lastName||""}`,
                email:user.emailAddresses[0].emailAddress,
                image:user.imageUrl,
                username:user.username??user.emailAddresses[0].emailAddress.split("@")[0],
            }
        })
        console.log("User created");
        return dbUser;
    }
    catch(error){
        console.log("Error syncing user",error);
    }
}

export async function getUserByClerkId(clerkId:string){
    return prisma.user.findUnique({
        where:{
            clerkId:clerkId,
        },
        include:{
            _count:{
                select:{
                    posts:true,
                    followers:true,
                    following:true,
                    
                }
            }

        }

    })
}

export async function getDbUserId(){
    const {userId:clerkId}=await auth();
    if(!clerkId) return null;
    const user=await getUserByClerkId(clerkId);

    if(!user){
        throw new Error("user not found")
    }
    
    return user.id;
}

export default syncUser;
