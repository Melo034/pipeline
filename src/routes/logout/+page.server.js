//@ts-check
import { redirect } from '@sveltejs/kit';
import { signOut } from '$lib/server/service/authUserService.js';

export const actions = {
  default: async ({ cookies, locals }) => {
    await signOut(locals.supabase);

    for (const token of ['access_token', 'refresh_token']) {
      cookies.set(token, '', {
        path: '/',
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
    }

    redirect(307, '/');
  },
};
