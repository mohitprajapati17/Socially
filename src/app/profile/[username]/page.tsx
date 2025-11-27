import React from 'react'
import { getProfileByUserName } from '@/actions/profile.action';
import { getUserPosts } from '@/actions/profile.action';
import { getUserLikedPosts } from '@/actions/profile.action';
import  {isFollowing} from '@/actions/profile.action';
import ProfilePageClient from './ProfilePageClient';
import { notFound } from 'next/navigation';
export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await getProfileByUserName(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.username}`,
    description: user.bio || `Check out ${user.username}'s profile.`,
  };
}
async function page({params}:{params:{username:string}}) {
    const user = await getProfileByUserName(params.username);

  if (!user) notFound();

  const [posts, likedPosts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    getUserLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ProfilePageClient
      user={user}
      posts={posts}
      likedPosts={likedPosts}
      isFollowing={isCurrentUserFollowing}
    />
  );
}

export default page