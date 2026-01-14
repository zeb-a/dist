# PocketBase Collections Migration Instructions

## Overview
This document provides instructions for migrating your local PocketBase collections to the remote instance at `https://pocketbase-production-edf2.up.railway.app/_/#/login`

## Collections to Migrate

Based on your local schema (`pb_schema.json`), you have the following collections to recreate:

### 1. Users Collection
- **Name**: `users`
- **Type**: `auth`
- **Fields**:
  - `email` (text, required, unique)
  - `name` (text)
  - `avatar` (text)

### 2. Behaviors Collection
- **Name**: `behaviors`
- **Type**: `base`
- **Fields**:
  - `label` (text, required)
  - `pts` (number)
  - `type` (text)
  - `icon` (text)

### 3. Classes Collection
- **Name**: `classes`
- **Type**: `base`
- **Fields**:
  - `name` (text, required)
  - `teacher` (text, required)
  - `students` (json)
  - `tasks` (json)
  - `submissions` (json)
  - `student_submissions` (json)

## Manual Migration Steps

1. Go to the remote PocketBase admin interface: `https://pocketbase-production-edf2.up.railway.app/_/#/login`
2. Log in with your credentials (mikemu81@icloud.com / bisxo2-vibsoK-fugtuk)
3. Navigate to "Collections" in the sidebar
4. Click "Create new collection" and follow the schema above for each collection

## Updated URLs

All references to local URLs have been updated in the codebase:
- `http://localhost:4002` → `https://pocketbase-production-edf2.up.railway.app/`
- `http://127.0.0.1:4002` → `https://pocketbase-production-edf2.up.railway.app/`

Files updated:
- `/workspace/server/index.js`
- `/workspace/setup-pb.py`
- `/workspace/setup-pocketbase.sh`
- `/workspace/src/services/api.js`
- `/workspace/vite.config.js`

## Next Steps

After creating the collections in the remote PocketBase instance:

1. You can now deploy your application with the updated configuration
2. The frontend will connect to the remote PocketBase instance
3. Any existing data will need to be manually transferred via the admin interface or API calls