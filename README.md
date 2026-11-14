# Qlix 2!

Welcome to Qlix 2, the all-new iteration of the Qlix Social Network. Currently this is in beta, so expect this to have some issues.

**Use it now:** https://oldsoultech.github.io/Qlix/

## Get the app

Qlix also runs in its own window as a desktop app:

- **Windows:** [Download Qlix.exe](https://github.com/oldsoultech/Qlix-Windows/releases/latest/download/Qlix.exe)
- **Mac:** [Download Qlix-mac.zip](https://github.com/oldsoultech/Qlix-Mac/releases/latest/download/Qlix-mac.zip)

The apps aren't code-signed yet, so your computer may show a warning the first time.
- **Windows:** click **More info → Run anyway**.
- **Mac:** unzip, then right-click `Qlix.app` and choose **Open** (or use **System Settings → Privacy & Security → Open Anyway**).

## What's new

### Feed
- **Pages of posts:** the feed loads 20 posts at a time, with a **Load more** button.
- **No more page jumps:** new posts appear at the top and deleted posts disappear without reloading the whole feed.
- **New posts button:** a "New posts ↑" button shows up when someone else posts while you're reading.
- **Following tab:** see only posts from people you follow.
- **Loading skeletons** replace the plain "Loading posts…" text.
- **Friendlier times:** "5m ago", "3h ago" and "Yesterday" instead of full dates.

### Posting and social
- **Likes** with a heart animation and a count.
- **Edit your posts.** Edited posts show "edited".
- **Hashtags:** `#tags` are clickable and open a feed for that tag. Only posts made after this update can be found by tag.
- **@mention suggestions:** type `@` and pick a user from the list, in posts and comments.
- **User search** in the sidebar.
- **Enter to send:** Enter posts or sends, and Shift+Enter adds a new line.
- **500-character limit** with a live counter, and the Post button disables while sending so nothing double-posts.
- **Report** button on other people's posts.

### Posts
- **Images:** attach a photo to a post (resized automatically).
- **Polls:** add a question with 2–4 options. One vote each, results show after you vote.
- **Reactions:** react with ❤️ 👍 😂 😮 😢 🔥, not just a heart, and see the mix on each post.
- **Emoji picker** in the post box.
- **Reposts** to share someone's post with your followers, and **Saved posts** (🔖) with their own tab.
- **Post links:** every post has a 🔗 link that opens it on its own. Click the time on a post to open it.
- **Pinned post:** pin one of your posts (📌) to the top of your profile.
- **Collab posts:** invite another user to co-author a post with 🤝 Collab. It appears on both profiles once they accept, and they can leave later.
- **Trending hashtags** in the sidebar, and **post search** (type in the search box and press Enter).

### Accounts and safety
- **Profile photo upload** instead of pasting a link.
- **Delete my account** (Edit Profile → bottom of the form).
- **Terms, Privacy Policy and Community Rules** (footer, and agreed to when registering).
- **Verified badges** ✔ and a **moderator panel** (🔨 Mod) for reviewing reports, deleting posts and banning accounts.

### App feel
- **Install it:** Qlix can be installed from the browser as an app on phones and computers, and shows an offline notice when your connection drops.
- **Desktop alerts** for new messages and notifications while Qlix is in the background (allow notifications when asked).
- **Accessibility:** keyboard navigation, visible focus outlines, screen reader labels, a skip link, and reduced-motion support.

### Notifications and messages
- **More notifications:** likes, replies and new followers, along with mentions and DMs.
- **Separate DM badge:** unread messages show on 💬 DMs, and the 🔔 badge counts everything else.
- **Typing indicator:** see "typing…" when the other person is writing to you.
- **Read receipts:** your latest message shows ✓ Sent or ✓✓ Seen.
- **Blocking:** block someone from their profile. You won't see their posts, comments or messages, and they can't message or notify you. Unblock any time from the same place.

### Look and feel
- **Dark mode:** toggle with 🌙 / ☀️ in the top bar. Your choice is remembered.
- **Toasts:** small messages like "Posted!" replace pop-up alerts.
- **Initial avatars:** users without a profile picture, or with a broken image link, get a colored circle with their initial.
- **Esc closes panels,** and clicking the dark background closes profile and sign-in windows.

### Accounts
- **Forgot password?** link on the sign-in form sends a reset email.

### Security
- Post, comment, DM, name and notification text is now escaped, so pasted HTML or scripts can't run in other people's browsers.

## Known issues
- Google sign-in may not work inside the desktop and Android apps. Email and password sign-in works everywhere.
- Notifications only arrive while Qlix is open or in the background. Push alerts when it's fully closed aren't supported yet.
- Images are stored inside posts, so very large or many images make the feed slower. Poll votes can't be changed.
- Blocking is one-way: a blocked person isn't told, and can still see your public posts.
- It's a beta, so please report anything that looks wrong.
