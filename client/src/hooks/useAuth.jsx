import pb from "../lib/pocketbase";

// Persist auth state across reloads
pb.authStore.loadFromCookie(document.cookie);

// Sync cookie on changes
pb.authStore.onChange(() => {
  document.cookie = pb.authStore.exportToCookie({ httpOnly: false });
});

export default pb;
