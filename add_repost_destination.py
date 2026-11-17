#!/usr/bin/env python3
"""Lets you repost a main-feed post into any group you've joined.

Run this on the page that ALREADY has the first patch (add_group_reposts.py).
Usage:  python add_repost_destination.py index.html
Writes index.v2.html and leaves your file untouched. Every edit must match
exactly once, otherwise nothing is written.
"""
import sys

src_path = sys.argv[1] if len(sys.argv) > 1 else "index.html"
html = open(src_path, encoding="utf-8").read()


def swap(old, new):
    global html
    n = html.count(old)
    if n != 1:
        sys.exit(f"Stopped: expected 1 match, found {n} for:\n{old}")
    html = html.replace(old, new)


# 1. "Post to" dropdown in the repost dialog
swap(
    '<div id="repostPreview" class="repost-box"></div>',
    '<label class="set-row" id="repostDestRow"><span>Post to</span><select id="repostDest"></select></label>\n'
    '    <div id="repostPreview" class="repost-box"></div>',
)

# 2. Remember the groups you belong to
swap(
    "let groupCtx = null, myGroupsUnsub = null;",
    "let groupCtx = null, myGroupsUnsub = null, myGroupList = [];",
)
swap(
    '.sort((a, b) => (a.name || "").localeCompare(b.name || ""));\n    if (!items.length)',
    '.sort((a, b) => (a.name || "").localeCompare(b.name || ""));\n    myGroupList = items;\n    if (!items.length)',
)
swap(
    "myGroupsUnsub = null; groupCtx = null;",
    "myGroupsUnsub = null; groupCtx = null; myGroupList = [];",
)

# 3. Mark reposts whose original lives in a group (it isn't in the main feed)
swap(
    'text: post.text || "" };\n  card.querySelector(".repost-btn")',
    'text: post.text || "", fromGroup: !!post.groupId };\n  card.querySelector(".repost-btn")',
)
swap(
    'style="${post.groupId ? "" : "cursor:pointer;"}"',
    'style="${rp.fromGroup ? "" : "cursor:pointer;"}"',
)
swap(
    'if (id && !post.groupId) location.hash = "#post-" + id;',
    'if (id && !rp.fromGroup) location.hash = "#post-" + id;',
)

# 4. Fill the dropdown when the dialog opens, and use its value on submit
swap(
    '  ta.value = ""; btn.textContent = "Repost"; btn.disabled = false;',
    '''  const dest = document.getElementById("repostDest"), destRow = document.getElementById("repostDestRow");
  dest.innerHTML = '<option value="">🌐 Main feed</option>';
  myGroupList.forEach(g => { const o = document.createElement("option"); o.value = g.id; o.textContent = "👥 " + (g.name || "Group"); dest.appendChild(o); });
  dest.value = "";
  // a repost of a group post always stays in that group
  destRow.style.display = groupId ? "none" : "flex";
  ta.value = ""; btn.textContent = "Repost"; btn.disabled = false;''',
)
swap(
    "await doRepost(orig, ta.value.trim().slice(0, 500), groupId);",
    "await doRepost(orig, ta.value.trim().slice(0, 500), groupId || dest.value || null);",
)

# 5. doRepost: carry the flag, and notify with a post link only when the original is in the main feed
swap(
    "repost: { id: orig.id, authorId: orig.authorId, authorName: orig.authorName, text: orig.text }",
    "repost: { id: orig.id, authorId: orig.authorId, authorName: orig.authorName, text: orig.text, ...(orig.fromGroup ? { fromGroup: true } : {}) }",
)
swap(
    'groupId ? null : orig.id);',
    "orig.fromGroup ? null : orig.id);",
)

out = src_path.rsplit(".", 1)[0] + ".v2.html"
open(out, "w", encoding="utf-8").write(html)
print("Done. Wrote", out)
