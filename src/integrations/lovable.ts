import { supabase } from "@/integrations/supabase/client";

export const lovable = {
  auth: {
    async signInWithOAuth(provider: string, opts: { redirect_uri: string }) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as "google",
        options: { redirectTo: opts.redirect_uri },
      });
      if (error) return { error: error.message, redirected: false };
      if (data?.url) {
        window.location.href = data.url;
        return { error: null, redirected: true };
      }
      return { error: null, redirected: false };
    },
  },
};
