# Connect Tempo to Executor

Executor can use Tempo's Streamable HTTP MCP source to read and update your tasks, notes, calendar, and daily plan. The connection uses a personal Tempo token that you can revoke at any time.

## Before you start

You need an approved Tempo account and access to **Settings → Integrations**. Treat every Tempo MCP token like a password: never paste one into a chat, ticket, screenshot, document, or source-control commit.

## Add Tempo as an MCP source

1. In Tempo, open **Settings → Integrations** and find **Connect an AI assistant (MCP)**.
2. Enter a token name such as `Executor`, then select **Create token**.
3. Copy the token immediately. Tempo shows the complete token only once.
4. Under **Connect Executor**, select **Copy Executor setup**. The copied text has this shape:

   ```text
   Tempo MCP source
   Source type: Streamable HTTP
   URL: https://<your Tempo host>/api/mcp
   Header: Authorization: Bearer <paste your token>
   ```

5. In Executor, add a new MCP source and choose **Streamable HTTP** as its source type.
6. Paste the Tempo endpoint into the URL field. Add an `Authorization` header whose value is `Bearer ` followed by the token you copied in step 3. Replace the placeholder; do not include angle brackets.
7. Save and connect the source.

If browser clipboard access is unavailable, Tempo displays the setup in a read-only box so you can select and copy it manually.

## Check the connection

Open the Tempo source in Executor and refresh or list its tools. You should see **12 tools** after TEMPO-N2-05 is available, or **11 tools** before that update. If no tools appear, confirm that the source type is Streamable HTTP, the URL ends in `/api/mcp`, and the authorization value begins with `Bearer `.

Try prompts such as:

- "Add a task to call the bank tomorrow."
- "What's on my plan today?"

Review Executor's proposed tool calls before approving changes.

## Use Tempo next to Basic Memory

Tempo and Basic Memory can coexist in the same Executor workspace. Add each one as its own MCP source:

- Keep **Basic Memory** connected to its existing source for its files and knowledge.
- Keep **Tempo** connected to the Streamable HTTP URL above for tasks, notes, calendar events, and plans.

The sources remain separate. Tempo never reads Basic Memory's files. When a request could apply to either source, name the source in your prompt—for example, "Add this as a Tempo task" or "Save this in Basic Memory."

## Revoke access

In Tempo, return to **Settings → Integrations** and select **Revoke** next to the Executor token. Executor's next request with that token will be rejected. Create a new token and update the Executor source if you want to reconnect it.

Revoke the token immediately if you pasted it into a chat or ticket, included it in a screenshot, committed it, or otherwise exposed it. Do not reuse an exposed token.

## Safety rules

- A Tempo MCP token is a password. Store it only in Executor's protected MCP source configuration.
- Never paste a token into chats, support requests, tickets, documentation, or source control.
- Use a separate named token for each client so you can revoke one connection without disrupting another.
- Review tool calls before approval, especially calls that create or update data.
