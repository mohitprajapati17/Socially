"use server";

import  {auth} from "@clerk/nextjs/server";
import {currentUser} from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {revalidatePath} from "next/cache";

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

export async function getRandomUsers(){
    try{
        const userId=await getDbUserId();
        if(!userId) return [];

        // get threee random users  exclude ourselves  &  users that we already follow
        const Randomusers=await prisma.user.findMany({
            where:{
               AND:[
                {NOT:{id:userId}},
                {NOT:{
                    followers:{
                        some:{
                            followerId:userId,
                        }
                    }
                }}
               ]
            },
            select:{
                id:true,
                name:true,
                username:true,
                image:true,
                _count:{
                    select:{
                        followers:true
                    },
                },
            },
            take:3,
        })
        return Randomusers;
    }
    catch(error){
        console.log("Error getting random users",error);
        return [];
    }

}

export async function toggleFollow(targetUserId:string){
    try{
        const userId=await getDbUserId();
        if(!userId) return;

        if(userId===targetUserId) throw new Error("Cannot follow yourself");

        const existingFollow=await prisma.follows.findUnique({
            where:{
                followerId_followingId:{
                    followerId:userId,
                    followingId:targetUserId,
                }
            }
        })

        if(existingFollow){
            await prisma.follows.delete({
                where:{
                    followerId_followingId:{
                        followerId:userId,
                        followingId:targetUserId,
                    }
                }
            })
        }
        else{
            // follow
            await prisma.$transaction([
                prisma.follows.create({
                    data:{
                        followerId:userId,
                        followingId:targetUserId,


                    },
                    
                }),
                prisma.notification.create({
                    data:{
                        type:"FOLLOW",
                        userId:targetUserId,
                        creatorId:userId,   


                    }
                })

            ])
        }
        revalidatePath("/");
        return {success:true};

    }
    catch(error){
        console.log("error in toggle Follow ",error);
        return {success:false};
    }
}


export default syncUser;
