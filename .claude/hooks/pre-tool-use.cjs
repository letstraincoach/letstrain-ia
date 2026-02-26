#!/usr/bin/env node
'use strict';

/**
 * PreToolUse hook — captures tool calls before execution.
 * Reads JSON from stdin, logs the tool name, and exits with 0 to allow.
 */

const fs = require('fs');

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    try {
      const data = JSON.parse(input);
      const toolName = data.tool_name || 'unknown';
      // Allow all tools by default
      process.exit(0);
    } catch {
      process.exit(0);
    }
  });
}

main();
