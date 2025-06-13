#!/usr/bin/env node

import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Import and start the server after environment is loaded
import('./server.js');