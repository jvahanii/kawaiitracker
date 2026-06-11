# User Guide

This is the user guide for Keywi. The app is a multi-tenant savings and income tracker where workspace members can plan, record, and follow their savings together.

## 1. Getting started

### Sign up
1. Open the landing page and choose **Sign up**.
2. Enter your name, email, and a password (8+ characters).
3. Confirm with **Create account**.

### Log in
1. From the landing page, choose **Log in**.
2. Enter your email and password.
3. Tick **Remember me** to keep the session on this device.

### Reset password
- On the login page choose **Forgot password?** and enter your email.
- You will receive a one-time reset link by email.
- Use the link to set a new password.

### Change language
Use the language switcher in the top corner to switch between Finnish (FI) and English (EN). The choice is stored in your browser.

### Change currency
The workspace view has a **Currency** picker at the top. The selected currency drives how the goal, the savings table, the chart, and the monthly entries are displayed. Values are always stored internally in EUR and converted for display. When you type a value (goal, monthly entry), the input is interpreted in the **selected currency** and converted to EUR for storage.

## 2. Workspaces

### Create a workspace
1. After your first login you are taken to the **Get started** page.
2. Name the workspace (e.g. "Household") and press **Create**.
3. You become the workspace **admin** automatically.

### Join an existing workspace
1. Ask the workspace admin for an 8-character join code.
2. On Get started, type the code into the field and press **Join**.

### Switch between workspaces
The top bar shows the current workspace. You can create a new workspace with **+ Workspace**.

## 3. Savings and income (end user)

### Create a savings or income entry
- In the left panel, use the **New savings or income title…** field, type a name and press Enter.
- Use the search field to find existing entries.

### Edit an entry
Pick an entry from the list. On the right you can:
- Edit the title by clicking it.
- Add notes in the **Notes…** field.
- Assign one or more **assignees** from workspace members.
- Delete the entry with the **Delete** button.

### Folders
Entries can be organized into folders and subfolders.
- Create a new folder with **New folder**.
- Add a subfolder under an existing folder.
- Rename or delete a folder. Deleted folders' entries move to **Uncategorized**.
- Reorder by dragging.

### Monthly entries
Each entry has a **Monthly entries** section.
- **Add month** appends the next month.
- Each month has two values: **Planned** and **Actual**.
- Values are shown in the selected currency and stored in EUR.
- You can edit individual months and the totals. Editing a total spreads the value evenly across 12 months.

### Goal
- Set a **Goal** amount and **Target date**.
- The app shows how many days remain to the target.
- When the currency changes, the goal is shown converted; new input is interpreted in the selected currency.

### Savings breakdown (chart)
The **Savings breakdown** chart can be grouped:
- **By item** or **By assignee**
- Compared as **Actual / Plan**

### Save status
The top of the view shows a status indicator: **Saving…**, **Saved**, or **Unsaved changes**. Changes are saved automatically.

## 4. Admin features

### Invite users with a join code
The **Join code** in the top bar is click-to-copy. Share it with someone you want to invite. They can sign up and enter the code on the Get started page.

### Add a user by email
1. Open the **Users** page.
2. Use the **Add user by email** form.
3. If the user already has an account, they are added directly. Otherwise an invite email is sent.

### Role management
Each member is either an **Admin** or a **Member**. Admins can:
- Invite and remove users
- Change other members' roles (not another admin's role)
- Manage folder visibility
- Read the audit log

A workspace must always have at least one admin.

### Remove a user
On the Users page, **Remove** removes the user from the workspace after confirmation.

### Folder visibility
A folder's **Visibility** setting lets you restrict which members can see the folder and its entries. Admins always have access. Subfolders inherit unless they have their own restriction.

### Audit log
The **Audit log** page lists workspace changes in chronological order: who made the change, what entry, and when.

### Free plan user limit
A workspace on the free plan can have up to **4 members**. When the limit is reached, pressing **Add user** opens a dialog with two options:
- **Ok** — closes the dialog.
- **Contact me for a paid plan** — sends a request to the Keywi team. The dialog closes and your interest is recorded. Superusers see your request in the Users view (see below).

Superusers bypass this limit entirely and can keep adding members.

## 5. Superuser features

A superuser has system-wide privileges.

### Other users
On the Users page, a superuser sees an **Other users** section listing every user across every workspace.

### Manage roles and memberships
A superuser can:
- Change a user's role in any workspace
- Remove a user from a workspace
- Grant or revoke superuser privileges

### Paid plan requests
When a non-superuser hits the free member limit and clicks **Contact me for a paid plan**, a request is logged for that user. On the Users page, superusers see an amber **Paid plan requested** badge next to the user's name (both in the members list and in **Other users**), along with the time of the latest request.

### Safeguards
- You cannot revoke your own superuser role if you are the last superuser — grant the role to someone else first.
- Revoking your own superuser role requires confirmation.

## 6. Tips

- **Click to edit**: most fields can be edited inline by clicking.
- **Drag to reorder**: list order can be changed by dragging.
- **Quick copy join code**: click the code at the top of the workspace view to copy.
- **Auto-save**: changes save automatically; watch the save status indicator.
- **Currency**: all values are stored in EUR, so changing the currency does not alter stored data — only how it is displayed.
