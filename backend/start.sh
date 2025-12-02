#!/bin/bash
cd "$(dirname "$0")"
export NODE_ENV=development
pnpm run dev
