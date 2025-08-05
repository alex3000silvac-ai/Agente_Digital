#!/bin/bash
echo "Haciendo backup..."
git add .
git commit -m "Auto backup $(date '+%Y-%m-%d %H:%M:%S')"
echo "Backup completado!"