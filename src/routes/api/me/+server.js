
import { getProfile } from '$lib/server/repo/userProfileRepo.js';
import { json } from '@sveltejs/kit';

export async function GET({ request, locals }) {
  let authUser = locals.authUser;
  let supabase = locals.supabase;

  const profile = await getProfile(authUser.id, supabase);

  const user = {
    id: authUser.id,
    email: authUser.email,
    display_name: profile.name,
    bio: profile.bio,
    country: profile.country,
    interests: profile.interests,
    skills: profile.skills,
    image_url: profile.image,
    points: profile.points,
    banner_url: profile.banner,
    github: profile.github,
    discord: profile.discord,
    twitter: profile.twitter,
    website: profile.web,
  };

  return json({ user }, { status: 200 });
}
