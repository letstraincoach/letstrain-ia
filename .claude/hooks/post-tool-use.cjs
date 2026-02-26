#!/usr/bin/env node
'use strict';

/**
 * PostToolUse hook — captures tool results after execution.
 * Reads JSON from stdin, logs the result summary, and exits.
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
            // Process completed — no action needed by default
            process.exit(0);
        } catch {
            process.exit(0);
        }
    });
}

main();
